import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Deal {
  id: string;
  product: {
    title: string;
    brand?: string;
    imageUrl?: string;
  };
  retailer: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  affiliateUrl?: string;
}

export function DealCard({ deal }: { deal: Deal }) {
  return (
    <Card className="overflow-hidden">
      {deal.product.imageUrl && (
        <img 
          src={deal.product.imageUrl} 
          alt={deal.product.title}
          className="w-full h-48 object-cover"
        />
      )}
      <CardHeader>
        <CardTitle className="text-lg line-clamp-2">{deal.product.title}</CardTitle>
        {deal.product.brand && (
          <CardDescription>{deal.product.brand}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">${deal.price.toFixed(2)}</span>
          {deal.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${deal.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
        {deal.discount && (
          <Badge variant="destructive" className="mt-2">
            {deal.discount.toFixed(0)}% OFF
          </Badge>
        )}
        <div className="mt-2">
          <Badge variant="outline">{deal.retailer}</Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={deal.affiliateUrl || '#'} target="_blank" rel="noopener noreferrer sponsored">
            View Deal
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
