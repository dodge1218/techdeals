import { prisma } from '@/lib/db';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

export default async function HomePage() {
  const trendingProducts = await prisma.product.findMany({
    take: 8,
    include: {
      offers: {
        orderBy: { price: 'asc' },
        take: 1,
      },
      trendSignals: {
        orderBy: { detectedAt: 'desc' },
        take: 1,
      },
      mediaAssets: {
        where: { type: 'video' },
        take: 2,
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h1 className="text-4xl font-bold mb-4">🔥 Trending Tech Deals</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Discover the best deals on crypto miners, PC parts, phones & gaming gear
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {trendingProducts.map((product) => {
          const bestOffer = product.offers[0];
          const signal = product.trendSignals[0];

          return (
            <div
              key={product.id}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {product.imageUrl && (
                <div className="relative h-48 bg-muted">
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold line-clamp-2 mb-2">{product.title}</h3>
                
                {signal && (
                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                      {signal.signalType.replace('_', ' ')} · {signal.score.toFixed(1)}/10
                    </span>
                  </div>
                )}

                {bestOffer && (
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">
                        ${bestOffer.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        as of {formatDistanceToNow(bestOffer.asOfTimestamp)} ago
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`/products/${product.id}`}
                        className="flex-1 text-center px-4 py-2 bg-secondary hover:bg-secondary/80 rounded text-sm font-medium"
                      >
                        View Deal
                      </a>
                    </div>
                  </div>
                )}

                {product.mediaAssets.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-1">
                      📹 {product.mediaAssets.length} review video{product.mediaAssets.length > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <section className="mt-16 p-8 bg-muted rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Why TechDeals?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold mb-2">🎯 Real-Time Tracking</h3>
            <p className="text-sm text-muted-foreground">
              We monitor prices across Amazon, Best Buy, and Newegg 24/7
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">📹 Video Reviews</h3>
            <p className="text-sm text-muted-foreground">
              Watch expert reviews and unboxings right on the product page
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">📊 Trend Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Our algorithm spots hot deals before they sell out
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
