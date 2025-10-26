/**
 * Amazon Product Advertising API Adapter
 * Mock implementation - swap to real PA-API when keys are available
 */

import { SourceAdapter, ProductData, SearchOptions, AdapterConfig, AdapterError } from './types';

export class AmazonAdapter implements SourceAdapter {
  name = 'amazon';
  private config: AdapterConfig;
  private mockMode: boolean;

  constructor(config?: AdapterConfig) {
    this.config = config || {};
    this.mockMode = !this.config.apiKey || !this.config.apiSecret;
    
    if (this.mockMode) {
      console.log('⚠️  AmazonAdapter: Using mock data (no API keys configured)');
    }
  }

  async fetchProducts(options: SearchOptions): Promise<ProductData[]> {
    if (this.mockMode) {
      return this.getMockProducts(options);
    }

    try {
      // Real PA-API implementation would go here
      // const response = await this.callPAAPI('SearchItems', { keywords: options.keywords });
      // return this.normalizePAAPIResponse(response);
      
      throw new AdapterError(
        'Real Amazon PA-API not implemented yet',
        'NOT_IMPLEMENTED',
        this.name
      );
    } catch (error) {
      console.error('Amazon API error, falling back to mock data:', error);
      return this.getMockProducts(options);
    }
  }

  async getProduct(externalId: string): Promise<ProductData | null> {
    if (this.mockMode) {
      const products = await this.getMockProducts({});
      return products.find(p => p.externalId === externalId) || null;
    }

    try {
      // Real PA-API implementation
      throw new AdapterError(
        'Real Amazon PA-API not implemented yet',
        'NOT_IMPLEMENTED',
        this.name
      );
    } catch (error) {
      console.error('Amazon API error:', error);
      return null;
    }
  }

  isUsingMockData(): boolean {
    return this.mockMode;
  }

