export const MOCK_PRODUCTS = [
  {
    id: 'prod-1',
    title: 'NVIDIA RTX 4090 Graphics Card',
    description: 'High-performance GPU for gaming and mining',
    category: 'pc-parts',
    brand: 'NVIDIA',
    imageUrl: 'https://via.placeholder.com/400x300?text=RTX+4090',
  },
  {
    id: 'prod-2',
    title: 'Bitmain Antminer S19 Pro',
    description: 'Bitcoin mining hardware',
    category: 'crypto-miners',
    brand: 'Bitmain',
    imageUrl: 'https://via.placeholder.com/400x300?text=Antminer+S19',
  },
  {
    id: 'prod-3',
    title: 'iPhone 15 Pro Max',
    description: 'Latest flagship smartphone',
    category: 'phones',
    brand: 'Apple',
    imageUrl: 'https://via.placeholder.com/400x300?text=iPhone+15',
  },
  {
    id: 'prod-4',
    title: 'Herman Miller Gaming Chair',
    description: 'Ergonomic gaming setup',
    category: 'gaming-setup',
    brand: 'Herman Miller',
    imageUrl: 'https://via.placeholder.com/400x300?text=Gaming+Chair',
  },
];

export const MOCK_DEALS = [
  {
    id: 'deal-1',
    productId: 'prod-1',
    retailer: 'amazon',
    price: 1599.99,
    originalPrice: 1899.99,
    discount: 15.8,
    url: 'https://amazon.com/rtx-4090',
    isActive: true,
  },
  {
    id: 'deal-2',
    productId: 'prod-2',
    retailer: 'newegg',
    price: 2999.00,
    originalPrice: 3499.00,
    discount: 14.3,
    url: 'https://newegg.com/antminer',
    isActive: true,
  },
  {
    id: 'deal-3',
    productId: 'prod-3',
    retailer: 'bestbuy',
    price: 1099.99,
    originalPrice: 1199.99,
    discount: 8.3,
    url: 'https://bestbuy.com/iphone-15',
    isActive: true,
  },
];

export const MOCK_ARTICLES = [
  {
    id: 'art-1',
    title: 'Best Graphics Cards for Crypto Mining in 2025',
    slug: 'best-gpus-crypto-mining-2025',
    excerpt: 'Complete guide to choosing the right GPU for cryptocurrency mining',
    niche: 'crypto-mining',
    content: 'Full article content here...',
  },
  {
    id: 'art-2',
    title: 'Ultimate Gaming Setup Guide: Essentials for 2025',
    slug: 'gaming-setup-guide-2025',
    excerpt: 'Everything you need for the perfect gaming room',
    niche: 'gaming-setup',
    content: 'Full article content here...',
  },
];

export const MOCK_TRENDS = [
  {
    signal: 'price_drop',
    metric: 'percentage',
    value: -15.8,
    productId: 'prod-1',
  },
  {
    signal: 'media_mention',
    metric: 'count',
    value: 47,
    productId: 'prod-2',
  },
  {
    signal: 'search_volume',
    metric: 'change',
    value: 23.5,
    productId: 'prod-3',
  },
];
