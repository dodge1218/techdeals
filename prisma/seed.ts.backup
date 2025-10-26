import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding TechDeals database...');
  console.log('');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.socialPost.deleteMany();
  await prisma.dealPost.deleteMany();
  await prisma.affiliateLink.deleteMany();
  await prisma.priceWatch.deleteMany();
  await prisma.priceHistory.deleteMany();
  await prisma.trend.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.article.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.product.deleteMany();
  console.log('✓ Database cleaned');
  console.log('');

  // ============================================
  // PRODUCTS (10 across 4 categories)
  // ============================================
  console.log('📦 Creating products...');

  // PC Parts (4 products)
  const rtx4090 = await prisma.product.create({
    data: {
      externalId: 'B08HR6FMK3',
      source: 'amazon',
      title: 'NVIDIA GeForce RTX 4090 Founders Edition',
      description: 'The ultimate graphics card for gaming and content creation. 24GB GDDR6X memory, 16384 CUDA cores.',
      category: 'pc-parts',
      brand: 'NVIDIA',
      model: 'RTX 4090',
      imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400',
      imageAltText: 'NVIDIA RTX 4090 graphics card',
      specs: JSON.stringify({
        memory: '24GB GDDR6X',
        coreClock: '2520 MHz',
        boostClock: '2520 MHz',
        cudaCores: 16384,
        tdp: '450W',
        ports: ['HDMI 2.1', '3x DisplayPort 1.4a'],
        dimensions: '304mm x 137mm x 61mm',
      }),
      isActive: true,
      lastScraped: new Date(),
    },
  });

  const i913900k = await prisma.product.create({
    data: {
      externalId: 'BZ8V4RX9WR',
      source: 'amazon',
      title: 'Intel Core i9-13900K Desktop Processor',
      description: '24 cores (8 P-cores + 16 E-cores) and 32 threads. Up to 5.8 GHz max turbo frequency.',
      category: 'pc-parts',
      brand: 'Intel',
      model: 'i9-13900K',
      imageUrl: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400',
      imageAltText: 'Intel Core i9 processor',
      specs: JSON.stringify({
        cores: 24,
        threads: 32,
        baseClock: '3.0 GHz',
        boostClock: '5.8 GHz',
        cache: '36MB',
        tdp: '125W',
        socket: 'LGA1700',
      }),
      isActive: true,
    },
  });

  const ddr5Ram = await prisma.product.create({
    data: {
      externalId: 'CMK64GX5M2B5200C40',
      source: 'newegg',
      title: 'Corsair Vengeance DDR5 RAM 64GB (2x32GB) 5200MHz',
      description: 'High-performance DDR5 memory designed for gaming and content creation.',
      category: 'pc-parts',
      brand: 'Corsair',
      model: 'Vengeance DDR5',
      imageUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400',
      specs: JSON.stringify({
        capacity: '64GB',
        speed: '5200MHz',
        type: 'DDR5',
        modules: '2x32GB',
        latency: 'CL40',
        voltage: '1.25V',
      }),
      isActive: true,
    },
  });

  const nvmeSSD = await prisma.product.create({
    data: {
      externalId: 'MZ-V9P2T0B/AM',
      source: 'bestbuy',
      title: 'Samsung 990 PRO 2TB PCIe 4.0 NVMe M.2 SSD',
      description: 'Ultra-fast PCIe 4.0 NVMe SSD with sequential read speeds up to 7,450 MB/s.',
      category: 'pc-parts',
      brand: 'Samsung',
      model: '990 PRO',
      imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400',
      specs: JSON.stringify({
        capacity: '2TB',
        interface: 'PCIe 4.0 x4',
        formFactor: 'M.2 2280',
        readSpeed: '7450 MB/s',
        writeSpeed: '6900 MB/s',
        tbw: '1200 TB',
      }),
      isActive: true,
    },
  });

  // Crypto Miners (2 products)
  const antminerS19Pro = await prisma.product.create({
    data: {
      externalId: 'ANTMINER-S19PRO-110TH',
      source: 'newegg',
      title: 'Bitmain Antminer S19 Pro 110TH/s Bitcoin Miner',
      description: 'Professional Bitcoin mining hardware with 110 TH/s hashrate and SHA-256 algorithm.',
      category: 'crypto-miners',
      brand: 'Bitmain',
      model: 'Antminer S19 Pro',
      imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
      specs: JSON.stringify({
        hashrate: '110 TH/s',
        power: '3250W',
        algorithm: 'SHA-256',
        efficiency: '29.5 J/TH',
        weight: '13.2 kg',
        dimensions: '400mm x 195mm x 290mm',
      }),
      isActive: true,
    },
  });

  const whatsminerM30S = await prisma.product.create({
    data: {
      externalId: 'WHATSMINER-M30S-88TH',
      source: 'newegg',
      title: 'MicroBT Whatsminer M30S+ 88TH/s Bitcoin Miner',
      description: 'Efficient Bitcoin mining rig with 88 TH/s and low power consumption.',
      category: 'crypto-miners',
      brand: 'MicroBT',
      model: 'Whatsminer M30S+',
      imageUrl: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400',
      specs: JSON.stringify({
        hashrate: '88 TH/s',
        power: '3344W',
        algorithm: 'SHA-256',
        efficiency: '38 J/TH',
      }),
      isActive: true,
    },
  });

  // Phones (2 products)
  const iphone15ProMax = await prisma.product.create({
    data: {
      externalId: 'MLU73LL/A',
      source: 'bestbuy',
      title: 'Apple iPhone 15 Pro Max 256GB Natural Titanium',
      description: 'A17 Pro chip, titanium design, 48MP camera system, and USB-C connectivity.',
      category: 'phones',
      brand: 'Apple',
      model: 'iPhone 15 Pro Max',
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400',
      specs: JSON.stringify({
        storage: '256GB',
        chip: 'A17 Pro',
        display: '6.7" Super Retina XDR',
        camera: '48MP Main, 12MP Ultra Wide, 12MP Telephoto',
        battery: '4422 mAh',
        connectivity: 'USB-C',
      }),
      isActive: true,
    },
  });

  const galaxyS24Ultra = await prisma.product.create({
    data: {
      externalId: 'SM-S928UZKAXAA',
      source: 'bestbuy',
      title: 'Samsung Galaxy S24 Ultra 256GB Titanium Black',
      description: 'Snapdragon 8 Gen 3, 200MP camera, built-in S Pen, and titanium frame.',
      category: 'phones',
      brand: 'Samsung',
      model: 'Galaxy S24 Ultra',
      imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
      specs: JSON.stringify({
        storage: '256GB',
        processor: 'Snapdragon 8 Gen 3',
        display: '6.8" Dynamic AMOLED 2X',
        camera: '200MP Main, 50MP Telephoto, 12MP Ultra Wide',
        battery: '5000 mAh',
        sPen: 'Included',
      }),
      isActive: true,
    },
  });

  // Gaming Setup (2 products)
  const hermanMillerAeron = await prisma.product.create({
    data: {
      externalId: 'AER2C23DWALPG1G1G1BBBBAJBKDVPRPS',
      source: 'amazon',
      title: 'Herman Miller Aeron Ergonomic Office Chair Size B',
      description: 'Fully adjustable ergonomic chair with PostureFit SL support and 12-year warranty.',
      category: 'gaming-setup',
      brand: 'Herman Miller',
      model: 'Aeron',
      imageUrl: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400',
      specs: JSON.stringify({
        size: 'B (Medium)',
        armrests: '4D adjustable',
        lumbarSupport: 'PostureFit SL',
        tilt: 'Forward tilt, seat angle',
        warranty: '12 years',
        weight: '48 lbs',
      }),
      isActive: true,
    },
  });

  const lianLiDesk = await prisma.product.create({
    data: {
      externalId: 'DK-04F',
      source: 'amazon',
      title: 'Lian Li DK-04F Motorized Standing Desk 63"',
      description: 'Premium motorized standing desk with cable management and tempered glass top.',
      category: 'gaming-setup',
      brand: 'Lian Li',
      model: 'DK-04F',
      imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=400',
      specs: JSON.stringify({
        size: '63" x 31.5"',
        heightRange: '28.3" - 48"',
        motors: 'Dual motor',
        weight: '110 lbs',
        maxLoad: '220 lbs',
      }),
      isActive: true,
    },
  });

  console.log('✓ Created 10 products');
  console.log('');

  // ============================================
  // DEALS (20+ deals)
  // ============================================
  console.log('💰 Creating deals...');

  const deals = await Promise.all([
    // RTX 4090 deals
    prisma.deal.create({
      data: {
        productId: rtx4090.id,
        retailer: 'amazon',
        retailerSKU: 'B08HR6FMK3',
        price: 1599.99,
        originalPrice: 1899.99,
        discount: 15.79,
        url: 'https://amazon.com/dp/B08HR6FMK3',
        affiliateUrl: 'https://amazon.com/dp/B08HR6FMK3?tag=techdeals-20&utm_source=techdeals&utm_medium=web&utm_campaign=gpu-deals',
        currency: 'USD',
        isActive: true,
        inStock: true,
      },
    }),
    prisma.deal.create({
      data: {
        productId: rtx4090.id,
        retailer: 'bestbuy',
        price: 1649.99,
        originalPrice: 1899.99,
        discount: 13.16,
        url: 'https://bestbuy.com/site/nvidia-geforce-rtx-4090/6523718',
        affiliateUrl: 'https://bestbuy.com/site/nvidia-geforce-rtx-4090/6523718?utm_source=techdeals',
        currency: 'USD',
        isActive: true,
        inStock: true,
      },
    }),

    // i9-13900K deals
    prisma.deal.create({
      data: {
        productId: i913900k.id,
        retailer: 'amazon',
        retailerSKU: 'BZ8V4RX9WR',
        price: 549.99,
        originalPrice: 629.99,
        discount: 12.70,
        url: 'https://amazon.com/dp/BZ8V4RX9WR',
        affiliateUrl: 'https://amazon.com/dp/BZ8V4RX9WR?tag=techdeals-20',
        currency: 'USD',
        isActive: true,
        inStock: true,
      },
    }),
    prisma.deal.create({
      data: {
        productId: i913900k.id,
        retailer: 'newegg',
        price: 539.99,
        originalPrice: 629.99,
        discount: 14.29,
        url: 'https://newegg.com/intel-core-i9-13900k',
        affiliateUrl: 'https://newegg.com/intel-core-i9-13900k?utm_source=techdeals',
        currency: 'USD',
        isActive: true,
        inStock: false,
      },
    }),

    // DDR5 RAM deals
    prisma.deal.create({
      data: {
        productId: ddr5Ram.id,
        retailer: 'newegg',
        retailerSKU: 'CMK64GX5M2B5200C40',
        price: 219.99,
        originalPrice: 279.99,
        discount: 21.43,
        url: 'https://newegg.com/corsair-64gb-ddr5',
        affiliateUrl: 'https://newegg.com/corsair-64gb-ddr5?utm_source=techdeals',
        currency: 'USD',
        isActive: true,
        inStock: true,
      },
    }),
    prisma.deal.create({
      data: {
        productId: ddr5Ram.id,
        retailer: 'amazon',
        price: 229.99,
        originalPrice: 279.99,
        discount: 17.86,
        url: 'https://amazon.com/corsair-vengeance-ddr5',
        affiliateUrl: 'https://amazon.com/corsair-vengeance-ddr5?tag=techdeals-20',
        currency: 'USD',
        isActive: true,
        inStock: true,
      },
    }),

    // Samsung SSD deals
    prisma.deal.create({
      data: {
        productId: nvmeSSD.id,
        retailer: 'bestbuy',
        retailerSKU: '6523725',
        price: 159.99,
        originalPrice: 199.99,
        discount: 20.00,
        url: 'https://bestbuy.com/site/samsung-990-pro',
        affiliateUrl: 'https://bestbuy.com/site/samsung-990-pro?utm_source=techdeals',
        currency: 'USD',
        isActive: true,
        inStock: true,
      },
    }),
    prisma.deal.create({
      data: {
        productId: nvmeSSD.id,
        retailer: 'amazon',
        price: 164.99,
        originalPrice: 199.99,
        discount: 17.50,
        url: 'https://amazon.com/samsung-990-pro',
        affiliateUrl: 'https://amazon.com/samsung-990-pro?tag=techdeals-20',
        currency: 'USD',
        isActive: true,
        inStock: true,
      },
    }),

    // Antminer deals
    prisma.deal.create({
      data: {
        productId: antminerS19Pro.id,
        retailer: 'newegg',
        retailerSKU: 'ANTMINER-S19PRO-110TH',
        price: 2499.99,
        originalPrice: 3499.99,
        discount: 28.57,
        url: 'https://newegg.com/bitmain-antminer-s19-pro',
        affiliateUrl: 'https://newegg.com/bitmain-antminer-s19-pro?utm_source=techdeals',
        currency: 'USD',
        isActive: true,
        inStock: true,
        stockCount: 15,
      },
    }),

    // Whatsminer deals
    prisma.deal.create({
      data: {
        productId: whatsminerM30S.id,
        retailer: 'newegg',
        price: 1999.99,
        originalPrice: 2799.99,
        discount: 28.57,
        url: 'https://newegg.com/whatsminer-m30s',
        affiliateUrl: 'https://newegg.com/whatsminer-m30s?utm_source=techdeals',
        currency: 'USD',
        isActive: true,
        inStock: true,
        stockCount: 8,
      },
    }),

    // iPhone deals
    prisma.deal.create({
      data: {
        productId: iphone15ProMax.id,
        retailer: 'bestbuy',
        retailerSKU: '6522153',
        price: 1099.99,
        originalPrice: 1199.99,
        discount: 8.33,
        url: 'https://bestbuy.com/site/apple-iphone-15-pro-max/6522153',
        affiliateUrl: 'https://bestbuy.com/site/apple-iphone-15-pro-max/6522153?utm_source=techdeals',
        currency: 'USD',
        isActive: true,
        inStock: true,
      },
    }),
    prisma.deal.create({
      data: {
        productId: iphone15ProMax.id,
        retailer: 'amazon',
        price: 1119.99,
        originalPrice: 1199.99,
        discount: 6.67,
        url: 'https://amazon.com/apple-iphone-15-pro-max',
        affiliateUrl: 'https://amazon.com/apple-iphone-15-pro-max?tag=techdeals-20',
        currency: 'USD',
        isActive: true,
        inStock: true,
      },
    }),

    // Galaxy S24 Ultra deals
    prisma.deal.create({
      data: {
        productId: galaxyS24Ultra.id,
        retailer: 'bestbuy',
        price: 1099.99,
        originalPrice: 1299.99,
        discount: 15.38,
        url: 'https://bestbuy.com/site/samsung-galaxy-s24-ultra',
        affiliateUrl: 'https://bestbuy.com/site/samsung-galaxy-s24-ultra?utm_source=techdeals',
        currency: 'USD',
        isActive: true,
        inStock: true,
      },
    }),
    prisma.deal.create({
      data: {
        productId: galaxyS24Ultra.id,
        retailer: 'amazon',
        price: 1149.99,
        originalPrice: 1299.99,
        discount: 11.54,
        url: 'https://amazon.com/samsung-galaxy-s24-ultra',
        affiliateUrl: 'https://amazon.com/samsung-galaxy-s24-ultra?tag=techdeals-20',
        currency: 'USD',
        isActive: true,
        inStock: true,
      },
    }),

    // Herman Miller chair deals
    prisma.deal.create({
      data: {
        productId: hermanMillerAeron.id,
        retailer: 'amazon',
        price: 1295.00,
        originalPrice: 1495.00,
        discount: 13.38,
        url: 'https://amazon.com/herman-miller-aeron',
        affiliateUrl: 'https://amazon.com/herman-miller-aeron?tag=techdeals-20',
        currency: 'USD',
        isActive: true,
        inStock: true,
      },
    }),

    // Lian Li desk deals
    prisma.deal.create({
      data: {
        productId: lianLiDesk.id,
        retailer: 'amazon',
        price: 899.99,
        originalPrice: 1099.99,
        discount: 18.18,
        url: 'https://amazon.com/lian-li-dk-04f',
        affiliateUrl: 'https://amazon.com/lian-li-dk-04f?tag=techdeals-20',
        currency: 'USD',
        isActive: true,
        inStock: true,
      },
    }),
  ]);

  console.log(`✓ Created ${deals.length} deals`);
  console.log('');

  // ============================================
  // PRICE HISTORY (50+ records)
  // ============================================
  console.log('📊 Creating price history...');

  const now = new Date();
  const priceHistoryData = [];

  // RTX 4090 price trend (dropped from $1899 to $1599 over 3 weeks)
  for (let i = 21; i >= 0; i--) {
    priceHistoryData.push({
      productId: rtx4090.id,
      price: 1899.99 - (i * 14.29), // Gradual decrease
      source: 'amazon',
      timestamp: new Date(now.getTime() - i * 24 * 60 * 60 * 1000),
    });
  }

  // i9-13900K stable then sudden drop
  for (let i = 14; i >= 0; i--) {
    priceHistoryData.push({
      productId: i913900k.id,
      price: i > 5 ? 629.99 : 549.99,
      source: 'amazon',
      timestamp: new Date(now.getTime() - i * 24 * 60 * 60 * 1000),
    });
  }

  // Antminer volatile pricing
  [30, 27, 23, 20, 17, 14, 11, 8, 5, 2, 0].forEach((daysAgo) => {
    priceHistoryData.push({
      productId: antminerS19Pro.id,
      price: 3499.99 - Math.random() * 1000,
      source: 'newegg',
      timestamp: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
    });
  });

  // iPhone minor fluctuations
  [14, 10, 7, 3, 0].forEach((daysAgo) => {
    priceHistoryData.push({
      productId: iphone15ProMax.id,
      price: 1199.99 - Math.random() * 100,
      source: 'bestbuy',
      timestamp: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
    });
  });

  await prisma.priceHistory.createMany({ data: priceHistoryData });

  console.log(`✓ Created ${priceHistoryData.length} price history records`);
  console.log('');

  // ============================================
  // MEDIA ASSETS (15+ YouTube videos)
  // ============================================
  console.log('🎥 Creating media assets...');

  await prisma.mediaAsset.createMany({
    data: [
      // RTX 4090 videos
      {
        productId: rtx4090.id,
        platform: 'youtube',
        externalId: 'dQw4w9WgXcQ',
        title: 'RTX 4090 Review: The Ultimate Gaming GPU?',
        description: 'Full review and benchmark results of the NVIDIA RTX 4090 Founders Edition',
        channelName: 'Linus Tech Tips',
        thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: 847,
        viewCount: 1234567,
        likeCount: 45678,
        url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        embedUrl: 'https://youtube.com/embed/dQw4w9WgXcQ',
        publishedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        productId: rtx4090.id,
        platform: 'youtube',
        externalId: 'jNQXAC9IVRw',
        title: 'RTX 4090 Mining Performance Test',
        description: 'Testing the RTX 4090 hashrate on various crypto algorithms',
        channelName: 'Gamers Nexus',
        thumbnailUrl: 'https://i.ytimg.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
        duration: 1024,
        viewCount: 876543,
        likeCount: 32145,
        url: 'https://youtube.com/watch?v=jNQXAC9IVRw',
        embedUrl: 'https://youtube.com/embed/jNQXAC9IVRw',
        publishedAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      },
      {
        productId: rtx4090.id,
        platform: 'youtube',
        externalId: '9bZkp7q19f0',
        title: 'RTX 4090 vs 4080: Worth the Upgrade?',
        channelName: 'JayzTwoCents',
        thumbnailUrl: 'https://i.ytimg.com/vi/9bZkp7q19f0/maxresdefault.jpg',
        duration: 625,
        viewCount: 543210,
        url: 'https://youtube.com/watch?v=9bZkp7q19f0',
        embedUrl: 'https://youtube.com/embed/9bZkp7q19f0',
        publishedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      },

      // i9-13900K videos
      {
        productId: i913900k.id,
        platform: 'youtube',
        externalId: 'astISOttCQ0',
        title: 'Intel i9-13900K Review: Gaming & Productivity Beast',
        channelName: 'Hardware Unboxed',
        thumbnailUrl: 'https://i.ytimg.com/vi/astISOttCQ0/maxresdefault.jpg',
        duration: 912,
        viewCount: 654321,
        url: 'https://youtube.com/watch?v=astISOttCQ0',
        embedUrl: 'https://youtube.com/embed/astISOttCQ0',
        publishedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      },

      // Antminer videos
      {
        productId: antminerS19Pro.id,
        platform: 'youtube',
        externalId: 'L_jWHffIx5E',
        title: 'Antminer S19 Pro Setup Guide & Profitability',
        description: 'Complete setup tutorial and profitability analysis',
        channelName: 'VoskCoin',
        thumbnailUrl: 'https://i.ytimg.com/vi/L_jWHffIx5E/maxresdefault.jpg',
        duration: 1534,
        viewCount: 234567,
        likeCount: 8976,
        url: 'https://youtube.com/watch?v=L_jWHffIx5E',
        embedUrl: 'https://youtube.com/embed/L_jWHffIx5E',
        publishedAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      },
      {
        productId: antminerS19Pro.id,
        platform: 'youtube',
        externalId: 'yXWw0_UfSRs',
        title: 'Is Bitcoin Mining Still Profitable in 2025?',
        channelName: 'Crypto Mining Insider',
        thumbnailUrl: 'https://i.ytimg.com/vi/yXWw0_UfSRs/maxresdefault.jpg',
        duration: 843,
        viewCount: 456789,
        url: 'https://youtube.com/watch?v=yXWw0_UfSRs',
        embedUrl: 'https://youtube.com/embed/yXWw0_UfSRs',
        publishedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      },

      // iPhone videos
      {
        productId: iphone15ProMax.id,
        platform: 'youtube',
        externalId: 'AXZZXzuMmJQ',
        title: 'iPhone 15 Pro Max Review: The Complete Package',
        channelName: 'MKBHD',
        thumbnailUrl: 'https://i.ytimg.com/vi/AXZZXzuMmJQ/maxresdefault.jpg',
        duration: 721,
        viewCount: 3456789,
        likeCount: 123456,
        url: 'https://youtube.com/watch?v=AXZZXzuMmJQ',
        embedUrl: 'https://youtube.com/embed/AXZZXzuMmJQ',
        publishedAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000),
      },
      {
        productId: iphone15ProMax.id,
        platform: 'youtube',
        externalId: 'CW4CnXA9kTU',
        title: 'iPhone 15 Pro Max Camera Test',
        channelName: 'MrMobile',
        thumbnailUrl: 'https://i.ytimg.com/vi/CW4CnXA9kTU/maxresdefault.jpg',
        duration: 548,
        viewCount: 987654,
        url: 'https://youtube.com/watch?v=CW4CnXA9kTU',
        embedUrl: 'https://youtube.com/embed/CW4CnXA9kTU',
        publishedAt: new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000),
      },

      // Galaxy S24 Ultra videos
      {
        productId: galaxyS24Ultra.id,
        platform: 'youtube',
        externalId: '1La4QzGeaaQ',
        title: 'Galaxy S24 Ultra Review: Samsung Does It Again',
        channelName: 'MKBHD',
        thumbnailUrl: 'https://i.ytimg.com/vi/1La4QzGeaaQ/maxresdefault.jpg',
        duration: 834,
        viewCount: 2345678,
        url: 'https://youtube.com/watch?v=1La4QzGeaaQ',
        embedUrl: 'https://youtube.com/embed/1La4QzGeaaQ',
        publishedAt: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000),
      },

      // Herman Miller chair videos
      {
        productId: hermanMillerAeron.id,
        platform: 'youtube',
        externalId: 'QnddHR2JCCY',
        title: 'Herman Miller Aeron: Worth $1500?',
        channelName: 'Ahnestly',
        thumbnailUrl: 'https://i.ytimg.com/vi/QnddHR2JCCY/maxresdefault.jpg',
        duration: 456,
        viewCount: 567890,
        url: 'https://youtube.com/watch?v=QnddHR2JCCY',
        embedUrl: 'https://youtube.com/embed/QnddHR2JCCY',
        publishedAt: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
      },

      // Gaming desk videos
      {
        productId: lianLiDesk.id,
        platform: 'youtube',
        externalId: 'eT8VlyWxd2Q',
        title: 'Lian Li DK-04F Desk Review: Ultimate Gaming Setup',
        channelName: 'Optimum Tech',
        thumbnailUrl: 'https://i.ytimg.com/vi/eT8VlyWxd2Q/maxresdefault.jpg',
        duration: 678,
        viewCount: 345678,
        url: 'https://youtube.com/watch?v=eT8VlyWxd2Q',
        embedUrl: 'https://youtube.com/embed/eT8VlyWxd2Q',
        publishedAt: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✓ Created 12 media assets');
  console.log('');

  // ============================================
  // ARTICLES (5 published)
  // ============================================
  console.log('📝 Creating articles...');

  const article1 = await prisma.article.create({
    data: {
      title: 'Best Graphics Cards for Crypto Mining in 2025',
      slug: 'best-gpus-crypto-mining-2025',
      content: `# Best Graphics Cards for Crypto Mining in 2025

## TL;DR
- **Best Overall:** NVIDIA RTX 4090 - Unmatched hashrate and efficiency
- **Best Value:** AMD RX 7900 XT - Great price/performance ratio
- **Best Efficiency:** NVIDIA RTX 4070 - Low power consumption

## Why This Matters

The cryptocurrency mining landscape has evolved significantly in 2025. With Ethereum fully transitioned to proof-of-stake and new proof-of-work coins emerging, choosing the right GPU is critical for profitability. This guide covers the top graphics cards based on hashrate, power efficiency, and ROI.

## Top Recommendations

### 1. NVIDIA GeForce RTX 4090 - $1,599 🏆

**Best For:** Maximum performance miners and enthusiasts

The RTX 4090 remains the undisputed king of mining GPUs. With 24GB of GDDR6X memory and 16,384 CUDA cores, it delivers exceptional hashrates across multiple algorithms.

**Key Specs:**
- **Hashrate:** 120 MH/s (Ethereum), 3.2 GH/s (Kaspa), 85 MH/s (Ravencoin)
- **Power Consumption:** 450W TDP (optimizable to 350W)
- **Efficiency:** 0.34 MH/W (Ethereum)
- **Memory:** 24GB GDDR6X

**Why We Recommend It:**
- Future-proof for new memory-intensive algorithms
- Excellent resale value
- Great for dual-purpose (gaming + mining)

[**View Current Price →**](https://amazon.com/dp/B08HR6FMK3?tag=techdeals-20&utm_source=techdeals&utm_medium=article&utm_campaign=gpu-mining)

---

### 2. AMD RX 7900 XT - $899 💎

**Best For:** Budget-conscious miners

The RX 7900 XT offers incredible value, delivering 95 MH/s on Ethereum at just $899. It's perfect for building multi-GPU mining rigs without breaking the bank.

**Key Specs:**
- **Hashrate:** 95 MH/s (Ethereum), 2.8 GH/s (Kaspa)
- **Power:** 300W TDP
- **Efficiency:** 0.32 MH/W

---

### 3. NVIDIA RTX 4070 - $599 ⚡

**Best For:** Efficiency-focused miners

The RTX 4070 sips power while delivering solid performance. Perfect for regions with high electricity costs.

**Key Specs:**
- **Hashrate:** 65 MH/s (Ethereum)
- **Power:** 200W TDP
- **Efficiency:** 0.33 MH/W (best in class)

---

## Profitability Comparison (March 2025)

Based on current difficulty and $0.12/kWh electricity:

| GPU | Daily Profit | ROI Period | Break-even |
|-----|-------------|-----------|------------|
| RTX 4090 | $8.50 | 188 days | 6.2 months |
| RX 7900 XT | $5.20 | 173 days | 5.7 months |
| RTX 4070 | $3.80 | 158 days | 5.2 months |

*Note: Profitability varies with coin prices and network difficulty*

---

## FAQ

**Q: Is GPU mining still profitable in 2025?**  
A: Yes, but profitability depends heavily on electricity costs. Aim for <$0.10/kWh for best results. New coins like Kaspa and Flux show promise.

**Q: How long until I break even?**  
A: Typically 5-8 months for mid-range GPUs at current difficulty levels. High-end cards may take longer due to higher upfront costs.

**Q: Should I buy used mining GPUs?**  
A: We recommend buying new for warranty coverage. Mining puts stress on GPUs, and manufacturer support is valuable.

**Q: What about ASIC miners?**  
A: ASICs are more efficient for established coins like Bitcoin, but GPUs offer flexibility to switch algorithms as markets change.

---

## Responsible Buying Notes

⚠️ **Important Considerations:**
- Calculate electricity costs before investing
- Consider environmental impact (proof-of-stake alternatives exist)
- Verify warranty doesn't exclude mining use
- Monitor market volatility—don't invest more than you can afford to lose
- Factor in cooling costs for multi-GPU rigs

---

## Conclusion

The RTX 4090 is our top pick for serious miners who want maximum performance and future-proofing. For budget builds, the RX 7900 XT offers excellent value. And if electricity costs are your main concern, the RTX 4070's efficiency can't be beat.

**Ready to start mining?** Check out our deals on the products mentioned above.

---

**Disclosure:** We earn from qualifying purchases made through our affiliate links. This supports our site at no extra cost to you. All recommendations are based on independent testing and research. Prices accurate as of ${new Date().toLocaleDateString()}.`,
      excerpt: 'Complete 2025 guide to choosing the best GPU for cryptocurrency mining. Compare hashrates, power consumption, profitability, and ROI across NVIDIA and AMD cards.',
      niche: 'crypto-mining',
      status: 'published',
      metaTitle: 'Best GPUs for Crypto Mining 2025 - Hashrate & Profitability Guide',
      metaDescription: 'Top graphics cards for mining Ethereum, Kaspa, and altcoins. Expert benchmarks, hashrates, power consumption, and profitability analysis. Updated March 2025.',
      ogImage: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1200',
      publishedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      products: {
        connect: [{ id: rtx4090.id }],
      },
    },
  });

  const article2 = await prisma.article.create({
    data: {
      title: 'Ultimate Gaming PC Build Guide 2025: $1500-$2500 Budget',
      slug: 'gaming-pc-build-guide-2025',
      content: `# Ultimate Gaming PC Build Guide 2025

Complete component breakdown for high-performance gaming PCs in the $1500-$2500 range.

## Build Components

### CPU: Intel i9-13900K - $549
The i9-13900K offers 24 cores and exceptional gaming performance. [View Deal →](https://amazon.com/dp/BZ8V4RX9WR?tag=techdeals-20)

### GPU: NVIDIA RTX 4090 - $1,599
Ultimate 4K gaming performance. [View Deal →](https://amazon.com/dp/B08HR6FMK3?tag=techdeals-20)

### RAM: Corsair Vengeance DDR5 64GB - $219
Fast DDR5 memory for multitasking. [View Deal →](https://newegg.com/corsair-64gb-ddr5?utm_source=techdeals)

### Storage: Samsung 990 PRO 2TB - $159
Lightning-fast NVMe storage. [View Deal →](https://bestbuy.com/site/samsung-990-pro?utm_source=techdeals)

## Total: ~$2,526 (excluding case, PSU, cooling)

**Disclosure:** We earn from qualifying purchases. Prices as of ${new Date().toLocaleDateString()}.`,
      excerpt: 'Build the ultimate gaming PC with our $1500-$2500 component guide. Intel i9-13900K, RTX 4090, DDR5 RAM, and more.',
      niche: 'pc-building',
      status: 'published',
      metaTitle: 'Gaming PC Build Guide 2025 - $1500-$2500 Budget',
      publishedAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      products: {
        connect: [
          { id: rtx4090.id },
          { id: i913900k.id },
          { id: ddr5Ram.id },
          { id: nvmeSSD.id },
        ],
      },
    },
  });

  const article3 = await prisma.article.create({
    data: {
      title: 'Best Bitcoin Mining Rigs 2025: ASIC Comparison',
      slug: 'best-bitcoin-mining-rigs-2025',
      content: `# Best Bitcoin Mining Rigs 2025

## Top ASIC Miners

### Bitmain Antminer S19 Pro - $2,499
110 TH/s hashrate, 3250W power. Industry standard for Bitcoin mining.
[View Deal →](https://newegg.com/bitmain-antminer-s19-pro?utm_source=techdeals)

### MicroBT Whatsminer M30S+ - $1,999
88 TH/s hashrate, more efficient cooling system.
[View Deal →](https://newegg.com/whatsminer-m30s?utm_source=techdeals)

## Profitability Analysis
Current Bitcoin mining profitability with $0.12/kWh electricity costs.

**Disclosure:** Affiliate links support our site. Updated ${new Date().toLocaleDateString()}.`,
      excerpt: 'Compare top Bitcoin ASIC miners: Antminer S19 Pro vs Whatsminer M30S+. Hashrates, power consumption, and profitability.',
      niche: 'bitcoin-mining',
      status: 'published',
      publishedAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
      products: {
        connect: [{ id: antminerS19Pro.id }, { id: whatsminerM30S.id }],
      },
    },
  });

  const article4 = await prisma.article.create({
    data: {
      title: 'iPhone 15 Pro Max vs Galaxy S24 Ultra: Which Flagship Wins?',
      slug: 'iphone-15-pro-max-vs-galaxy-s24-ultra',
      content: `# iPhone 15 Pro Max vs Galaxy S24 Ultra

## Design & Build
- **iPhone:** Titanium frame, 48MP camera, A17 Pro chip
- **Galaxy:** Titanium frame, 200MP camera, Snapdragon 8 Gen 3, S Pen

## Camera Comparison
Galaxy S24 Ultra's 200MP sensor offers incredible detail, but iPhone's computational photography remains unmatched.

## Pricing
- [iPhone 15 Pro Max - $1,099 →](https://bestbuy.com/site/apple-iphone-15-pro-max/6522153?utm_source=techdeals)
- [Galaxy S24 Ultra - $1,099 →](https://bestbuy.com/site/samsung-galaxy-s24-ultra?utm_source=techdeals)

**Disclosure:** We earn from qualifying purchases. ${new Date().toLocaleDateString()}.`,
      excerpt: 'Head-to-head comparison: iPhone 15 Pro Max vs Samsung Galaxy S24 Ultra. Camera, performance, battery, and value analysis.',
      niche: 'smartphones',
      status: 'published',
      publishedAt: new Date(now.getTime() - 55 * 24 * 60 * 60 * 1000),
      products: {
        connect: [{ id: iphone15ProMax.id }, { id: galaxyS24Ultra.id }],
      },
    },
  });

  const article5 = await prisma.article.create({
    data: {
      title: 'Best Ergonomic Chairs for Gaming & Home Office 2025',
      slug: 'best-ergonomic-chairs-gaming-2025',
      content: `# Best Ergonomic Chairs for Gaming & Home Office 2025

## Herman Miller Aeron - $1,295 🏆

The gold standard of office chairs. 12-year warranty, PostureFit SL lumbar support, and breathable mesh design.

**Why We Love It:**
- Exceptional build quality
- Highly adjustable (arms, tilt, lumbar)
- Proven durability (12-year warranty)

[**View Current Price →**](https://amazon.com/herman-miller-aeron?tag=techdeals-20)

## Why Ergonomics Matter

Spending 8+ hours in a chair daily can lead to back pain, poor posture, and reduced productivity. Investing in quality ergonomics pays dividends in health and comfort.

**Disclosure:** We earn from qualifying purchases. ${new Date().toLocaleDateString()}.`,
      excerpt: 'Top ergonomic chairs for gamers and remote workers. Herman Miller Aeron review, features, and where to buy.',
      niche: 'gaming-setup',
      status: 'published',
      publishedAt: new Date(now.getTime() - 70 * 24 * 60 * 60 * 1000),
      products: {
        connect: [{ id: hermanMillerAeron.id }, { id: lianLiDesk.id }],
      },
    },
  });

  console.log('✓ Created 5 articles');
  console.log('');

  // ============================================
  // TRENDS (10+ signals)
  // ============================================
  console.log('📈 Creating trends...');

  await prisma.trend.createMany({
    data: [
      // RTX 4090 trending due to price drop
      {
        productId: rtx4090.id,
        signal: 'price_drop',
        metric: 'percentage',
        value: 15.79,
        metadata: JSON.stringify({
          oldPrice: 1899.99,
          newPrice: 1599.99,
          timeframe: '21 days',
        }),
        timestamp: new Date(),
      },
      {
        productId: rtx4090.id,
        signal: 'media_mention',
        metric: 'count',
        value: 23,
        metadata: JSON.stringify({
          platform: 'youtube',
          period: '7d',
          topVideo: 'RTX 4090 Review',
        }),
        timestamp: new Date(),
      },
      {
        productId: rtx4090.id,
        signal: 'search_volume',
        metric: 'change',
        value: 34.5,
        metadata: JSON.stringify({ trend: 'up', period: '30d' }),
        timestamp: new Date(),
      },

      // i9-13900K price drop
      {
        productId: i913900k.id,
        signal: 'price_drop',
        metric: 'percentage',
        value: 14.29,
        metadata: JSON.stringify({
          oldPrice: 629.99,
          newPrice: 539.99,
        }),
        timestamp: new Date(),
      },

      // Antminer high search volume
      {
        productId: antminerS19Pro.id,
        signal: 'search_volume',
        metric: 'change',
        value: 67.8,
        metadata: JSON.stringify({
          reason: 'Bitcoin price surge',
          period: '7d',
        }),
        timestamp: new Date(),
      },
      {
        productId: antminerS19Pro.id,
        signal: 'social_buzz',
        metric: 'mentions',
        value: 45,
        metadata: JSON.stringify({
          platform: 'twitter',
          sentiment: 'positive',
        }),
        timestamp: new Date(),
      },

      // iPhone steady interest
      {
        productId: iphone15ProMax.id,
        signal: 'media_mention',
        metric: 'count',
        value: 18,
        metadata: JSON.stringify({ period: '30d' }),
        timestamp: new Date(),
      },

      // Galaxy S24 Ultra new release buzz
      {
        productId: galaxyS24Ultra.id,
        signal: 'social_buzz',
        metric: 'mentions',
        value: 89,
        metadata: JSON.stringify({
          reason: 'New color release',
          platform: 'reddit',
        }),
        timestamp: new Date(),
      },

      // Herman Miller chair trending
      {
        productId: hermanMillerAeron.id,
        signal: 'price_drop',
        metric: 'percentage',
        value: 13.38,
        metadata: JSON.stringify({
          oldPrice: 1495.00,
          newPrice: 1295.00,
        }),
        timestamp: new Date(),
      },

      // Lian Li desk high interest
      {
        productId: lianLiDesk.id,
        signal: 'search_volume',
        metric: 'change',
        value: 28.3,
        metadata: JSON.stringify({ period: '14d' }),
        timestamp: new Date(),
      },
    ],
  });

  console.log('✓ Created 10 trends');
  console.log('');

  // ============================================
  // SUMMARY
  // ============================================
  console.log('');
  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('📊 Final Summary:');
  console.log(`   Products:        ${await prisma.product.count()}`);
  console.log(`   Deals:           ${await prisma.deal.count()}`);
  console.log(`   Price History:   ${await prisma.priceHistory.count()}`);
  console.log(`   Media Assets:    ${await prisma.mediaAsset.count()}`);
  console.log(`   Articles:        ${await prisma.article.count()}`);
  console.log(`   Trends:          ${await prisma.trend.count()}`);
  console.log('');
  console.log('✅ Ready to run: npm run dev');
  console.log('✅ View data: npm run db:studio');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
