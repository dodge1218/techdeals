export type Retailer = 'amazon' | 'bestbuy' | 'newegg';

interface AffiliateConfig {
  amazon?: { tag: string };
  bestbuy?: { programId: string };
  newegg?: { affiliateId: string };
}

const config: AffiliateConfig = {
  amazon: { tag: process.env.AMAZON_TAG || 'techdeals-20' },
  bestbuy: { programId: process.env.BESTBUY_PROGRAM_ID || 'mock-program' },
  newegg: { affiliateId: process.env.NEWEGG_AFFILIATE_ID || 'mock-affiliate' },
};

export function generateAffiliateLink(url: string, retailer: Retailer): string {
  try {
    const parsedUrl = new URL(url);
    
    switch (retailer) {
      case 'amazon':
        parsedUrl.searchParams.set('tag', config.amazon?.tag || '');
        return parsedUrl.toString();
        
      case 'bestbuy':
        parsedUrl.searchParams.set('irclickid', config.bestbuy?.programId || '');
        return parsedUrl.toString();
        
      case 'newegg':
        parsedUrl.searchParams.set('cm_mmc', `AFC-${config.newegg?.affiliateId}`);
        return parsedUrl.toString();
        
      default:
        return url;
    }
  } catch {
    return url;
  }
}

export function detectRetailer(url: string): Retailer | null {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes('amazon.')) return 'amazon';
    if (hostname.includes('bestbuy.')) return 'bestbuy';
    if (hostname.includes('newegg.')) return 'newegg';
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if price data is stale (older than 24 hours)
 */
export function isPriceStale(lastCheckedAt: Date | string): boolean {
  const date = new Date(lastCheckedAt)
  const now = new Date()
  const hoursSince = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  return hoursSince > 24
}

/**
 * Get price timestamp label (e.g., "as of 2 hours ago")
 */
export function getPriceTimestampLabel(lastCheckedAt: Date | string): string {
  const date = new Date(lastCheckedAt)
  const now = new Date()
  const hoursSince = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (hoursSince < 1) return 'as of moments ago'
  if (hoursSince === 1) return 'as of 1 hour ago'
  if (hoursSince < 24) return `as of ${hoursSince} hours ago`
  
  const daysSince = Math.floor(hoursSince / 24)
  if (daysSince === 1) return 'as of 1 day ago'
  return `as of ${daysSince} days ago`
}

/**
 * Get Amazon disclosure text
 */
export function getAmazonDisclosure(): string {
  return 'As an Amazon Associate, we earn from qualifying purchases. Prices and availability are subject to change.'
}
