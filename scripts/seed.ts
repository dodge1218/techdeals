import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const products = await Promise.all([
    prisma.product.create({
      data: {
        title: 'NVIDIA RTX 4090 Graphics Card',
        description: 'High-performance GPU for gaming and mining. Features 24GB GDDR6X memory.',
        category: 'pc-parts',
        brand: 'NVIDIA',
        imageUrl: 'https://via.placeholder.com/400x300?text=RTX+4090',
      },
    }),
    prisma.product.create({
      data: {
        title: 'Bitmain Antminer S19 Pro',
        description: 'Professional Bitcoin mining hardware with 110 TH/s hashrate.',
        category: 'crypto-miners',
        brand: 'Bitmain',
        imageUrl: 'https://via.placeholder.com/400x300?text=Antminer+S19',
      },
    }),
    prisma.product.create({
      data: {
        title: 'iPhone 15 Pro Max',
        description: 'Latest flagship smartphone with A17 Pro chip and titanium design.',
        category: 'phones',
        brand: 'Apple',
        imageUrl: 'https://via.placeholder.com/400x300?text=iPhone+15',
      },
    }),
    prisma.product.create({
      data: {
        title: 'Herman Miller X Logitech Gaming Chair',
        description: 'Ergonomic gaming chair designed for comfort during long sessions.',
        category: 'gaming-setup',
        brand: 'Herman Miller',
        imageUrl: 'https://via.placeholder.com/400x300?text=Gaming+Chair',
      },
    }),
  ]);

  console.log(`✓ Created ${products.length} products`);

  const deals = await Promise.all([
    prisma.deal.create({
      data: {
        productId: products[0].id,
        retailer: 'amazon',
        price: 1599.99,
        originalPrice: 1899.99,
        discount: 15.8,
        url: 'https://amazon.com/rtx-4090',
        isActive: true,
      },
    }),
    prisma.deal.create({
      data: {
        productId: products[1].id,
        retailer: 'newegg',
        price: 2999.00,
        originalPrice: 3499.00,
        discount: 14.3,
        url: 'https://newegg.com/antminer',
        isActive: true,
      },
    }),
    prisma.deal.create({
      data: {
        productId: products[2].id,
        retailer: 'bestbuy',
        price: 1099.99,
        originalPrice: 1199.99,
        discount: 8.3,
        url: 'https://bestbuy.com/iphone-15',
        isActive: true,
      },
    }),
    prisma.deal.create({
      data: {
        productId: products[3].id,
        retailer: 'amazon',
        price: 1295.00,
        originalPrice: 1495.00,
        discount: 13.4,
        url: 'https://amazon.com/herman-miller-chair',
        isActive: true,
      },
    }),
  ]);

  console.log(`✓ Created ${deals.length} deals`);

  const article = await prisma.article.create({
    data: {
      title: 'Best Graphics Cards for Crypto Mining in 2025',
      slug: 'best-gpus-crypto-mining-2025',
      excerpt: 'Complete guide to choosing the right GPU for cryptocurrency mining, including performance benchmarks and ROI calculations.',
      niche: 'crypto-mining',
      content: `# Best Graphics Cards for Crypto Mining in 2025

Mining cryptocurrency has evolved significantly, and choosing the right GPU is crucial for profitability.

## Why the RTX 4090?

The NVIDIA RTX 4090 stands out as a top choice for several reasons:

1. **Hash Rate Performance**: Delivers exceptional mining performance across multiple algorithms
2. **Energy Efficiency**: Despite high power, the efficiency per hash is competitive
3. **Resale Value**: Strong secondary market if you exit mining
4. **Build Quality**: Enterprise-grade components ensure longevity

[Check Current RTX 4090 Prices on Amazon](#)

## Key Considerations

When selecting mining hardware, factor in:

- Initial investment vs. ROI timeline
- Power consumption and electricity costs
- Cooling requirements
- Pool fees and mining software

[Compare Prices at Newegg](#)

---

**Disclosure:** As an Amazon Associate and affiliate partner with other retailers, we earn from qualifying purchases.`,
      products: {
        connect: [{ id: products[0].id }],
      },
    },
  });

  console.log(`✓ Created article: ${article.title}`);

  const trends = await Promise.all([
    prisma.trend.create({
      data: {
        productId: products[0].id,
        signal: 'price_drop',
        metric: 'percentage',
        value: -15.8,
      },
    }),
    prisma.trend.create({
      data: {
        productId: products[1].id,
        signal: 'media_mention',
        metric: 'count',
        value: 47,
      },
    }),
    prisma.trend.create({
      data: {
        productId: products[2].id,
        signal: 'search_volume',
        metric: 'change',
        value: 23.5,
      },
    }),
  ]);

  console.log(`✓ Created ${trends.length} trends`);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
