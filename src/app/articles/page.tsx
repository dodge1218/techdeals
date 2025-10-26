import { prisma } from '@/lib/db';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    take: 20,
    include: {
      links: {
        include: { product: true },
      },
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h1 className="text-4xl font-bold mb-4">📝 Tech Deal Roundups & Guides</h1>
        <p className="text-muted-foreground text-lg">
          Expert-curated buying guides with 5–10 vetted product recommendations
        </p>
      </section>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
            {article.excerpt && (
              <p className="text-muted-foreground text-sm mb-4">{article.excerpt}</p>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{article.links.length} products featured</span>
              {article.publishedAt && (
                <span>{formatDistanceToNow(article.publishedAt)} ago</span>
              )}
            </div>
          </Link>
        ))}

        {articles.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">No articles published yet</p>
            <p className="text-sm">Check back soon for expert buying guides!</p>
          </div>
        )}
      </div>
    </div>
  );
}