  /**
   * Generate mock Amazon product data
   */
  private async getMockProducts(options: SearchOptions): Promise<ProductData[]> {
    const mockProducts: ProductData[] = [
      {
        externalId: 'B08HR6FMK3',
        source: 'amazon',
        title: 'NVIDIA GeForce RTX 4090 Founders Edition',
        description: 'The ultimate graphics card for 4K gaming and content creation. 24GB GDDR6X memory.',
        category: 'pc-parts',
        brand: 'NVIDIA',
        model: 'RTX 4090',
        imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400',
        specs: {
          memory: '24GB GDDR6X',
          cudaCores: 16384,
          tdp: '450W',
        },
        price: 1599.99,
        originalPrice: 1899.99,
        currency: 'USD',
        url: 'https://amazon.com/dp/B08HR6FMK3',
        inStock: true,
      },
      {
        externalId: 'BZ8V4RX9WR',
        source: 'amazon',
        title: 'Intel Core i9-13900K Desktop Processor',
        description: '24 cores (8 P-cores + 16 E-cores) and 32 threads',
        category: 'pc-parts',
        brand: 'Intel',
        model: 'i9-13900K',
        imageUrl: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400',
        specs: {
          cores: 24,
          threads: 32,
          baseClock: '3.0 GHz',
          boostClock: '5.8 GHz',
        },
        price: 549.99,
        originalPrice: 629.99,
        currency: 'USD',
        url: 'https://amazon.com/dp/BZ8V4RX9WR',
        inStock: true,
      },
      {
        externalId: 'AER2C23DWALPG1G1G1BBBBAJBKDVPRPS',
        source: 'amazon',
        title: 'Herman Miller Aeron Ergonomic Office Chair Size B',
        description: 'Fully adjustable with PostureFit SL support and 12-year warranty',
        category: 'gaming-setup',
        brand: 'Herman Miller',
        model: 'Aeron',
        imageUrl: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400',
        specs: {
          size: 'B (Medium)',
          armrests: '4D adjustable',
          warranty: '12 years',
        },
        price: 1295.00,
        originalPrice: 1495.00,
        currency: 'USD',
        url: 'https://amazon.com/herman-miller-aeron',
        inStock: true,
      },
      {
        externalId: 'DK-04F',
        source: 'amazon',
        title: 'Lian Li DK-04F Motorized Standing Desk 63"',
        description: 'Premium motorized standing desk with cable management',
        category: 'gaming-setup',
        brand: 'Lian Li',
        model: 'DK-04F',
        imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=400',
        specs: {
          size: '63" x 31.5"',
          heightRange: '28.3" - 48"',
          motors: 'Dual motor',
        },
        price: 899.99,
        originalPrice: 1099.99,
        currency: 'USD',
        url: 'https://amazon.com/lian-li-dk-04f',
        inStock: true,
      },
      {
        externalId: 'B09V3HJ1K7',
        source: 'amazon',
        title: 'Corsair Vengeance DDR5 RAM 32GB (2x16GB) 5600MHz',
        description: 'High-performance DDR5 memory for gaming',
        category: 'pc-parts',
        brand: 'Corsair',
        model: 'Vengeance DDR5',
        imageUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400',
        specs: {
          capacity: '32GB',
          speed: '5600MHz',
          type: 'DDR5',
        },
        price: 134.99,
        originalPrice: 179.99,
        currency: 'USD',
        url: 'https://amazon.com/corsair-vengeance-ddr5',
        inStock: true,
      },
      {
        externalId: 'B0BQK4GN82',
        source: 'amazon',
        title: 'WD_BLACK SN850X 2TB NVMe SSD',
        description: 'Ultra-fast PCIe 4.0 gaming storage',
        category: 'pc-parts',
        brand: 'Western Digital',
        model: 'SN850X',
        imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400',
        specs: {
          capacity: '2TB',
          interface: 'PCIe 4.0 x4',
          readSpeed: '7300 MB/s',
        },
        price: 149.99,
        originalPrice: 219.99,
        currency: 'USD',
        url: 'https://amazon.com/wd-black-sn850x',
        inStock: true,
      },
      {
        externalId: 'MLU73LL/A',
        source: 'amazon',
        title: 'Apple iPhone 15 Pro Max 256GB Natural Titanium',
        description: 'A17 Pro chip, titanium design, 48MP camera',
        category: 'phones',
        brand: 'Apple',
        model: 'iPhone 15 Pro Max',
        imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400',
        specs: {
          storage: '256GB',
          chip: 'A17 Pro',
          display: '6.7" Super Retina XDR',
        },
        price: 1119.99,
        originalPrice: 1199.99,
        currency: 'USD',
        url: 'https://amazon.com/apple-iphone-15-pro-max',
        inStock: true,
      },
      {
        externalId: 'B0CRDM6KVP',
        source: 'amazon',
        title: 'ASUS ROG Strix G16 Gaming Laptop',
        description: 'RTX 4070, Intel i9-13980HX, 16" QHD 240Hz',
        category: 'pc-parts',
        brand: 'ASUS',
        model: 'ROG Strix G16',
        imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400',
        specs: {
          cpu: 'i9-13980HX',
          gpu: 'RTX 4070',
          display: '16" QHD 240Hz',
        },
        price: 1799.99,
        originalPrice: 2299.99,
        currency: 'USD',
        url: 'https://amazon.com/asus-rog-strix-g16',
        inStock: true,
      },
      {
        externalId: 'B0BYD4MBL1',
        source: 'amazon',
        title: 'Logitech G Pro X Superlight 2 Wireless Mouse',
        description: 'Ultra-lightweight esports gaming mouse',
        category: 'gaming-setup',
        brand: 'Logitech',
        model: 'G Pro X Superlight 2',
        imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
        specs: {
          weight: '60g',
          sensor: 'HERO 2',
          battery: '95 hours',
        },
        price: 149.99,
        originalPrice: 159.99,
        currency: 'USD',
        url: 'https://amazon.com/logitech-g-pro-superlight',
        inStock: true,
      },
      {
        externalId: 'B0BLZXW5VW',
        source: 'amazon',
        title: 'NZXT H7 Flow RGB Mid Tower PC Case',
        description: 'High-airflow gaming case with RGB lighting',
        category: 'pc-parts',
        brand: 'NZXT',
        model: 'H7 Flow',
        imageUrl: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400',
        specs: {
          formFactor: 'Mid Tower',
          fans: '3x 120mm RGB',
          clearance: '400mm GPU',
        },
        price: 129.99,
        originalPrice: 149.99,
        currency: 'USD',
        url: 'https://amazon.com/nzxt-h7-flow',
        inStock: true,
      },
    ];

    // Filter by keywords if provided
    let filtered = mockProducts;
    if (options.keywords) {
      const keywords = options.keywords.toLowerCase();
      filtered = mockProducts.filter(p =>
        p.title.toLowerCase().includes(keywords) ||
        p.description?.toLowerCase().includes(keywords) ||
        p.brand?.toLowerCase().includes(keywords)
      );
    }

    // Filter by category
    if (options.category) {
      filtered = filtered.filter(p => p.category === options.category);
    }

    // Filter by price range
    if (options.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= options.minPrice!);
    }
    if (options.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= options.maxPrice!);
    }

    // Apply limit and offset
    const limit = options.limit || 10;
    const offset = options.offset || 0;
    filtered = filtered.slice(offset, offset + limit);

    return filtered;
  }
}
