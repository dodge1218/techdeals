import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/db';
import { formatDistanceToNow } from 'date-fns';

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await db.article.findUnique({
    where: { slug: params.slug },
    include: { products: { include: { deals: true } } },
  });

  if (!article) notFound();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button asChild variant="ghost">
            <Link href="/articles">← Back to Articles</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <article>
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Badge>{article.niche}</Badge>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
            {article.excerpt && (
              <p className="text-xl text-muted-foreground">{article.excerpt}</p>
            )}
            <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
              <span>By {article.authorName}</span>
            </div>
          </header>


          <div className="prose prose-lg max-w-none mb-12">
            {article.content.split('\n').map((para, i) => (
              <p key={i} className="mb-4 whitespace-pre-wrap">{para}</p>
            ))}
          </div>

          {article.products.length > 0 && (
            <section className="border-t pt-8">
              <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {article.products.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">{product.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
                    {product.deals.length > 0 && (
                      <div className="space-y-2">
                        {product.deals.slice(0, 3).map((deal) => (
                          <Button key={deal.id} asChild variant="outline" size="sm" className="w-full">
                            <a href={deal.url} target="_blank" rel="noopener noreferrer sponsored">
                              Check on {deal.retailer} - ${deal.price}
                            </a>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>
    </div>
  );
}