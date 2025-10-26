'use client';

import { buildAffiliateLink, getPriceTimestampLabel, isPriceStale } from '@/lib/affiliate';

interface Deal {
  id: string;
  retailer: string;
  price: number;
  originalPrice: number | null;
  discount: number | null;
  url: string;
  inStock: boolean;
  lastVerified: Date;
}

interface DealCardProps {
  deal: Deal;
}

export function DealCard({ deal }: DealCardProps) {
  const isStale = isPriceStale(deal.lastVerified);

  return (
    <div className={`border rounded-lg p-4 ${isStale ? 'border-orange-200 bg-orange-50' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-bold text-lg mb-1">{deal.retailer}</div>
          <div className="text-2xl font-bold text-green-700">${deal.price.toFixed(2)}</div>
          {deal.originalPrice && (
            <div className="text-sm text-gray-500 line-through">
              ${deal.originalPrice.toFixed(2)}
            </div>
          )}
        </div>
        {deal.discount && (
          <div className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded">
            -{deal.discount}%
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 mb-3">
        {getPriceTimestampLabel(deal.lastVerified)}
        {isStale && (
          <div className="text-orange-600 font-semibold mt-1">
            ⚠ Price may have changed - verify on retailer site
          </div>
        )}
      </div>

      <a
        href={buildAffiliateLink(deal.retailer as any, deal.url, 'product-page', 'deal-card')}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`block w-full text-center font-semibold py-2 px-4 rounded transition ${
          deal.inStock
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
        }`}
      >
        {deal.inStock ? 'View Deal' : 'Out of Stock'}
      </a>
    </div>
  );
}
