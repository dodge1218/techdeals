/**
 * Newegg Affiliate API Adapter
 * Mock implementation - swap to real API when affiliate ID is available
 */

import { SourceAdapter, ProductData, SearchOptions, AdapterConfig } from './types';

export class NeweggAdapter implements SourceAdapter {
  name = 'newegg';
  private config: AdapterConfig;
  private mockMode: boolean;

  constructor(config?: AdapterConfig) {
    this.config = config || {};
    this.mockMode = !this.config.affiliateTag;
    
    if (this.mockMode) {
      console.log('⚠️  NeweggAdapter: Using mock data (no affiliate ID configured)');
    }
  }

  async fetchProducts(options: SearchOptions): Promise<ProductData[]> {
    if (this.mockMode) {
      return this.getMockProducts(options);
    }

    // Real Newegg API implementation would go here
    console.warn('Newegg API not implemented, using mock data');
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
        externalId: 'ANTMINER-S19PRO-110TH',
        source: 'newegg',
        title: 'Bitmain Antminer S19 Pro 110TH/s Bitcoin Miner ASIC',
        description: 'Professional Bitcoin mining hardware with SHA-256 algorithm. Includes PSU.',
        category: 'crypto-miners',
        brand: 'Bitmain',
        model: 'Antminer S19 Pro',
        imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
        specs: {
          hashrate: '110 TH/s',
          power: '3250W',
          algorithm: 'SHA-256',
          efficiency: '29.5 J/TH',
          weight: '13.2 kg',
        },
        price: 2499.99,
        originalPrice: 3499.99,
        currency: 'USD',
        url: 'https://newegg.com/bitmain-antminer-s19-pro',
        inStock: true,
        stockCount: 15,
      },
      {
        externalId: 'WHATSMINER-M30S-88TH',
        source: 'newegg',
        title: 'MicroBT Whatsminer M30S+ 88TH/s Bitcoin Miner',
        description: 'Efficient Bitcoin ASIC miner with advanced cooling system',
        category: 'crypto-miners',
        brand: 'MicroBT',
        model: 'Whatsminer M30S+',
        imageUrl: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400',
        specs: {
          hashrate: '88 TH/s',
          power: '3344W',
          algorithm: 'SHA-256',
          efficiency: '38 J/TH',
        },
        price: 1999.99,
        originalPrice: 2799.99,
        currency: 'USD',
        url: 'https://newegg.com/whatsminer-m30s',
        inStock: true,
        stockCount: 8,
      },
      {
        externalId: 'CMK64GX5M2B5200C40',
        source: 'newegg',
        title: 'Corsair Vengeance DDR5 RAM 64GB (2x32GB) 5200MHz CL40',
        description: 'High-performance DDR5 memory optimized for Intel and AMD platforms',
        category: 'pc-parts',
        brand: 'Corsair',
        model: 'Vengeance DDR5',
        imageUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400',
        specs: {
          capacity: '64GB',
          speed: '5200MHz',
          type: 'DDR5',
          modules: '2x32GB',
          latency: 'CL40',
        },
        price: 219.99,
        originalPrice: 279.99,
        currency: 'USD',
        url: 'https://newegg.com/corsair-64gb-ddr5',
        inStock: true,
      },
      {
        externalId: '9SIAF3CKAJ7892',
        source: 'newegg',
        title: 'AMD Ryzen 9 7950X3D 16-Core Desktop Processor',
        description: '3D V-Cache technology for ultimate gaming performance',
        category: 'pc-parts',
        brand: 'AMD',
        model: 'Ryzen 9 7950X3D',
        imageUrl: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400',
        specs: {
          cores: 16,
          threads: 32,
          baseClock: '4.2 GHz',
          boostClock: '5.7 GHz',
          cache: '128MB',
        },
        price: 599.99,
        originalPrice: 699.99,
        currency: 'USD',
        url: 'https://newegg.com/amd-ryzen-9-7950x3d',
        inStock: true,
      },
      {
        externalId: 'N82E16814932592',
        source: 'newegg',
        title: 'MSI GeForce RTX 4080 SUPRIM X 16GB GDDR6X',
        description: 'Premium graphics card with SUPRIM cooling solution',
        category: 'pc-parts',
        brand: 'MSI',
        model: 'RTX 4080 SUPRIM X',
        imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400',
        specs: {
          memory: '16GB GDDR6X',
          coreClock: '2640 MHz',
          cooling: 'TRI FROZR 3',
        },
        price: 1149.99,
        originalPrice: 1299.99,
        currency: 'USD',
        url: 'https://newegg.com/msi-rtx-4080-suprim',
        inStock: true,
      },
    ];

    let filtered = mockProducts;

    if (options.keywords) {
      const keywords = options.keywords.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(keywords) ||
        p.description?.toLowerCase().includes(keywords) ||
        p.brand?.toLowerCase().includes(keywords)
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
