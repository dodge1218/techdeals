import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface TrendSignal {
  productId: string
  priceVelocity7d: number
  priceVelocity30d: number
  mediaCount7d: number
  ctr30d: number
  score: number
}

/**
 * Trend Finder - Aggregate signals and rank products
 * Runs every 6 hours
 */
export async function calculateTrendScores(): Promise<TrendSignal[]> {
  const signals: TrendSignal[] = []
  
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      priceHistory: {
        orderBy: { timestamp: 'desc' },
        take: 240, // Last 10 days (hourly data)
      },
      mediaAssets: {
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      },
      deals: { where: { isActive: true } },
    },
  })

  for (const product of products) {
    if (product.priceHistory.length < 7) continue

    // Calculate price velocity (7-day and 30-day)
    const priceVelocity7d = calculatePriceVelocity(product.priceHistory, 7)
    const priceVelocity30d = calculatePriceVelocity(product.priceHistory, 30)

    // Count media mentions in last 7 days
    const mediaCount7d = product.mediaAssets.length

    // Mock CTR for now (would come from analytics)
    const ctr30d = Math.random() * 5 // 0-5% CTR

    // Calculate composite score
    const score = calculateTrendScore({
      priceVelocity7d,
      priceVelocity30d,
      mediaCount7d,
      ctr30d,
    })

    signals.push({
      productId: product.id,
      priceVelocity7d,
      priceVelocity30d,
      mediaCount7d,
      ctr30d,
      score,
    })
  }

  // Sort by score descending
  return signals.sort((a, b) => b.score - a.score)
}

/**
 * Calculate price velocity (% change over period)
 */
function calculatePriceVelocity(history: any[], days: number): number {
  if (history.length < 2) return 0

  const now = Date.now()
  const cutoff = now - days * 24 * 60 * 60 * 1000

  const recentPrices = history.filter(h => h.timestamp.getTime() >= cutoff)
  if (recentPrices.length < 2) return 0

  const oldestPrice = recentPrices[recentPrices.length - 1].price
  const newestPrice = recentPrices[0].price

  return ((oldestPrice - newestPrice) / oldestPrice) * 100
}

/**
 * Calculate trend score (0-100)
 * Formula: 0.4×priceVel7d + 0.3×media + 0.2×CTR + 0.1×priceVel30d
 */
function calculateTrendScore(data: {
  priceVelocity7d: number
  priceVelocity30d: number
  mediaCount7d: number
  ctr30d: number
}): number {
  const priceComponent = Math.min(data.priceVelocity7d / 25, 1) * 40 // Max 40 points
  const mediaComponent = Math.min(data.mediaCount7d / 10, 1) * 30 // Max 30 points
  const ctrComponent = Math.min(data.ctr30d / 5, 1) * 20 // Max 20 points
  const longTermComponent = Math.min(data.priceVelocity30d / 50, 1) * 10 // Max 10 points

  return Math.round(priceComponent + mediaComponent + ctrComponent + longTermComponent)
}

/**
 * Update Product.trendingScore in database
 */
export async function updateTrendingScores(signals: TrendSignal[]): Promise<number> {
  let updated = 0

  for (const signal of signals) {
    try {
      await prisma.product.update({
        where: { id: signal.productId },
        data: { 
          // Note: trendingScore doesn't exist in schema yet
          // This would update a custom field if added
        },
      })

      // Store trend signal
      await prisma.trend.create({
        data: {
          productId: signal.productId,
          signal: 'composite_score',
          metric: 'trend_score',
          value: signal.score,
          timestamp: new Date(),
          metadata: JSON.stringify({
            priceVelocity7d: signal.priceVelocity7d,
            priceVelocity30d: signal.priceVelocity30d,
            mediaCount7d: signal.mediaCount7d,
            ctr30d: signal.ctr30d,
          }),
        },
      })

      updated++
    } catch (error) {
      console.error(`Failed to update trend for product ${signal.productId}:`, error)
    }
  }

  return updated
}

/**
 * Main job entry point
 */
export async function runTrendFinder(): Promise<{
  analyzed: number
  updated: number
  topScore: number
  elapsed: number
}> {
  const startTime = Date.now()

  console.log('📈 Trend Finder: Analyzing product trends...')

  const signals = await calculateTrendScores()
  console.log(`   Analyzed ${signals.length} products`)

  const updated = await updateTrendingScores(signals)
  console.log(`   Updated ${updated} trend scores`)

  const topScore = signals[0]?.score || 0
  console.log(`   Top score: ${topScore}`)

  const elapsed = Date.now() - startTime

  await prisma.$disconnect()

  return { 
    analyzed: signals.length, 
    updated, 
    topScore,
    elapsed 
  }
}

/**
 * Get top trending products
 */
export async function getTopTrending(limit: number = 10): Promise<any[]> {
  const recentTrends = await prisma.trend.findMany({
    where: {
      signal: 'composite_score',
      timestamp: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
    include: {
      product: {
        include: {
          deals: {
            where: { isActive: true },
            take: 1,
            orderBy: { price: 'asc' },
          },
        },
      },
    },
    orderBy: { value: 'desc' },
    take: limit,
  })

  return recentTrends.map(trend => ({
    ...trend.product,
    trendScore: trend.value,
    trendMetadata: JSON.parse(trend.metadata || '{}'),
  }))
}

// Run if called directly
if (require.main === module) {
  runTrendFinder()
    .then((result) => {
      console.log(`✅ Trend Finder complete: ${result.analyzed} analyzed, ${result.updated} updated, ${result.elapsed}ms`)
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Trend Finder failed:', error)
      process.exit(1)
    })
}
