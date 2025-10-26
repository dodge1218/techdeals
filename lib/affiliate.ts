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
