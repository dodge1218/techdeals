import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface PriceDrop {
  productId: string
  oldPrice: number
  newPrice: number
  dropPercent: number
  vendor: string
}

/**
 * Deals Radar - Detect price drops and create deal posts
 * Runs hourly via CRON
 */
export async function detectPriceDrops(): Promise<PriceDrop[]> {
  const drops: PriceDrop[] = []
  
  // Get all products with recent price history
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      deals: { where: { isActive: true } },
      priceHistory: {
        orderBy: { timestamp: 'desc' },
        take: 48, // Last 48 hours
      },
    },
  })

  for (const product of products) {
    if (product.priceHistory.length < 2) continue

    // Get current price (most recent)
    const currentHistory = product.priceHistory[0]
    
    // Get price from 24h ago (closest to 24h)
    const targetTime = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const oldHistory = product.priceHistory
      .sort((a, b) => Math.abs(a.timestamp.getTime() - targetTime.getTime()) - 
                      Math.abs(b.timestamp.getTime() - targetTime.getTime()))[0]

    if (!oldHistory || currentHistory.id === oldHistory.id) continue

    const dropPercent = ((oldHistory.price - currentHistory.price) / oldHistory.price) * 100

    // Threshold: >10% drop OR all-time low
    if (dropPercent > 10) {
      drops.push({
        productId: product.id,
        oldPrice: oldHistory.price,
        newPrice: currentHistory.price,
        dropPercent,
        vendor: currentHistory.source,
      })
    }
  }

  return drops
}

/**
 * Calculate deal score (0-100)
 * Higher score = better deal
 */
export function calculateDealScore(drop: PriceDrop): number {
  const priceVelocity = Math.min(drop.dropPercent / 50, 1) * 40 // Max 40 points
  const savingsAmount = Math.min((drop.oldPrice - drop.newPrice) / 500, 1) * 30 // Max 30 points
  const recencyBoost = 20 // Recent drop gets 20 points
  const availabilityBonus = 10 // In stock gets 10 points

  return Math.round(priceVelocity + savingsAmount + recencyBoost + availabilityBonus)
}

/**
 * Create DealPost records for detected drops
 */
export async function createDealPosts(drops: PriceDrop[]): Promise<number> {
  let created = 0

  for (const drop of drops) {
    const score = calculateDealScore(drop)
    
    // Auto-publish if score > 70
    const status = score > 70 ? 'published' : 'pending'

    try {
      const dealPost = await prisma.dealPost.create({
        data: {
          productId: drop.productId,
          oldPrice: drop.oldPrice,
          newPrice: drop.newPrice,
          discount: drop.dropPercent,
          source: drop.vendor,
          metadata: JSON.stringify({
            score,
            detectedAt: new Date().toISOString(),
            autoPublished: status === 'published',
          }),
        },
      })

      // If auto-published, create social post (dry-run)
      if (status === 'published') {
        await enqueueSocialPost(dealPost.id, drop)
      }

      created++
    } catch (error) {
      console.error(`Failed to create deal post for product ${drop.productId}:`, error)
    }
  }

  return created
}

/**
 * Enqueue social media post (dry-run by default)
 */
async function enqueueSocialPost(dealPostId: string, drop: PriceDrop) {
  const product = await prisma.product.findUnique({
    where: { id: drop.productId },
  })

  if (!product) return

  const emoji = drop.dropPercent > 20 ? '🔥' : '💰'
  const content = `${emoji} ${product.title} dropped to $${drop.newPrice.toFixed(2)} (${drop.dropPercent.toFixed(0)}% off)! Was $${drop.oldPrice.toFixed(2)}. #TechDeals #${product.category}`

  // Truncate to 260 chars
  const truncated = content.length > 260 ? content.slice(0, 257) + '...' : content

  await prisma.socialPost.create({
    data: {
      dealPostId,
      platform: 'twitter',
      content: truncated,
      hashtags: JSON.stringify(['TechDeals', product.category]),
      scheduledAt: new Date(Date.now() + 20 * 60 * 1000), // 20 min from now (rate limit)
      status: 'queued', // Dry-run by default
    },
  })
}

/**
 * Main job entry point
 */
export async function runDealsRadar(): Promise<{
  drops: number
  created: number
  elapsed: number
}> {
  const startTime = Date.now()

  console.log('🔍 Deals Radar: Scanning for price drops...')

  const drops = await detectPriceDrops()
  console.log(`   Found ${drops.length} price drops >10%`)

  const created = await createDealPosts(drops)
  console.log(`   Created ${created} deal posts`)

  const elapsed = Date.now() - startTime

  await prisma.$disconnect()

  return { drops: drops.length, created, elapsed }
}

// Run if called directly
if (require.main === module) {
  runDealsRadar()
    .then((result) => {
      console.log(`✅ Deals Radar complete: ${result.drops} drops, ${result.created} posts, ${result.elapsed}ms`)
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Deals Radar failed:', error)
      process.exit(1)
    })
}
