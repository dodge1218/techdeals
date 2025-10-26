import { prisma } from '@/lib/db';
import Link from 'next/link';

export default async function TrendsPage() {
  const signals = await prisma.trendSignal.findMany({
    take: 50,
    orderBy: [{ score: 'desc' }, { detectedAt: 'desc' }],
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

  const signalsByType = signals.reduce((acc, signal) => {
    if (!acc[signal.signalType]) acc[signal.signalType] = [];
    acc[signal.signalType].push(signal);
    return acc;
  }, {} as Record<string, typeof signals>);

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h1 className="text-4xl font-bold mb-4">📊 Trend Finder</h1>
        <p className="text-muted-foreground text-lg">
          Our algorithm detects hot deals from price drops, media mentions, and social signals
        </p>
      </section>

      <div className="space-y-8">
        {Object.entries(signalsByType).map(([type, typeSignals]) => (
          <section key={type} className="border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 capitalize">
              {type.replace('_', ' ')} ({typeSignals.length})
            </h2>
            <div className="space-y-4">
              {typeSignals.slice(0, 10).map((signal) => {
                const bestOffer = signal.product.offers[0];
                let metadata: any = {};
                try {
                  metadata = signal.metadata ? JSON.parse(signal.metadata) : {};
                } catch {}

                return (
                  <div key={signal.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex-1">
                      <Link
                        href={`/products/${signal.product.id}`}
                        className="font-semibold hover:text-primary"
                      >
                        {signal.product.title}
                      </Link>
                      <div className="text-sm text-muted-foreground mt-1">
                        {signal.signalType === 'price_drop' && metadata.dropPercent && (
                          <span>
                            Price dropped {metadata.dropPercent.toFixed(1)}% (was $
                            {metadata.previousPrice})
                          </span>
                        )}
                        {signal.signalType === 'media_spike' && metadata.videoCount && (
                          <span>
                            {metadata.videoCount} videos · {metadata.totalViews?.toLocaleString()}{' '}
                            total views
                          </span>
                        )}
                        {signal.signalType === 'velocity' && <span>High purchase velocity</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {bestOffer && (
                        <div className="text-right">
                          <div className="text-2xl font-bold">${bestOffer.price.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {bestOffer.vendor}
                          </div>
                        </div>
                      )}
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">
                          {signal.score.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
