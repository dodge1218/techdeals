import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { buildAffiliateLink, getPriceTimestampLabel, isPriceStale, getAmazonDisclosure } from '@/lib/affiliate';
import { searchVideos } from '@/lib/adapters/youtube';
import { VideoEmbed } from '@/components/products/VideoEmbed';
import { DealCard } from '@/components/products/DealCard';
import { PriceChart } from '@/components/products/PriceChart';

const prisma = new PrismaClient();

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      deals: {
        where: { isActive: true },
        orderBy: { price: 'asc' },
      },
      priceHistory: {
        orderBy: { timestamp: 'desc' },
        take: 30,
      },
      mediaAssets: {
        where: { platform: 'youtube' },
        orderBy: { viewCount: 'desc' },
        take: 6,
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Fetch YouTube videos if none cached
  let videos = product.mediaAssets;
  if (videos.length === 0) {
    const searchQuery = `${product.brand} ${product.model} review`;
    const youtubeResults = await searchVideos({ query: searchQuery, maxResults: 6 });
    
    // Cache videos in database (fire and forget)
    youtubeResults.forEach(async (video) => {
      try {
        await prisma.mediaAsset.upsert({
          where: { platform_externalId: { platform: 'youtube', externalId: video.id } },
          create: {
            platform: 'youtube',
            externalId: video.id,
            title: video.title,
            description: video.description,
            thumbnailUrl: video.thumbnailUrl,
            channelName: video.channelName,
            duration: parseInt(video.duration?.replace(/\D/g, '') || '0'),
            viewCount: video.viewCount,
            likeCount: video.likeCount,
            url: video.url,
            embedUrl: video.embedUrl,
            publishedAt: new Date(video.publishedAt),
            productId: product.id,
          },
          update: {
            viewCount: video.viewCount,
            likeCount: video.likeCount,
          },
        });
      } catch (error) {
        console.error('Failed to cache video:', error);
      }
    });

    videos = youtubeResults.map(v => ({
      id: v.id,
      productId: product.id,
      articleId: null,
      platform: 'youtube' as const,
      externalId: v.id,
      title: v.title,
      description: v.description,
      thumbnailUrl: v.thumbnailUrl,
      channelName: v.channelName,
      duration: parseInt(v.duration?.replace(/\D/g, '') || '0'),
      viewCount: v.viewCount || 0,
      likeCount: v.likeCount || 0,
      url: v.url,
      embedUrl: v.embedUrl,
      publishedAt: new Date(v.publishedAt),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  const specs = product.specs ? JSON.parse(product.specs) : {};
  const lowestDeal = product.deals[0];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Product Header */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.imageAltText || product.title}
              className="w-full rounded-lg shadow-lg"
            />
          )}
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-2">{product.brand}</div>
          <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
          
          {product.description && (
            <p className="text-gray-700 mb-6">{product.description}</p>
          )}

          {/* Price & Deals */}
          {lowestDeal && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
              <div className="text-sm text-green-700 font-semibold mb-1">BEST PRICE</div>
              <div className="text-4xl font-bold text-green-900 mb-2">
                ${lowestDeal.price.toFixed(2)}
              </div>
              {lowestDeal.originalPrice && (
                <div className="text-lg text-gray-500 line-through mb-2">
                  ${lowestDeal.originalPrice.toFixed(2)}
                </div>
              )}
              {lowestDeal.discount && (
                <div className="text-green-700 font-semibold mb-3">
                  Save {lowestDeal.discount}%
                </div>
              )}
              <div className="text-xs text-gray-500 mb-4">
                {getPriceTimestampLabel(lowestDeal.lastVerified)}
                {isPriceStale(lowestDeal.lastVerified) && (
                  <span className="ml-2 text-orange-600 font-semibold">⚠ Price may have changed</span>
                )}
              </div>
              <a
                href={buildAffiliateLink(lowestDeal.retailer, lowestDeal.url, 'product-page', 'cta-button')}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block w-full bg-green-600 hover:bg-green-700 text-white text-center font-bold py-3 px-6 rounded-lg transition"
              >
                View Deal at {lowestDeal.retailer}
              </a>
              {!lowestDeal.inStock && (
                <div className="mt-3 text-sm text-orange-600 font-semibold">
                  ⚠ May be out of stock - check retailer
                </div>
              )}
            </div>
          )}

          {/* Specs */}
          {Object.keys(specs).length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-3">Specifications</h3>
              <dl className="space-y-2">
                {Object.entries(specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <dt className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</dt>
                    <dd className="font-semibold text-right">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Videos Section */}
      {videos.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Video Reviews & Guides</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <VideoEmbed key={video.id} video={video} />
            ))}
          </div>
        </section>
      )}

      {/* All Deals */}
      {product.deals.length > 1 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Compare Prices</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {product.deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        </section>
      )}

      {/* Price History */}
      {product.priceHistory.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Price History (30 Days)</h2>
          <PriceChart history={product.priceHistory} />
        </section>
      )}

      {/* Disclosure */}
      <div className="border-t pt-6 text-sm text-gray-600">
        <p>{getAmazonDisclosure()}</p>
        <p className="mt-2">
          Prices and availability are subject to change. We make every effort to keep pricing information current, 
          but we cannot guarantee 100% accuracy. Please verify final price on the retailer's website.
        </p>
      </div>
    </div>
  );
}
