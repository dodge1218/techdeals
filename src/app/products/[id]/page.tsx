import { prisma } from '@/lib/db';
import { getAffiliateLink, addUTMParams } from '@/lib/affiliate';
import { formatDistanceToNow } from 'date-fns';
import { notFound } from 'next/navigation';
import Image from 'next/image';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      offers: {
        orderBy: { price: 'asc' },
      },
      priceHistory: {
        orderBy: { timestamp: 'desc' },
        take: 30,
      },
      mediaAssets: {
        where: { type: 'video' },
      },
      trendSignals: {
        orderBy: { detectedAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div>
          {product.imageUrl && (
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              <Image src={product.imageUrl} alt={product.title} fill className="object-cover" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            <span className="text-sm text-muted-foreground">{product.category}</span>
            {product.brand && (
              <span className="text-sm text-muted-foreground"> • {product.brand}</span>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          {product.description && <p className="text-muted-foreground mb-6">{product.description}</p>}

          {/* Offers */}
          <div className="space-y-4 mb-6">
            <h2 className="text-xl font-semibold">Available Offers</h2>
            {product.offers.map((offer) => {
              const affiliateUrl = offer.affiliateLink || getAffiliateLink(offer.vendor, offer.url, product.asin || undefined);
              const finalUrl = addUTMParams(affiliateUrl, { campaign: 'product_page' });

              return (
                <div key={offer.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-lg capitalize">{offer.vendor}</span>
                    {offer.inStock ? (
                      <span className="text-green-600 text-sm">✓ In Stock</span>
                    ) : (
                      <span className="text-destructive text-sm">Out of Stock</span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-bold">${offer.price.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground">
                      as of {formatDistanceToNow(offer.asOfTimestamp)} ago
                    </span>
                  </div>
                  <a
                    href={finalUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="block w-full text-center px-6 py-3 bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90"
                  >
                    View on {offer.vendor.charAt(0).toUpperCase() + offer.vendor.slice(1)}
                  </a>
                </div>
              );
            })}
          </div>

          {/* Trend Signals */}
          {product.trendSignals.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">📊 Trend Signals</h3>
              <div className="space-y-2">
                {product.trendSignals.map((signal) => (
                  <div key={signal.id} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{signal.signalType.replace('_', ' ')}</span>
                    <span className="font-semibold">{signal.score.toFixed(1)}/10</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Section */}
      {product.mediaAssets.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">📹 Video Reviews & Guides</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {product.mediaAssets.map((media) => (
              <div key={media.id} className="border rounded-lg overflow-hidden">
                <div className="relative aspect-video">
                  <iframe
                    src={media.embedUrl || ''}
                    title={media.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm line-clamp-2">{media.title}</h3>
                  {media.viewCount && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {media.viewCount.toLocaleString()} views
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Price History Chart Placeholder */}
      {product.priceHistory.length > 1 && (
        <section className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">💹 Price History</h2>
          <div className="text-muted-foreground">
            <p className="mb-2">Last 30 days of price tracking:</p>
            <div className="space-y-1">
              {product.priceHistory.slice(0, 5).map((history) => (
                <div key={history.id} className="flex justify-between text-sm">
                  <span>{new Date(history.timestamp).toLocaleDateString()}</span>
                  <span>${history.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FTC Disclosure */}
      <div className="mt-8 p-4 bg-muted rounded text-sm text-muted-foreground">
        <strong>Affiliate Disclosure:</strong> TechDeals earns commissions from qualifying
        purchases made through affiliate links on this page. Prices shown are accurate as of the
        timestamps indicated and may change. We only recommend products we believe offer value.
      </div>
    </div>
  );
}
