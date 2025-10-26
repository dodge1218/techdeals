export interface ProductData {
  externalId: string;
  title: string;
  description?: string;
  category: string;
  brand?: string;
  imageUrl?: string;
  price: number;
  url: string;
  inStock: boolean;
}

export interface SourceAdapter {
  name: string;
  fetchProducts(category: string, limit?: number): Promise<ProductData[]>;
  fetchProductDetails(externalId: string): Promise<ProductData | null>;
}

// Amazon PA-API Adapter (Mock)
export class AmazonAdapter implements SourceAdapter {
  name = 'amazon';
  private mockMode: boolean;

  constructor() {
    const accessKey = process.env.AMAZON_ACCESS_KEY;
    this.mockMode = !accessKey || accessKey.startsWith('AKIAIOSFODNN7EXAMPLE');
  }

  async fetchProducts(category: string, limit = 10): Promise<ProductData[]> {
    if (this.mockMode) {
      return this.getMockProducts(category, limit);
    }

    // TODO: Implement real PA-API call
    console.log(`[Amazon] Fetching ${limit} products for ${category}`);
    return this.getMockProducts(category, limit);
  }

  async fetchProductDetails(asin: string): Promise<ProductData | null> {
    if (this.mockMode) {
      return this.getMockProducts('', 1)[0] || null;
    }

    // TODO: Implement real PA-API call
    return null;
  }

  private getMockProducts(category: string, limit: number): ProductData[] {
    const mockProducts: ProductData[] = [
      {
        externalId: 'B09VKW8Z7H',
        title: 'Bitmain Antminer S19 Pro 110TH/s Bitcoin Miner',
        description: 'Professional Bitcoin mining hardware',
        category: 'crypto-miners',
        brand: 'Bitmain',
        imageUrl: 'https://m.media-amazon.com/images/I/51example.jpg',
        price: 2899.99,
        url: 'https://amazon.com/dp/B09VKW8Z7H',
        inStock: true,
      },
      {
        externalId: 'B0CXYZ1234',
        title: 'NVIDIA GeForce RTX 4070 Ti SUPER 16GB',
        description: 'High-performance gaming GPU',
        category: 'pc-parts',
        brand: 'NVIDIA',
        imageUrl: 'https://m.media-amazon.com/images/I/41example.jpg',
        price: 849.99,
        url: 'https://amazon.com/dp/B0CXYZ1234',
        inStock: true,
      },
    ];

    return mockProducts.slice(0, limit);
  }
}

// Best Buy Adapter (Mock)
export class BestBuyAdapter implements SourceAdapter {
  name = 'bestbuy';
  private apiKey: string;
  private mockMode: boolean;

  constructor() {
    this.apiKey = process.env.BESTBUY_API_KEY || '';
    this.mockMode = !this.apiKey || this.apiKey === 'your_bestbuy_api_key_example';
  }

  async fetchProducts(category: string, limit = 10): Promise<ProductData[]> {
    if (this.mockMode) {
      return this.getMockProducts(category, limit);
    }

    // TODO: Implement real Best Buy API call
    console.log(`[BestBuy] Fetching ${limit} products for ${category}`);
    return this.getMockProducts(category, limit);
  }

  async fetchProductDetails(sku: string): Promise<ProductData | null> {
    return null;
  }

  private getMockProducts(category: string, limit: number): ProductData[] {
    return [
      {
        externalId: 'BB12345',
        title: 'Samsung Galaxy S24 Ultra 256GB (Unlocked)',
        description: 'Flagship Android phone with AI features',
        category: 'phones',
        brand: 'Samsung',
        imageUrl: 'https://pisces.bbystatic.com/image2/example.jpg',
        price: 1199.99,
        url: 'https://www.bestbuy.com/site/example',
        inStock: true,
      },
    ].slice(0, limit);
  }
}

// Newegg Adapter (Mock)
export class NeweggAdapter implements SourceAdapter {
  name = 'newegg';
  private mockMode = true;

  async fetchProducts(category: string, limit = 10): Promise<ProductData[]> {
    return [
      {
        externalId: 'N82E16819113662',
        title: 'AMD Ryzen 9 7950X3D 16-Core Processor',
        description: 'High-end desktop CPU with 3D V-Cache',
        category: 'pc-parts',
        brand: 'AMD',
        imageUrl: 'https://c1.neweggimages.com/example.jpg',
        price: 599.99,
        url: 'https://www.newegg.com/p/example',
        inStock: true,
      },
    ].slice(0, limit);
  }

  async fetchProductDetails(itemNumber: string): Promise<ProductData | null> {
    return null;
  }
}

export const adapters: SourceAdapter[] = [
  new AmazonAdapter(),
  new BestBuyAdapter(),
  new NeweggAdapter(),
];
