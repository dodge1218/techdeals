import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  niche: string;
  publishedAt: Date | string;
  products: any[];
}

export function ArticleCard({ article }: { article: Article }) {
  const publishedDate = typeof article.publishedAt === 'string' 
    ? new Date(article.publishedAt) 
    : article.publishedAt;
    
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl line-clamp-2">{article.title}</CardTitle>
          <Badge variant="secondary">{article.niche}</Badge>
        </div>
        <CardDescription>
          {formatDistanceToNow(publishedDate, { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      {article.excerpt && (
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {article.excerpt}
          </p>
          {article.products.length > 0 && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {article.products.slice(0, 3).map((product) => (
                <Badge key={product.id} variant="outline" className="text-xs">
                  {product.title.substring(0, 20)}...
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      )}
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/articles/${article.slug}`}>
            Read Article
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
