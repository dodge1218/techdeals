import { prisma } from '@/lib/db';
import Link from 'next/link';

export default async function AdminPage() {
  const [productCount, offerCount, articleCount, dealPostCount, crawlJobCount] = await Promise.all([
    prisma.product.count(),
    prisma.offer.count(),
    prisma.article.count(),
    prisma.dealPost.count(),
    prisma.crawlJob.count(),
  ]);

  const recentCrawls = await prisma.crawlJob.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  const pendingDeals = await prisma.dealPost.findMany({
    where: { status: 'pending' },
    take: 10,
    include: { product: true },
    orderBy: { priority: 'desc' },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">⚙️ Admin Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <div className="border rounded-lg p-6 bg-card">
          <div className="text-3xl font-bold mb-2">{productCount}</div>
          <div className="text-muted-foreground">Products</div>
        </div>
        <div className="border rounded-lg p-6 bg-card">
          <div className="text-3xl font-bold mb-2">{offerCount}</div>
          <div className="text-muted-foreground">Offers</div>
        </div>
        <div className="border rounded-lg p-6 bg-card">
          <div className="text-3xl font-bold mb-2">{articleCount}</div>
          <div className="text-muted-foreground">Articles</div>
        </div>
        <div className="border rounded-lg p-6 bg-card">
          <div className="text-3xl font-bold mb-2">{dealPostCount}</div>
          <div className="text-muted-foreground">Deal Posts</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Pending Deal Approvals</h2>
          <div className="border rounded-lg divide-y">
            {pendingDeals.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No pending deals
              </div>
            ) : (
              pendingDeals.map((deal) => (
                <div key={deal.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold">{deal.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {deal.product.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Priority: {deal.priority} · {deal.dealType}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm">
                        Approve
                      </button>
                      <button className="px-3 py-1 bg-secondary rounded text-sm">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Recent Crawl Jobs</h2>
          <div className="border rounded-lg divide-y">
            {recentCrawls.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No crawl jobs yet
              </div>
            ) : (
              recentCrawls.map((job) => (
                <div key={job.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold capitalize">
                        {job.source} • {job.jobType.replace('_', ' ')}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {job.itemsFound} found · {job.itemsFailed} failed
                      </div>
                    </div>
                    <div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          job.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : job.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : job.status === 'running'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="mt-12 grid md:grid-cols-3 gap-4">
        <Link
          href="/admin/products"
          className="border rounded-lg p-6 hover:shadow-lg transition-shadow text-center"
        >
          <div className="text-xl font-semibold">Manage Products</div>
        </Link>
        <Link
          href="/admin/articles"
          className="border rounded-lg p-6 hover:shadow-lg transition-shadow text-center"
        >
          <div className="text-xl font-semibold">Manage Articles</div>
        </Link>
        <Link
          href="/admin/social"
          className="border rounded-lg p-6 hover:shadow-lg transition-shadow text-center"
        >
          <div className="text-xl font-semibold">Social Queue</div>
        </Link>
      </div>
    </div>
  );
}
