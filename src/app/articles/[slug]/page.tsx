import { prisma } from '@/lib/db';
import { getAffiliateLink, addUTMParams } from '@/lib/affiliate';
import { notFound } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: {
      links: {
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
        orderBy: { position: 'asc' },
      },
    },
  });

  if (!article || article.status !== 'published') {
    notFound();
  }

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8">
        <div className="text-sm text-muted-foreground mb-2">
          {article.niche} • {article.publishedAt && formatDistanceToNow(article.publishedAt)} ago
        </div>
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        {article.excerpt && (
          <p className="text-xl text-muted-foreground">{article.excerpt}</p>
        )}
      </header>

      <div className="mb-8 p-4 bg-primary/5 border-l-4 border-primary rounded">
        <p className="text-sm">
          <strong>Affiliate Disclosure:</strong> This article contains affiliate links. We earn
          commissions from qualifying purchases at no extra cost to you.
        </p>
      </div>

      <div
        className="prose prose-lg max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        <div className="space-y-6">
          {article.links.map((link) => {
            const product = link.product;
            const bestOffer = product.offers[0];

            if (!bestOffer) return null;

            const affiliateUrl =
              bestOffer.affiliateLink ||
              getAffiliateLink(bestOffer.vendor, bestOffer.url, product.asin || undefined);
            const finalUrl = addUTMParams(affiliateUrl, { campaign: 'article_' + article.slug });

            return (
              <div key={link.id} className="border rounded-lg p-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{product.title}</h3>
                    {product.description && (
                      <p className="text-muted-foreground mb-3">{product.description}</p>
                    )}
                    {link.context && (
                      <p className="text-sm mb-4 italic">"{link.context}"</p>
                    )}
                    <div className="flex items-baseline gap-4">
                      <span className="text-3xl font-bold">${bestOffer.price.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">
                        at {bestOffer.vendor.charAt(0).toUpperCase() + bestOffer.vendor.slice(1)} · as of{' '}
                        {formatDistanceToNow(bestOffer.asOfTimestamp)} ago
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <a
                      href={finalUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="px-6 py-3 bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90 text-center whitespace-nowrap"
                    >
                      View Deal
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </article>
  );
}
