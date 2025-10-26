import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { prisma } from '../lib/db';
import { adapters } from '../services/ingest/adapters';
import { youtubeClient } from '../lib/youtube';
import { twitterBot } from '../services/social/twitter-bot';
import { getAffiliateLink, addUTMParams } from '../lib/affiliate';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// Define queues
export const priceUpdateQueue = new Queue('price-update', { connection });
export const mediaFetchQueue = new Queue('media-fetch', { connection });
export const trendAnalysisQueue = new Queue('trend-analysis', { connection });
export const socialPostQueue = new Queue('social-post', { connection });

// Price Update Worker
const priceUpdateWorker = new Worker(
  'price-update',
  async (job: Job) => {
    console.log(`[PriceUpdate] Processing job ${job.id}`);
    
    const products = await prisma.product.findMany({
      include: { offers: true },
      take: 50,
    });

    let updated = 0;
    for (const product of products) {
      for (const offer of product.offers) {
        // Check if price changed (mock logic)
        const priceChanged = Math.random() < 0.1;
        
        if (priceChanged) {
          const newPrice = offer.price * (0.95 + Math.random() * 0.1);
          
          await prisma.priceHistory.create({
            data: {
              productId: product.id,
              vendor: offer.vendor,
              price: newPrice,
            },
          });

          await prisma.offer.update({
            where: { id: offer.id },
            data: {
              price: newPrice,
              asOfTimestamp: new Date(),
            },
          });

          updated++;

          // Create deal post if significant drop
          if (newPrice < offer.price * 0.95) {
            const dropPercent = ((offer.price - newPrice) / offer.price) * 100;
            
            await prisma.dealPost.create({
              data: {
                productId: product.id,
                title: `${dropPercent.toFixed(0)}% off ${product.title}`,
                dealType: 'price_drop',
                priority: Math.min(10, Math.floor(dropPercent)),
                status: 'pending',
              },
            });
          }
        }
      }
    }

    return { updated };
  },
  { connection }
);

// Media Fetch Worker
const mediaFetchWorker = new Worker(
  'media-fetch',
  async (job: Job) => {
    console.log(`[MediaFetch] Processing job ${job.id}`);
    
    const { productId, searchQuery } = job.data;
    const product = await prisma.product.findUnique({ where: { id: productId } });
    
    if (!product) {
      throw new Error('Product not found');
    }

    const videos = await youtubeClient.search(searchQuery || product.title, 3);
    
    for (const video of videos) {
      await prisma.mediaAsset.upsert({
        where: { id: `youtube-${video.id}` },
        update: {
          title: video.title,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration,
          viewCount: video.viewCount,
        },
        create: {
          id: `youtube-${video.id}`,
          productId: product.id,
          type: 'video',
          provider: 'youtube',
          providerId: video.id,
          title: video.title,
          thumbnailUrl: video.thumbnailUrl,
          embedUrl: youtubeClient.getEmbedUrl(video.id),
          duration: video.duration,
          viewCount: video.viewCount,
        },
      });
    }

    return { fetched: videos.length };
  },
  { connection }
);

// Trend Analysis Worker
const trendAnalysisWorker = new Worker(
  'trend-analysis',
  async (job: Job) => {
    console.log(`[TrendAnalysis] Processing job ${job.id}`);
    
    const products = await prisma.product.findMany({
      include: {
        priceHistory: {
          orderBy: { timestamp: 'desc' },
          take: 30,
        },
        mediaAssets: true,
      },
    });

    let signalsCreated = 0;

    for (const product of products) {
      // Price velocity signal
      if (product.priceHistory.length >= 2) {
        const recent = product.priceHistory[0];
        const older = product.priceHistory[product.priceHistory.length - 1];
        const priceChange = ((recent.price - older.price) / older.price) * 100;

        if (Math.abs(priceChange) > 5) {
          await prisma.trendSignal.create({
            data: {
              productId: product.id,
              signalType: priceChange < 0 ? 'price_drop' : 'velocity',
              score: Math.min(10, Math.abs(priceChange)),
              metadata: JSON.stringify({
                priceChange: priceChange.toFixed(2),
                oldPrice: older.price,
                newPrice: recent.price,
              }),
            },
          });
          signalsCreated++;
        }
      }

      // Media spike signal
      if (product.mediaAssets.length > 0) {
        const totalViews = product.mediaAssets.reduce((sum, m) => sum + (m.viewCount || 0), 0);
        
        if (totalViews > 50000) {
          await prisma.trendSignal.create({
            data: {
              productId: product.id,
              signalType: 'media_spike',
              score: Math.min(10, totalViews / 10000),
              metadata: JSON.stringify({
                videoCount: product.mediaAssets.length,
                totalViews,
              }),
            },
          });
          signalsCreated++;
        }
      }
    }

    return { signalsCreated };
  },
  { connection }
);

// Social Post Worker
const socialPostWorker = new Worker(
  'social-post',
  async (job: Job) => {
    console.log(`[SocialPost] Processing job ${job.id}`);
    
    const { dealPostId } = job.data;
    const dealPost = await prisma.dealPost.findUnique({
      where: { id: dealPostId },
      include: {
        product: {
          include: {
            offers: {
              orderBy: { price: 'asc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!dealPost || !dealPost.product.offers[0]) {
      throw new Error('Deal post or offer not found');
    }

    const offer = dealPost.product.offers[0];
    const affiliateUrl = getAffiliateLink(offer.vendor, offer.url, dealPost.product.asin || undefined);
    const finalUrl = addUTMParams(affiliateUrl, {
      source: 'twitter',
      campaign: `deal_${dealPost.id}`,
    });

    const tweetContent = await twitterBot.composeDealTweet({
      productTitle: dealPost.product.title,
      price: offer.price,
      vendor: offer.vendor,
      dealUrl: finalUrl,
      dealType: dealPost.dealType,
    });

    const result = await twitterBot.postTweet({ content: tweetContent });

    const socialPost = await prisma.socialPost.create({
      data: {
        dealPostId: dealPost.id,
        platform: 'twitter',
        content: tweetContent,
        status: result.success ? 'posted' : 'failed',
        externalId: result.tweetId,
        postedAt: result.success ? new Date() : null,
        metadata: JSON.stringify({ error: result.error }),
      },
    });

    if (result.success) {
      await prisma.dealPost.update({
        where: { id: dealPost.id },
        data: { status: 'published', publishedAt: new Date() },
      });
    }

    return { success: result.success, socialPostId: socialPost.id };
  },
  { connection }
);

// Schedule recurring jobs
async function scheduleRecurringJobs() {
  // Price updates every hour
  await priceUpdateQueue.add(
    'hourly-price-update',
    {},
    {
      repeat: {
        pattern: '0 * * * *', // Every hour
      },
    }
  );

  // Trend analysis every 6 hours
  await trendAnalysisQueue.add(
    'trend-analysis',
    {},
    {
      repeat: {
        pattern: '0 */6 * * *',
      },
    }
  );

  console.log('✅ Scheduled recurring jobs');
}

// Start workers
console.log('🚀 Starting job workers...');
scheduleRecurringJobs().catch(console.error);

console.log('✅ Workers ready:');
console.log('  - Price Update Worker');
console.log('  - Media Fetch Worker');
console.log('  - Trend Analysis Worker');
console.log('  - Social Post Worker');

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down workers...');
  await priceUpdateWorker.close();
  await mediaFetchWorker.close();
  await trendAnalysisWorker.close();
  await socialPostWorker.close();
  await connection.quit();
  process.exit(0);
});
