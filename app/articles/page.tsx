import Link from 'next/link';
import { ArticleCard } from '@/components/article-card';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';

export default async function ArticlesPage() {
  const articles = await db.article.findMany({
    include: { products: true },
    orderBy: { publishedAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/">← Home</Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Articles & Guides</h1>
              <p className="text-sm text-muted-foreground">Expert insights and recommendations</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article as any} />
          ))}
        </div>

        {articles.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold mb-2">No articles yet</h3>
            <p className="text-muted-foreground mb-4">
              Our writers are working on great content for you!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}