import { z } from 'zod';

export interface AffiliateProvider {
  name: string;
  buildLink(params: { productUrl: string; productId?: string }): string;
}

// Amazon Associates
class AmazonAffiliateProvider implements AffiliateProvider {
  name = 'amazon';
  private associateTag: string;

  constructor() {
    this.associateTag = process.env.AMAZON_ASSOCIATE_TAG || 'techdeals0a-20';
  }

  buildLink(params: { productUrl: string; productId?: string }): string {
    const url = new URL(params.productUrl);
    
    // Extract ASIN if available
    const asinMatch = params.productUrl.match(/\/dp\/([A-Z0-9]{10})/);
    const asin = params.productId || asinMatch?.[1];

    if (asin) {
      // Clean affiliate link format
      const baseUrl = `https://www.amazon.com/dp/${asin}`;
      const affiliateUrl = new URL(baseUrl);
      affiliateUrl.searchParams.set('tag', this.associateTag);
      affiliateUrl.searchParams.set('linkCode', 'll1');
      return affiliateUrl.toString();
    }

    // Fallback: append tag to existing URL
    url.searchParams.set('tag', this.associateTag);
    return url.toString();
  }
}

// Best Buy Affiliate
class BestBuyAffiliateProvider implements AffiliateProvider {
  name = 'bestbuy';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.BESTBUY_API_KEY || 'your_bestbuy_api_key_example';
  }

  buildLink(params: { productUrl: string; productId?: string }): string {
    const url = new URL(params.productUrl);
    
    // Best Buy affiliate uses irclickid parameter
    // In production, generate unique tracking ID per click
    const trackingId = `techdeals_${Date.now()}`;
    url.searchParams.set('irclickid', trackingId);
    url.searchParams.set('irgwc', '1');
    url.searchParams.set('ref', 'techdeals');
    
    return url.toString();
  }
}

// Newegg Affiliate
class NeweggAffiliateProvider implements AffiliateProvider {
  name = 'newegg';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NEWEGG_API_KEY || 'your_newegg_api_key_example';
  }

  buildLink(params: { productUrl: string; productId?: string }): string {
    const url = new URL(params.productUrl);
    
    // Newegg affiliate parameter
    url.searchParams.set('nm_mc', 'AFC-TechDeals');
    url.searchParams.set('cm_mmc', 'AFC-TechDeals-_-na-_-na-_-na');
    
    return url.toString();
  }
}

// Provider registry
const providers: Record<string, AffiliateProvider> = {
  amazon: new AmazonAffiliateProvider(),
  bestbuy: new BestBuyAffiliateProvider(),
  newegg: new NeweggAffiliateProvider(),
};

export function getAffiliateLink(vendor: string, productUrl: string, productId?: string): string {
  const provider = providers[vendor.toLowerCase()];
  if (!provider) {
    console.warn(`No affiliate provider for vendor: ${vendor}`);
    return productUrl;
  }

  try {
    return provider.buildLink({ productUrl, productId });
  } catch (error) {
    console.error(`Failed to build affiliate link for ${vendor}:`, error);
    return productUrl;
  }
}

export function addUTMParams(url: string, params?: { source?: string; medium?: string; campaign?: string }): string {
  const urlObj = new URL(url);
  urlObj.searchParams.set('utm_source', params?.source || 'techdeals');
  urlObj.searchParams.set('utm_medium', params?.medium || 'affiliate');
  urlObj.searchParams.set('utm_campaign', params?.campaign || 'deals');
  return urlObj.toString();
}
