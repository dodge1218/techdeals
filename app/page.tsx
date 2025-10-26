import Link from 'next/link';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function Home() {
  const deals = await prisma.deal.findMany({
    where: { isActive: true },
    include: { product: true },
    orderBy: { discount: 'desc' },
    take: 6,
  });

  const articles = await prisma.article.findMany({
    include: { products: true, mediaAssets: true },
    orderBy: { publishedAt: 'desc' },
    take: 3,
  });

  const trends = await prisma.trend.findMany({
    where: {
      timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    },
    include: { product: true },
    orderBy: { timestamp: 'desc' },
    take: 5,
  });

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">TechDeals</h1>
              <p className="text-sm text-gray-600">Your source for the best tech deals</p>
            </div>
            <nav className="flex gap-4">
              <Link href="/deals" className="hover:text-blue-600">Deals</Link>
              <Link href="/articles" className="hover:text-blue-600">Articles</Link>
              <Link href="/trends" className="hover:text-blue-600">Trends</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">🔥 Hot Deals</h2>
              <p className="text-gray-600">Best discounts right now</p>
            </div>
            <Link href="/deals" className="text-blue-600 hover:underline">View All →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <Link key={deal.id} href={`/products/${deal.product.id}`} className="border rounded-lg p-4 hover:shadow-lg transition">
                <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                  {deal.product.imageUrl && (
                    <img src={deal.product.imageUrl} alt={deal.product.title} className="w-full h-full object-cover rounded" />
                  )}
                </div>
                <h3 className="font-bold mb-2 line-clamp-2">{deal.product.title}</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-green-600">${deal.price.toFixed(2)}</span>
                  {deal.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">${deal.originalPrice.toFixed(2)}</span>
                  )}
                </div>
                {deal.discount && (
                  <div className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    Save {deal.discount}%
                  </div>
                )}
                <div className="mt-2 text-sm text-gray-600">
                  at {deal.retailer}
                </div>
              </Link>
            ))}
          </div>
          {deals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No deals available yet. Check back soon!</p>
            </div>
          )}
        </section>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">📝 Latest Articles</h2>
            <Link href="/articles" className="text-blue-600 hover:underline">All Articles →</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link key={article.id} href={`/articles/${article.slug}`} className="border rounded-lg p-6 hover:shadow-lg transition">
                <h3 className="font-bold text-lg mb-2 line-clamp-2">{article.title}</h3>
                {article.excerpt && (
                  <p className="text-gray-600 text-sm line-clamp-3 mb-3">{article.excerpt}</p>
                )}
                <div className="text-xs text-gray-500">
                  {new Date(article.publishedAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
          {articles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No articles yet. Coming soon!</p>
            </div>
          )}
        </section>

        <section className="border-t pt-8">
          <h2 className="text-xl font-bold mb-4">Product Categories</h2>
          <div className="flex flex-wrap gap-2">
            <span className="bg-gray-200 text-sm py-2 px-4 rounded-full">Crypto Miners</span>
            <span className="bg-gray-200 text-sm py-2 px-4 rounded-full">PC Parts</span>
            <span className="bg-gray-200 text-sm py-2 px-4 rounded-full">Phones & Accessories</span>
            <span className="bg-gray-200 text-sm py-2 px-4 rounded-full">Gaming Setup</span>
          </div>
        </section>
      </main>

      <footer className="border-t mt-12 py-8 bg-gray-50">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p className="mb-2">
            As an Amazon Associate and affiliate partner with other retailers, we earn from qualifying purchases.
          </p>
          <p>© 2025 TechDeals. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
