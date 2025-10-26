import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with 50+ products...')

  // Clear existing data (idempotent)
  await prisma.socialPost.deleteMany()
  await prisma.dealPost.deleteMany()
  await prisma.affiliateLink.deleteMany()
  await prisma.priceWatch.deleteMany()
  await prisma.mediaAsset.deleteMany()
  await prisma.article.deleteMany()
  await prisma.trend.deleteMany()
  await prisma.priceHistory.deleteMany()
  await prisma.deal.deleteMany()
  await prisma.product.deleteMany()

  const products = []
  
  // Helper to create product with deals, history, media
  async function seedProduct(data: any) {
    const product = await prisma.product.create({ data })
    products.push(product)
    
    // Create 1-2 deals
    const vendors = ['amazon', 'bestbuy', 'newegg']
    for (let i = 0; i < 2; i++) {
      const retailer = vendors[i]
      const basePrice = Math.floor(Math.random() * 2000) + 100
      const discount = Math.floor(Math.random() * 30) + 5
      const price = basePrice * (1 - discount / 100)

      await prisma.deal.create({
        data: {
          productId: product.id,
          retailer,
          retailerSKU: `${retailer.toUpperCase()}-${product.externalId}`,
          price,
          originalPrice: basePrice,
          discount,
          url: `https://${retailer}.com/dp/${product.externalId}`,
          affiliateUrl: `https://${retailer}.com/dp/${product.externalId}?tag=techdeals-20`,
          isActive: true,
          inStock: Math.random() > 0.1,
        },
      })
    }

    // Price history (30 days)
    for (let day = 30; day >= 0; day--) {
      const timestamp = new Date()
      timestamp.setDate(timestamp.getDate() - day)
      await prisma.priceHistory.create({
        data: {
          productId: product.id,
          price: Math.floor(Math.random() * 1000) + 100,
          source: vendors[Math.floor(Math.random() * 3)],
          timestamp,
        },
      })
    }

    // Media assets
    for (let i = 0; i < 2; i++) {
      await prisma.mediaAsset.create({
        data: {
          productId: product.id,
          platform: 'youtube',
          externalId: `VID-${product.externalId}-${i}`,
          title: `${product.title} Review ${i + 1}`,
          thumbnailUrl: `https://placehold.co/320x180?text=Video`,
          channelName: 'TechReviewer',
          duration: 600,
          viewCount: Math.floor(Math.random() * 100000),
          url: `https://youtube.com/watch?v=VID-${product.externalId}`,
          embedUrl: `https://youtube.com/embed/VID-${product.externalId}`,
        },
      })
    }

    // Trend signal
    await prisma.trend.create({
      data: {
        productId: product.id,
        signal: 'price_drop',
        metric: 'percentage',
        value: Math.random() * 25 + 5,
        timestamp: new Date(),
      },
    })
  }

  // === CRYPTO MINERS (12) ===
  await seedProduct({ externalId: 'ANTMINER-S19-XP', source: 'amazon', title: 'Bitmain Antminer S19 XP 140 TH/s', category: 'crypto-miners', brand: 'Bitmain', model: 'S19 XP', imageUrl: 'https://placehold.co/400x400?text=S19XP', specs: '{"hashrate":"140TH/s","power":"3010W"}' })
  await seedProduct({ externalId: 'WHATSMINER-M50S', source: 'bestbuy', title: 'Whatsminer M50S 126 TH/s', category: 'crypto-miners', brand: 'MicroBT', model: 'M50S', imageUrl: 'https://placehold.co/400x400?text=M50S', specs: '{"hashrate":"126TH/s"}' })
  await seedProduct({ externalId: 'GOLDSHELL-KD6', source: 'newegg', title: 'Goldshell KD6 Kadena Miner 29.2 TH/s', category: 'crypto-miners', brand: 'Goldshell', model: 'KD6', imageUrl: 'https://placehold.co/400x400?text=KD6', specs: '{"hashrate":"29.2TH/s"}' })
  await seedProduct({ externalId: 'AVALON-1246', source: 'amazon', title: 'Canaan AvalonMiner 1246 90 TH/s', category: 'crypto-miners', brand: 'Canaan', model: '1246', imageUrl: 'https://placehold.co/400x400?text=1246', specs: '{"hashrate":"90TH/s"}' })
  await seedProduct({ externalId: 'ANTMINER-L7', source: 'bestbuy', title: 'Bitmain Antminer L7 9.5 GH/s Litecoin', category: 'crypto-miners', brand: 'Bitmain', model: 'L7', imageUrl: 'https://placehold.co/400x400?text=L7', specs: '{"hashrate":"9.5GH/s"}' })
  await seedProduct({ externalId: 'GOLDSHELL-CK6', source: 'newegg', title: 'Goldshell CK6 Nervos 15 TH/s', category: 'crypto-miners', brand: 'Goldshell', model: 'CK6', imageUrl: 'https://placehold.co/400x400?text=CK6', specs: '{"hashrate":"15TH/s"}' })
  await seedProduct({ externalId: 'ANTMINER-S19J-PRO', source: 'amazon', title: 'Bitmain Antminer S19j Pro 100 TH/s', category: 'crypto-miners', brand: 'Bitmain', model: 'S19j Pro', imageUrl: 'https://placehold.co/400x400?text=S19jPro', specs: '{"hashrate":"100TH/s"}' })
  await seedProduct({ externalId: 'WHATSMINER-M30S++', source: 'bestbuy', title: 'Whatsminer M30S++ 112 TH/s', category: 'crypto-miners', brand: 'MicroBT', model: 'M30S++', imageUrl: 'https://placehold.co/400x400?text=M30S++', specs: '{"hashrate":"112TH/s"}' })
  await seedProduct({ externalId: 'GOLDSHELL-KD-BOX-PRO', source: 'newegg', title: 'Goldshell KD-BOX Pro 2.6 TH/s', category: 'crypto-miners', brand: 'Goldshell', model: 'KD-BOX Pro', imageUrl: 'https://placehold.co/400x400?text=KDBOXPro', specs: '{"hashrate":"2.6TH/s"}' })
  await seedProduct({ externalId: 'ANTMINER-T19', source: 'amazon', title: 'Bitmain Antminer T19 84 TH/s', category: 'crypto-miners', brand: 'Bitmain', model: 'T19', imageUrl: 'https://placehold.co/400x400?text=T19', specs: '{"hashrate":"84TH/s"}' })
  await seedProduct({ externalId: 'GOLDSHELL-LB1', source: 'bestbuy', title: 'Goldshell LB1 Lucky Miner 160 MH/s', category: 'crypto-miners', brand: 'Goldshell', model: 'LB1', imageUrl: 'https://placehold.co/400x400?text=LB1', specs: '{"hashrate":"160MH/s"}' })
  await seedProduct({ externalId: 'AVALON-1166-PRO', source: 'amazon', title: 'Canaan AvalonMiner 1166 Pro 81 TH/s', category: 'crypto-miners', brand: 'Canaan', model: '1166 Pro', imageUrl: 'https://placehold.co/400x400?text=1166Pro', specs: '{"hashrate":"81TH/s"}' })

  // === PC PARTS (15) ===
  await seedProduct({ externalId: 'RTX-4090-FE', source: 'bestbuy', title: 'NVIDIA GeForce RTX 4090 24GB', category: 'pc-parts', brand: 'NVIDIA', model: 'RTX 4090', imageUrl: 'https://placehold.co/400x400?text=RTX4090', specs: '{"vram":"24GB","cores":16384}' })
  await seedProduct({ externalId: 'RTX-4080-SUPER', source: 'amazon', title: 'NVIDIA RTX 4080 SUPER 16GB', category: 'pc-parts', brand: 'NVIDIA', model: 'RTX 4080 SUPER', imageUrl: 'https://placehold.co/400x400?text=4080S', specs: '{"vram":"16GB"}' })
  await seedProduct({ externalId: 'RTX-4070-TI-SUPER', source: 'newegg', title: 'NVIDIA RTX 4070 Ti SUPER 16GB', category: 'pc-parts', brand: 'NVIDIA', model: 'RTX 4070 Ti SUPER', imageUrl: 'https://placehold.co/400x400?text=4070TiS', specs: '{"vram":"16GB"}' })
  await seedProduct({ externalId: 'RTX-4060-TI', source: 'bestbuy', title: 'NVIDIA RTX 4060 Ti 8GB', category: 'pc-parts', brand: 'NVIDIA', model: 'RTX 4060 Ti', imageUrl: 'https://placehold.co/400x400?text=4060Ti', specs: '{"vram":"8GB"}' })
  await seedProduct({ externalId: 'RX-7900-XTX', source: 'amazon', title: 'AMD Radeon RX 7900 XTX 24GB', category: 'pc-parts', brand: 'AMD', model: 'RX 7900 XTX', imageUrl: 'https://placehold.co/400x400?text=7900XTX', specs: '{"vram":"24GB"}' })
  await seedProduct({ externalId: 'RX-7900-XT', source: 'newegg', title: 'AMD Radeon RX 7900 XT 20GB', category: 'pc-parts', brand: 'AMD', model: 'RX 7900 XT', imageUrl: 'https://placehold.co/400x400?text=7900XT', specs: '{"vram":"20GB"}' })
  await seedProduct({ externalId: 'RYZEN-9-7950X', source: 'amazon', title: 'AMD Ryzen 9 7950X 16-Core', category: 'pc-parts', brand: 'AMD', model: 'Ryzen 9 7950X', imageUrl: 'https://placehold.co/400x400?text=7950X', specs: '{"cores":16}' })
  await seedProduct({ externalId: 'INTEL-I9-14900K', source: 'bestbuy', title: 'Intel Core i9-14900K 24-Core', category: 'pc-parts', brand: 'Intel', model: 'i9-14900K', imageUrl: 'https://placehold.co/400x400?text=i914900K', specs: '{"cores":24}' })
  await seedProduct({ externalId: 'SAMSUNG-990-PRO-2TB', source: 'newegg', title: 'Samsung 990 PRO 2TB NVMe SSD', category: 'pc-parts', brand: 'Samsung', model: '990 PRO', imageUrl: 'https://placehold.co/400x400?text=990PRO', specs: '{"capacity":"2TB"}' })
  await seedProduct({ externalId: 'WD-SN850X-2TB', source: 'amazon', title: 'WD Black SN850X 2TB NVMe', category: 'pc-parts', brand: 'WD', model: 'SN850X', imageUrl: 'https://placehold.co/400x400?text=SN850X', specs: '{"capacity":"2TB"}' })
  await seedProduct({ externalId: 'CORSAIR-DDR5-32GB', source: 'bestbuy', title: 'Corsair Vengeance DDR5 32GB 6000MHz', category: 'pc-parts', brand: 'Corsair', model: 'Vengeance DDR5', imageUrl: 'https://placehold.co/400x400?text=DDR532GB', specs: '{"capacity":"32GB"}' })
  await seedProduct({ externalId: 'GSKILL-DDR5-64GB', source: 'newegg', title: 'G.Skill Trident Z5 DDR5 64GB 6400MHz', category: 'pc-parts', brand: 'G.Skill', model: 'Trident Z5', imageUrl: 'https://placehold.co/400x400?text=DDR564GB', specs: '{"capacity":"64GB"}' })
  await seedProduct({ externalId: 'ASUS-ROG-STRIX-B650', source: 'amazon', title: 'ASUS ROG STRIX B650-E Motherboard', category: 'pc-parts', brand: 'ASUS', model: 'ROG STRIX B650-E', imageUrl: 'https://placehold.co/400x400?text=B650E', specs: '{"socket":"AM5"}' })
  await seedProduct({ externalId: 'MSI-Z790-CARBON', source: 'bestbuy', title: 'MSI MPG Z790 Carbon WiFi Motherboard', category: 'pc-parts', brand: 'MSI', model: 'Z790 Carbon', imageUrl: 'https://placehold.co/400x400?text=Z790', specs: '{"socket":"LGA1700"}' })
  await seedProduct({ externalId: 'CORSAIR-RM1000X', source: 'newegg', title: 'Corsair RM1000x 1000W 80+ Gold PSU', category: 'pc-parts', brand: 'Corsair', model: 'RM1000x', imageUrl: 'https://placehold.co/400x400?text=RM1000x', specs: '{"wattage":"1000W"}' })

  // === PHONES & ACCESSORIES (12) ===
  await seedProduct({ externalId: 'IPHONE-15-PRO-MAX', source: 'amazon', title: 'Apple iPhone 15 Pro Max 256GB', category: 'phones', brand: 'Apple', model: 'iPhone 15 Pro Max', imageUrl: 'https://placehold.co/400x400?text=iPhone15Pro', specs: '{"storage":"256GB"}' })
  await seedProduct({ externalId: 'SAMSUNG-S24-ULTRA', source: 'bestbuy', title: 'Samsung Galaxy S24 Ultra 512GB', category: 'phones', brand: 'Samsung', model: 'S24 Ultra', imageUrl: 'https://placehold.co/400x400?text=S24Ultra', specs: '{"storage":"512GB"}' })
  await seedProduct({ externalId: 'PIXEL-8-PRO', source: 'amazon', title: 'Google Pixel 8 Pro 256GB', category: 'phones', brand: 'Google', model: 'Pixel 8 Pro', imageUrl: 'https://placehold.co/400x400?text=Pixel8Pro', specs: '{"storage":"256GB"}' })
  await seedProduct({ externalId: 'ONEPLUS-12', source: 'newegg', title: 'OnePlus 12 256GB', category: 'phones', brand: 'OnePlus', model: 'OnePlus 12', imageUrl: 'https://placehold.co/400x400?text=OnePlus12', specs: '{"storage":"256GB"}' })
  await seedProduct({ externalId: 'AIRPODS-PRO-2', source: 'bestbuy', title: 'Apple AirPods Pro 2nd Gen USB-C', category: 'phones', brand: 'Apple', model: 'AirPods Pro 2', imageUrl: 'https://placehold.co/400x400?text=AirPodsPro2', specs: '{"anc":true}' })
  await seedProduct({ externalId: 'GALAXY-BUDS-2-PRO', source: 'amazon', title: 'Samsung Galaxy Buds 2 Pro', category: 'phones', brand: 'Samsung', model: 'Buds 2 Pro', imageUrl: 'https://placehold.co/400x400?text=Buds2Pro', specs: '{"anc":true}' })
  await seedProduct({ externalId: 'ANKER-737-POWERBANK', source: 'newegg', title: 'Anker 737 PowerBank 24000mAh 140W', category: 'phones', brand: 'Anker', model: '737', imageUrl: 'https://placehold.co/400x400?text=Anker737', specs: '{"capacity":"24000mAh"}' })
  await seedProduct({ externalId: 'SPIGEN-CASE-IP15', source: 'amazon', title: 'Spigen Ultra Hybrid iPhone 15 Pro Case', category: 'phones', brand: 'Spigen', model: 'Ultra Hybrid', imageUrl: 'https://placehold.co/400x400?text=SpigenCase', specs: '{"magsafe":true}' })
  await seedProduct({ externalId: 'BELKIN-MAGSAFE-3IN1', source: 'bestbuy', title: 'Belkin BoostCharge Pro 3-in-1 MagSafe', category: 'phones', brand: 'Belkin', model: 'BoostCharge Pro', imageUrl: 'https://placehold.co/400x400?text=Belkin3in1', specs: '{"wireless":true}' })
  await seedProduct({ externalId: 'DBRAND-SKIN-S24', source: 'amazon', title: 'dbrand Pastel Skin Galaxy S24 Ultra', category: 'phones', brand: 'dbrand', model: 'Pastel Skin', imageUrl: 'https://placehold.co/400x400?text=dbrandSkin', specs: '{"material":"vinyl"}' })
  await seedProduct({ externalId: 'OTTERBOX-DEFENDER-IP15', source: 'bestbuy', title: 'OtterBox Defender Series iPhone 15 Pro', category: 'phones', brand: 'OtterBox', model: 'Defender', imageUrl: 'https://placehold.co/400x400?text=OtterBox', specs: '{"protection":"military"}' })
  await seedProduct({ externalId: 'MOFT-MAGSAFE-STAND', source: 'amazon', title: 'MOFT MagSafe Phone Stand & Wallet', category: 'phones', brand: 'MOFT', model: 'MagSafe Stand', imageUrl: 'https://placehold.co/400x400?text=MOFTStand', specs: '{"magsafe":true}' })

  // === GAMING SETUP (13) ===
  await seedProduct({ externalId: 'FLEXISPOT-E7', source: 'amazon', title: 'FlexiSpot E7 Standing Desk 60x30', category: 'gaming-setup', brand: 'FlexiSpot', model: 'E7', imageUrl: 'https://placehold.co/400x400?text=E7Desk', specs: '{"size":"60x30"}' })
  await seedProduct({ externalId: 'AUTONOMOUS-SMARTDESK', source: 'bestbuy', title: 'Autonomous SmartDesk Pro Bamboo', category: 'gaming-setup', brand: 'Autonomous', model: 'SmartDesk Pro', imageUrl: 'https://placehold.co/400x400?text=SmartDesk', specs: '{"material":"bamboo"}' })
  await seedProduct({ externalId: 'LG-27GR95QE', source: 'newegg', title: 'LG UltraGear 27" OLED QHD 240Hz', category: 'gaming-setup', brand: 'LG', model: '27GR95QE', imageUrl: 'https://placehold.co/400x400?text=LG27OLED', specs: '{"refresh":"240Hz"}' })
  await seedProduct({ externalId: 'ASUS-PG27AQDM', source: 'amazon', title: 'ASUS ROG Swift PG27AQDM 27" OLED', category: 'gaming-setup', brand: 'ASUS', model: 'PG27AQDM', imageUrl: 'https://placehold.co/400x400?text=ROGSwift', specs: '{"panel":"OLED"}' })
  await seedProduct({ externalId: 'SAMSUNG-ODYSSEY-G9', source: 'bestbuy', title: 'Samsung Odyssey G9 49" QLED 240Hz', category: 'gaming-setup', brand: 'Samsung', model: 'Odyssey G9', imageUrl: 'https://placehold.co/400x400?text=OdysseyG9', specs: '{"size":"49inch"}' })
  await seedProduct({ externalId: 'HYPERX-CLOUD-ALPHA', source: 'amazon', title: 'HyperX Cloud Alpha Wireless Headset', category: 'gaming-setup', brand: 'HyperX', model: 'Cloud Alpha', imageUrl: 'https://placehold.co/400x400?text=CloudAlpha', specs: '{"battery":"300hrs"}' })
  await seedProduct({ externalId: 'STEELSERIES-ARCTIS-NOVA', source: 'bestbuy', title: 'SteelSeries Arctis Nova Pro Wireless', category: 'gaming-setup', brand: 'SteelSeries', model: 'Arctis Nova Pro', imageUrl: 'https://placehold.co/400x400?text=ArctisNova', specs: '{"anc":true}' })
  await seedProduct({ externalId: 'BLUE-YETI-X', source: 'newegg', title: 'Blue Yeti X Professional USB Mic', category: 'gaming-setup', brand: 'Blue', model: 'Yeti X', imageUrl: 'https://placehold.co/400x400?text=YetiX', specs: '{"capsules":4}' })
  await seedProduct({ externalId: 'ELGATO-STREAM-DECK-XL', source: 'amazon', title: 'Elgato Stream Deck XL 32-Key', category: 'gaming-setup', brand: 'Elgato', model: 'Stream Deck XL', imageUrl: 'https://placehold.co/400x400?text=StreamDeckXL', specs: '{"keys":32}' })
  await seedProduct({ externalId: 'PHILIPS-HUE-PLAY', source: 'bestbuy', title: 'Philips Hue Play Light Bar 2-Pack', category: 'gaming-setup', brand: 'Philips', model: 'Hue Play', imageUrl: 'https://placehold.co/400x400?text=HuePlay', specs: '{"rgb":true}' })
  await seedProduct({ externalId: 'GOVEE-LED-16FT', source: 'amazon', title: 'Govee Smart LED Strip 16.4ft RGB IC', category: 'gaming-setup', brand: 'Govee', model: 'H6199', imageUrl: 'https://placehold.co/400x400?text=GoveeLED', specs: '{"length":"16.4ft"}' })
  await seedProduct({ externalId: 'HERMAN-MILLER-EMBODY', source: 'newegg', title: 'Herman Miller x Logitech Embody Chair', category: 'gaming-setup', brand: 'Herman Miller', model: 'Embody Gaming', imageUrl: 'https://placehold.co/400x400?text=EmbodyChair', specs: '{"warranty":"12yrs"}' })
  await seedProduct({ externalId: 'SECRETLAB-TITAN-EVO', source: 'amazon', title: 'Secretlab TITAN Evo 2022 Series', category: 'gaming-setup', brand: 'Secretlab', model: 'TITAN Evo', imageUrl: 'https://placehold.co/400x400?text=TITANEvo', specs: '{"material":"NEO Hybrid"}' })

  console.log(`✅ Created ${products.length} products with deals, history, media, trends`)

  // Create articles
  await prisma.article.create({
    data: {
      title: 'Best Budget Crypto Miners Under $3000 (2025)',
      slug: 'best-budget-crypto-miners-2025',
      niche: 'crypto-miners',
      excerpt: 'Top ASIC miners for Bitcoin, Litecoin, and Kadena in 2025',
      content: '# Best Budget Crypto Miners\n\n**Disclosure:** Affiliate links below.\n\n## Top Picks\n\n1. Antminer S19j Pro\n2. Goldshell KD6\n3. Antminer L7',
      status: 'published',
      publishedAt: new Date(),
    },
  })

  await prisma.article.create({
    data: {
      title: 'Ultimate Gaming Desk Setup Guide 2025',
      slug: 'gaming-desk-setup-2025',
      niche: 'gaming-setup',
      excerpt: 'Build your dream gaming battlestation',
      content: '# Gaming Setup Guide\n\n**Disclosure:** Affiliate links.\n\n## Essentials\n\n1. Standing Desk\n2. OLED Monitor\n3. RGB Lighting',
      status: 'published',
      publishedAt: new Date(),
    },
  })

  console.log('✅ Created 2 articles')
  console.log('🎉 Seeding complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
