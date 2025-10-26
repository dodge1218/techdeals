import { Worker } from 'bullmq';
import { db } from '@/lib/db';
import { getLLMProvider } from '@/lib/llm-provider';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const priceCheckWorker = new Worker(
  'price-check',
  async (job) => {
    const { productId } = job.data;
    console.log(`[Price Check] Checking prices for product ${productId}`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { productId, checked: true, mockMode: true };
  },
  { connection }
);

export const articleWriterWorker = new Worker(
  'article-writer',
  async (job) => {
    const { productIds, niche, title } = job.data;
    console.log(`[Article Writer] Generating article for ${productIds.length} products`);
    
    const llm = getLLMProvider();
    const content = await llm.complete(
      `Write article about products: ${productIds.join(', ')}`
    );
    
    return { generated: true, content };
  },
  { connection }
);

export const trendFinderWorker = new Worker(
  'trend-finder',
  async (job) => {
    console.log('[Trend Finder] Analyzing trends...');
    
    const recentDeals = await db.deal.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      include: { product: true },
    });
    
    return { analyzed: recentDeals.length, mockMode: true };
  },
  { connection }
);

export const socialPostWorker = new Worker(
  'social-post',
  async (job) => {
    const { content, platform } = job.data;
    console.log(`[Social Post] Posting to ${platform}: ${content.substring(0, 50)}...`);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { posted: true, platform, mockMode: true };
  },
  { connection }
);
