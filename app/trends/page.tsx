import Link from 'next/link';
import { TrendChart } from '@/components/trend-chart';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';

export default async function TrendsPage() {
  const trends = await db.trend.findMany({
    where: {
      timestamp: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    },
    include: { product: true },
    orderBy: { timestamp: 'desc' },
  });

  const signals = ['price_drop', 'media_mention', 'search_volume', 'social_buzz'];
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/">← Home</Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Trend Finder</h1>
              <p className="text-sm text-muted-foreground">Market signals & trending products</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-6">
          {signals.map((signal) => {
            const signalTrends = trends.filter(t => t.signal === signal);
            return (
              <TrendChart key={signal} trends={signalTrends} />
            );
          })}
        </div>

        {trends.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold mb-2">No trends detected yet</h3>
            <p className="text-muted-foreground">
              Our algorithms are analyzing the market. Check back soon!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}