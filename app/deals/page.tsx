import Link from 'next/link';
import { DealCard } from '@/components/deal-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/db';

export default async function DealsPage() {
  const deals = await db.deal.findMany({
    where: { isActive: true },
    include: { product: true },
    orderBy: { discount: 'desc' },
  });

  const categories = Array.from(new Set(deals.map(d => d.product.category)));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/">← Home</Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">All Deals</h1>
              <p className="text-sm text-muted-foreground">{deals.length} active deals</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-sm font-medium mb-3">Filter by Category</h2>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="cursor-pointer">All</Badge>
            {categories.map((cat) => (
              <Badge key={cat} variant="outline" className="cursor-pointer">
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal as any} />
          ))}
        </div>

        {deals.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold mb-2">No deals available</h3>
            <p className="text-muted-foreground">Check back soon for new deals!</p>
          </div>
        )}
      </main>
    </div>
  );
}