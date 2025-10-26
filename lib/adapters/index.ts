/**
 * Adapter Index
 * Central export point for all data source adapters
 */

export * from './types';
export * from './amazon';
export * from './bestbuy';
export * from './newegg';
export * from './youtube';

import { AmazonAdapter } from './amazon';
import { BestBuyAdapter } from './bestbuy';
import { NeweggAdapter } from './newegg';
import { YouTubeAdapter } from './youtube';
import type { AdapterConfig } from './types';

/**
 * Adapter Factory
 * Creates adapter instances with configuration from environment variables
 */
export class AdapterFactory {
  static createAmazonAdapter(config?: AdapterConfig): AmazonAdapter {
    return new AmazonAdapter(config || {
      apiKey: process.env.AMAZON_PA_API_KEY,
      apiSecret: process.env.AMAZON_PA_API_SECRET,
      affiliateTag: process.env.AMAZON_ASSOCIATE_TAG || 'techdeals-20',
    });
  }

  static createBestBuyAdapter(config?: AdapterConfig): BestBuyAdapter {
    return new BestBuyAdapter(config || {
      apiKey: process.env.BESTBUY_API_KEY,
      affiliateTag: process.env.BESTBUY_AFFILIATE_ID,
    });
  }

  static createNeweggAdapter(config?: AdapterConfig): NeweggAdapter {
    return new NeweggAdapter(config || {
      affiliateTag: process.env.NEWEGG_AFFILIATE_ID,
    });
  }

  static createYouTubeAdapter(config?: AdapterConfig): YouTubeAdapter {
    return new YouTubeAdapter(config || {
      apiKey: process.env.YOUTUBE_API_KEY,
    });
  }

  /**
   * Create all adapters at once
   */
  static createAll() {
    return {
      amazon: this.createAmazonAdapter(),
      bestbuy: this.createBestBuyAdapter(),
      newegg: this.createNeweggAdapter(),
      youtube: this.createYouTubeAdapter(),
    };
  }
}
