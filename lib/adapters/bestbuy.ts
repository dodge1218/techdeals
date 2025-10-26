/**
 * Best Buy Affiliate API Adapter
 * Mock implementation - swap to real API when keys are available
 */

import { SourceAdapter, ProductData, SearchOptions, AdapterConfig } from './types';

export class BestBuyAdapter implements SourceAdapter {
  name = 'bestbuy';
  private config: AdapterConfig;
  private mockMode: boolean;

  constructor(config?: AdapterConfig) {
    this.config = config || {};
    this.mockMode = !this.config.apiKey;
    
    if (this.mockMode) {
      console.log('⚠️  BestBuyAdapter: Using mock data (no API key configured)');
    }
  }

  async fetchProducts(options: SearchOptions): Promise<ProductData[]> {
    if (this.mockMode) {
      return this.getMockProducts(options);
    }

    // Real Best Buy API implementation would go here
    console.warn('Best Buy API not implemented, using mock data');
    return this.getMockProducts(options);
  }

  async getProduct(externalId: string): Promise<ProductData | null> {
    const products = await this.getMockProducts({});
    return products.find(p => p.externalId === externalId) || null;
  }

  isUsingMockData(): boolean {
    return this.mockMode;
  }

  private async getMockProducts(options: SearchOptions): Promise<ProductData[]> {
    const mockProducts: ProductData[] = [
      {
        externalId: '6522153',
        source: 'bestbuy',
        title: 'Apple iPhone 15 Pro Max 256GB Natural Titanium (Unlocked)',
        description: 'A17 Pro chip. Titanium. All-new Action button. The most powerful iPhone ever.',
        category: 'phones',
        brand: 'Apple',
        model: 'iPhone 15 Pro Max',
        imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400',
        specs: {
          storage: '256GB',
          processor: 'A17 Pro',
          display: '6.7" Super Retina XDR',
          camera: '48MP Main',
          connectivity: 'USB-C',
        },
        price: 1099.99,
        originalPrice: 1199.99,
        currency: 'USD',
        url: 'https://bestbuy.com/site/apple-iphone-15-pro-max/6522153',
        inStock: true,
      },
      {
        externalId: '6548910',
        source: 'bestbuy',
        title: 'Samsung Galaxy S24 Ultra 256GB Titanium Black (Unlocked)',
        description: 'Galaxy AI is here. 200MP camera. Built-in S Pen. Titanium frame.',
        category: 'phones',
        brand: 'Samsung',
        model: 'Galaxy S24 Ultra',
        imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
        specs: {
          storage: '256GB',
          processor: 'Snapdragon 8 Gen 3',
          display: '6.8" Dynamic AMOLED 2X',
          camera: '200MP Main',
        },
        price: 1099.99,
        originalPrice: 1299.99,
        currency: 'USD',
        url: 'https://bestbuy.com/site/samsung-galaxy-s24-ultra/6548910',
        inStock: true,
      },
      {
        externalId: '6523725',
        source: 'bestbuy',
        title: 'Samsung 990 PRO 2TB PCIe 4.0 NVMe M.2 Internal SSD',
        description: 'Maximum speed and reliability for gaming and professional use',
        category: 'pc-parts',
        brand: 'Samsung',
        model: '990 PRO',
        imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400',
        specs: {
          capacity: '2TB',
          interface: 'PCIe 4.0 x4',
          readSpeed: '7450 MB/s',
          writeSpeed: '6900 MB/s',
        },
        price: 159.99,
        originalPrice: 199.99,
        currency: 'USD',
        url: 'https://bestbuy.com/site/samsung-990-pro/6523725',
        inStock: true,
      },
      {
        externalId: '6523718',
        source: 'bestbuy',
        title: 'NVIDIA GeForce RTX 4090 24GB GDDR6X Graphics Card',
        description: 'Ultimate performance for 4K gaming and content creation',
        category: 'pc-parts',
        brand: 'NVIDIA',
        model: 'RTX 4090',
        imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400',
        specs: {
          memory: '24GB GDDR6X',
          cudaCores: 16384,
          boostClock: '2520 MHz',
        },
        price: 1649.99,
        originalPrice: 1899.99,
        currency: 'USD',
        url: 'https://bestbuy.com/site/nvidia-geforce-rtx-4090/6523718',
        inStock: true,
      },
      {
        externalId: '6535402',
        source: 'bestbuy',
        title: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
        description: 'Industry-leading noise cancellation with exceptional sound quality',
        category: 'gaming-setup',
        brand: 'Sony',
        model: 'WH-1000XM5',
        imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
        specs: {
          type: 'Over-ear',
          battery: '30 hours',
          connectivity: 'Bluetooth 5.2',
        },
        price: 349.99,
        originalPrice: 399.99,
        currency: 'USD',
        url: 'https://bestbuy.com/site/sony-wh-1000xm5/6535402',
        inStock: true,
      },
    ];

    let filtered = mockProducts;

    if (options.keywords) {
      const keywords = options.keywords.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(keywords) ||
        p.description?.toLowerCase().includes(keywords)
      );
    }

    if (options.category) {
      filtered = filtered.filter(p => p.category === options.category);
    }

    if (options.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= options.minPrice!);
    }
    if (options.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= options.maxPrice!);
    }

    const limit = options.limit || 10;
    const offset = options.offset || 0;
    return filtered.slice(offset, offset + limit);
  }
}
