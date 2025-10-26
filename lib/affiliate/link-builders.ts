/**
 * Affiliate Link Builders
 * Generates compliant affiliate links for Amazon, Best Buy, Newegg
 */

export interface AffiliateConfig {
  amazon: {
    partnerTag: string;
    enabled: boolean;
  };
  bestbuy: {
    campaignId: string;
    enabled: boolean;
  };
  newegg: {
    affiliateCode: string;
    enabled: boolean;
  };
}

export interface AffiliateParams {
  url: string;
  source: string;
  campaign?: string;
  term?: string;
  content?: string;
}

const defaultConfig: AffiliateConfig = {
  amazon: {
    partnerTag: process.env.AMAZON_PARTNER_TAG || 'techdeals-20',
    enabled: process.env.ENABLE_REAL_AFFILIATES === 'true',
  },
  bestbuy: {
    campaignId: process.env.BESTBUY_CAMPAIGN_ID || 'techdeals',
    enabled: process.env.ENABLE_REAL_AFFILIATES === 'true',
  },
  newegg: {
    affiliateCode: process.env.NEWEGG_AFFILIATE_CODE || 'TECHDEALS',
    enabled: process.env.ENABLE_REAL_AFFILIATES === 'true',
  },
};

/**
 * Build Amazon affiliate link with Associate tag
 * Compliant with Amazon Associates Program Operating Agreement
 */
export function buildAmazonAffiliateLink(params: AffiliateParams): string {
  const { url, source, campaign = 'website', term, content } = params;
  const config = defaultConfig.amazon;

  if (!config.enabled) {
    return url; // Return clean URL if affiliates disabled
  }

  try {
    const urlObj = new URL(url);
    
    // Add Associate tag
    urlObj.searchParams.set('tag', config.partnerTag);
    
    // Add UTM parameters for tracking
    urlObj.searchParams.set('utm_source', source);
    urlObj.searchParams.set('utm_medium', 'affiliate');
    urlObj.searchParams.set('utm_campaign', campaign);
    
    if (term) urlObj.searchParams.set('utm_term', term);
    if (content) urlObj.searchParams.set('utm_content', content);
    
    return urlObj.toString();
  } catch (error) {
    console.error('Failed to build Amazon affiliate link:', error);
    return url;
  }
}

/**
 * Build Best Buy affiliate link
 * Uses Best Buy Affiliate Network partner ID
 */
export function buildBestBuyAffiliateLink(params: AffiliateParams): string {
  const { url, source, campaign = 'website', term, content } = params;
  const config = defaultConfig.bestbuy;

  if (!config.enabled) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    
    // Best Buy uses 'irclickid' for affiliate tracking
    urlObj.searchParams.set('irclickid', config.campaignId);
    
    // Add UTM parameters
    urlObj.searchParams.set('utm_source', source);
    urlObj.searchParams.set('utm_medium', 'affiliate');
    urlObj.searchParams.set('utm_campaign', campaign);
    
    if (term) urlObj.searchParams.set('utm_term', term);
    if (content) urlObj.searchParams.set('utm_content', content);
    
    return urlObj.toString();
  } catch (error) {
    console.error('Failed to build Best Buy affiliate link:', error);
    return url;
  }
}

/**
 * Build Newegg affiliate link
 * Uses Newegg partner program code
 */
export function buildNeweggAffiliateLink(params: AffiliateParams): string {
  const { url, source, campaign = 'website', term, content } = params;
  const config = defaultConfig.newegg;

  if (!config.enabled) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    
    // Newegg uses 'nm_mc' parameter for affiliate tracking
    const affiliateParam = `AFC-${config.affiliateCode}`;
    urlObj.searchParams.set('nm_mc', affiliateParam);
    
    // Add UTM parameters
    urlObj.searchParams.set('utm_source', source);
    urlObj.searchParams.set('utm_medium', 'affiliate');
    urlObj.searchParams.set('utm_campaign', campaign);
    
    if (term) urlObj.searchParams.set('utm_term', term);
    if (content) urlObj.searchParams.set('utm_content', content);
    
    return urlObj.toString();
  } catch (error) {
    console.error('Failed to build Newegg affiliate link:', error);
    return url;
  }
}

/**
 * Generic affiliate link builder - routes to correct builder based on retailer
 */
export function buildAffiliateLink(
  retailer: string,
  url: string,
  source: string = 'website',
  campaign?: string,
  term?: string,
  content?: string
): string {
  const params: AffiliateParams = { url, source, campaign, term, content };
  
  const retailerLower = retailer.toLowerCase();
  
  if (retailerLower.includes('amazon')) {
    return buildAmazonAffiliateLink(params);
  } else if (retailerLower.includes('bestbuy') || retailerLower.includes('best buy')) {
    return buildBestBuyAffiliateLink(params);
  } else if (retailerLower.includes('newegg')) {
    return buildNeweggAffiliateLink(params);
  }
  
  // Unknown retailer - return URL with just UTM params
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('utm_source', source);
    urlObj.searchParams.set('utm_medium', 'affiliate');
    if (campaign) urlObj.searchParams.set('utm_campaign', campaign);
    if (term) urlObj.searchParams.set('utm_term', term);
    if (content) urlObj.searchParams.set('utm_content', content);
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Generate Amazon Associates compliance disclosure text
 */
export function getAmazonDisclosure(): string {
  return 'As an Amazon Associate I earn from qualifying purchases.';
}

/**
 * Generate FTC-compliant affiliate disclosure for articles
 */
export function getFTCDisclosure(): string {
  return 'This article contains affiliate links. If you click through and make a purchase, we may earn a commission at no additional cost to you. We only recommend products we genuinely believe in.';
}

/**
 * Get "as-of" timestamp label for price displays (Amazon compliance)
 */
export function getPriceTimestampLabel(timestamp: Date): string {
  const date = new Date(timestamp);
  const formatted = date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
  return `as of ${formatted}`;
}

/**
 * Check if price is stale (>24 hours old) - Amazon compliance
 */
export function isPriceStale(timestamp: Date): boolean {
  const now = Date.now();
  const priceTime = new Date(timestamp).getTime();
  const hoursDiff = (now - priceTime) / (1000 * 60 * 60);
  return hoursDiff > 24;
}
