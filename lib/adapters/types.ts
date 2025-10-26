/**
 * Adapter Type Definitions
 * Unified interface for all external data sources (Amazon, Best Buy, Newegg, YouTube)
 */

export interface ProductData {
  externalId: string;
  source: 'amazon' | 'bestbuy' | 'newegg' | 'manual';
  title: string;
  description?: string;
  category: string;
  brand?: string;
  model?: string;
  imageUrl?: string;
  imageAltText?: string;
  specs?: Record<string, any>;
  price: number;
  originalPrice?: number;
  currency?: string;
  url: string;
  inStock?: boolean;
  stockCount?: number;
}

export interface VideoData {
  platform: 'youtube' | 'vimeo';
  externalId: string;
  title: string;
  description?: string;
  channelName?: string;
  thumbnailUrl?: string;
  duration?: number;
  viewCount?: number;
  likeCount?: number;
  url: string;
  embedUrl?: string;
  publishedAt?: Date;
}

export interface SearchOptions {
  keywords?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export interface VideoSearchOptions {
  query: string;
  maxResults?: number;
  order?: 'relevance' | 'date' | 'viewCount';
}

/**
 * Base adapter interface that all product source adapters must implement
 */
export interface SourceAdapter {
  name: string;
  
  /**
   * Fetch products from the source
   * @returns Array of product data
   */
  fetchProducts(options: SearchOptions): Promise<ProductData[]>;
  
  /**
   * Get a single product by ID
   * @param externalId Product ID from the source
   */
  getProduct(externalId: string): Promise<ProductData | null>;
  
  /**
   * Check if the adapter is using real API or mock data
   */
  isUsingMockData(): boolean;
}

/**
 * Video adapter interface for YouTube, Vimeo, etc.
 */
export interface VideoAdapter {
  name: string;
  
  /**
   * Search for videos by query
   */
  searchVideos(options: VideoSearchOptions): Promise<VideoData[]>;
  
  /**
   * Get video details by ID
   */
  getVideo(externalId: string): Promise<VideoData | null>;
  
  /**
   * Check if using mock data
   */
  isUsingMockData(): boolean;
}

/**
 * Adapter configuration
 */
export interface AdapterConfig {
  apiKey?: string;
  apiSecret?: string;
  affiliateTag?: string;
  timeout?: number;
  maxRetries?: number;
  rateLimit?: {
    requests: number;
    period: number; // milliseconds
  };
}

/**
 * Error types for adapter operations
 */
export class AdapterError extends Error {
  constructor(
    message: string,
    public code: string,
    public adapter: string
  ) {
    super(message);
    this.name = 'AdapterError';
  }
}
