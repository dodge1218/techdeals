# System Architecture
## TechDeals Platform

**Version:** 1.0  
**Last Updated:** 2025-10-23  
**Status:** Sprint 0 - Foundation

---

## 1. SYSTEM OVERVIEW

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SOURCES                          │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│ Amazon PA-API│ Best Buy API │  Newegg Feed │  YouTube Data API │
└──────┬───────┴──────┬───────┴──────┬───────┴───────┬───────────┘
       │              │              │               │
       └──────────────┴──────────────┴───────────────┘
                      │
          ┌───────────▼────────────┐
          │   SOURCE ADAPTERS      │
          │ (Normalize + Validate) │
          └───────────┬────────────┘
                      │
          ┌───────────▼────────────┐
          │   INGEST PIPELINE      │
          │ • Deduper              │
          │ • Enricher             │
          │ • Price History        │
          └───────────┬────────────┘
                      │
     ┌────────────────┼────────────────┐
     │                │                │
┌────▼─────┐    ┌────▼────┐    ┌─────▼──────┐
│PostgreSQL│    │  Redis  │    │  S3/CDN    │
│  (Prisma)│    │ (Cache) │    │  (Images)  │
└────┬─────┘    └────┬────┘    └─────┬──────┘
     │               │               │
     └───────────────┼───────────────┘
                     │
       ┌─────────────▼──────────────┐
       │       CORE SERVICES        │
       ├────────────────────────────┤
       │ • Deals Radar (CRON)       │
       │ • Trend Finder (Daily)     │
       │ • Article Writer (Queue)   │
       │ • Social Bot (Scheduler)   │
       └─────────────┬──────────────┘
                     │
       ┌─────────────▼──────────────┐
       │      WEB APPLICATION       │
       │    (Next.js App Router)    │
       ├────────────────────────────┤
       │ • Pages (SSR/SSG)          │
       │ • API Routes               │
       │ • Admin CMS                │
       └─────────────┬──────────────┘
                     │
       ┌─────────────▼──────────────┐
       │          USERS             │
       │  (Browser + Mobile Web)    │
       └────────────────────────────┘
```

---

## 2. COMPONENT BREAKDOWN

### 2.1 Source Adapters

**Purpose:** Abstract external APIs/feeds; provide consistent interface

**Interface:**
```typescript
interface SourceAdapter {
  name: string;
  fetchProducts(params: FetchParams): Promise<Product[]>;
  fetchPrice(productId: string): Promise<Price>;
  validateLink(url: string): Promise<boolean>;
}

interface FetchParams {
  category?: string;
  keywords?: string;
  limit?: number;
  cursor?: string;
}
```

**Implementations:**

#### Amazon PA-API Adapter
```typescript
class AmazonAdapter implements SourceAdapter {
  name = 'amazon';
  
  async fetchProducts(params: FetchParams): Promise<Product[]> {
    // If PA-API key available: use official API
    if (process.env.AMAZON_PA_API_KEY) {
      const response = await paapi.searchItems({
        Keywords: params.keywords,
        Resources: ['ItemInfo.Title', 'Offers.Listings.Price'],
      });
      return this.normalize(response.SearchResult.Items);
    }
    
    // Fallback: Mock data for development
    return mockAmazonProducts.filter(p => 
      p.title.toLowerCase().includes(params.keywords?.toLowerCase() || '')
    );
  }
  
  private normalize(items: any[]): Product[] {
    return items.map(item => ({
      externalId: item.ASIN,
      title: item.ItemInfo.Title.DisplayValue,
      price: item.Offers.Listings[0].Price.Amount,
      currency: item.Offers.Listings[0].Price.Currency,
      url: item.DetailPageURL,
      imageUrl: item.Images.Primary.Large.URL,
      lastUpdated: new Date(),
      source: 'amazon',
    }));
  }
}
```

#### YouTube Data API Adapter
```typescript
class YouTubeAdapter {
  name = 'youtube';
  
  async searchVideos(query: string, maxResults = 5): Promise<MediaAsset[]> {
    if (process.env.YOUTUBE_API_KEY) {
      const response = await youtubeClient.search.list({
        part: ['snippet'],
        q: query,
        type: ['video'],
        maxResults,
        safeSearch: 'moderate',
      });
      return response.data.items.map(item => ({
        platform: 'youtube',
        externalId: item.id.videoId,
        title: item.snippet.title,
        thumbnailUrl: item.snippet.thumbnails.high.url,
        channelName: item.snippet.channelTitle,
        embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
      }));
    }
    
    // Mock: Return placeholder videos
    return mockYouTubeVideos(query);
  }
}
```

**Failure Handling:**
- ✅ Adapter fails → Log error, return empty array (don't crash)
- ✅ Rate limit hit → Exponential backoff (1s, 2s, 4s, 8s)
- ✅ Invalid response → Schema validation; reject malformed data

---

### 2.2 Ingest Pipeline

**Purpose:** Transform raw data into normalized, deduplicated, enriched records

**Steps:**

#### 1. Deduplication
```typescript
async function deduplicate(products: Product[]): Promise<Product[]> {
  const existing = await db.product.findMany({
    where: {
      OR: products.map(p => ({
        externalId: p.externalId,
        source: p.source,
      })),
    },
    select: { externalId: true, source: true },
  });
  
  const existingKeys = new Set(
    existing.map(e => `${e.source}:${e.externalId}`)
  );
  
  return products.filter(p => 
    !existingKeys.has(`${p.source}:${p.externalId}`)
  );
}
```

#### 2. Enrichment
```typescript
async function enrich(product: Product): Promise<EnrichedProduct> {
  const [videos, priceHistory, relatedProducts] = await Promise.all([
    youtubeAdapter.searchVideos(`${product.title} review`, 3),
    fetchPriceHistory(product.id),
    findSimilarProducts(product.category, product.id),
  ]);
  
  return {
    ...product,
    mediaAssets: videos,
    priceHistory,
    relatedProducts,
    enrichedAt: new Date(),
  };
}
```

#### 3. Price History Tracking
```typescript
async function trackPrice(product: Product): Promise<void> {
  const lastPrice = await db.priceHistory.findFirst({
    where: { productId: product.id },
    orderBy: { timestamp: 'desc' },
  });
  
  const currentPrice = product.price;
  
  if (!lastPrice || lastPrice.price !== currentPrice) {
    await db.priceHistory.create({
      data: {
        productId: product.id,
        price: currentPrice,
        source: product.source,
        timestamp: new Date(),
      },
    });
    
    // Check if price dropped significantly
    if (lastPrice && currentPrice < lastPrice.price * 0.95) {
      await createTrendSignal({
        productId: product.id,
        signal: 'price_drop',
        value: ((lastPrice.price - currentPrice) / lastPrice.price) * 100,
      });
    }
  }
}
```

---

### 2.3 Core Services

#### Deals Radar (CRON Job)
**Frequency:** Every hour  
**Purpose:** Check price watches; trigger notifications

```typescript
import { CronJob } from 'cron';

const dealsRadarJob = new CronJob('0 * * * *', async () => {
  console.log('[Deals Radar] Starting price watch check...');
  
  const watches = await db.priceWatch.findMany({
    where: { 
      notified: false,
      expiresAt: { gt: new Date() }
    },
    include: { product: true },
  });
  
  for (const watch of watches) {
    const currentPrice = await fetchCurrentPrice(watch.product.externalId, watch.product.source);
    
    if (currentPrice <= watch.targetPrice) {
      // Create deal post
      const dealPost = await db.dealPost.create({
        data: {
          productId: watch.productId,
          oldPrice: watch.lastSeenPrice,
          newPrice: currentPrice,
          discount: ((watch.lastSeenPrice - currentPrice) / watch.lastSeenPrice) * 100,
          source: 'price_watch',
        },
      });
      
      // Queue notification
      await emailQueue.add('price-alert', {
        email: watch.email,
        productName: watch.product.title,
        oldPrice: watch.lastSeenPrice,
        newPrice: currentPrice,
        dealUrl: `${process.env.SITE_URL}/deals/${watch.product.id}`,
      });
      
      // Mark as notified
      await db.priceWatch.update({
        where: { id: watch.id },
        data: { notified: true, notifiedAt: new Date() },
      });
      
      console.log(`[Deals Radar] Triggered alert for ${watch.product.title}`);
    }
  }
});

dealsRadarJob.start();
```

---

#### Trend Finder (Daily Job)
**Frequency:** Daily at 2 AM UTC  
**Purpose:** Calculate trend scores; update rankings

```typescript
const trendFinderJob = new CronJob('0 2 * * *', async () => {
  console.log('[Trend Finder] Analyzing trends...');
  
  const products = await db.product.findMany({
    where: { isActive: true },
    include: {
      priceHistory: {
        where: { 
          timestamp: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        },
      },
      mediaAssets: true,
      deals: true,
    },
  });
  
  for (const product of products) {
    const trendScore = calculateTrendScore(product);
    
    if (trendScore > 0.5) {
      await db.trend.create({
        data: {
          productId: product.id,
          signal: getTrendSignal(product),
          metric: 'composite_score',
          value: trendScore,
          metadata: JSON.stringify({
            price_change: getPriceChange(product),
            media_count: product.mediaAssets.length,
            ctr: getClickThroughRate(product),
          }),
        },
      });
    }
  }
});

function calculateTrendScore(product: Product): number {
  const priceChange = getPriceChange(product);
  const velocityChange = getVelocityChange(product);
  const mediaMentions = product.mediaAssets.length;
  const ctrSpike = getClickThroughRate(product);
  
  return (
    Math.abs(priceChange) * 0.4 +
    velocityChange * 0.2 +
    Math.log(mediaMentions + 1) * 0.15 +
    ctrSpike * 0.15 +
    0.1 // Social score (placeholder)
  );
}
```

---

#### Article Writer Service
**Trigger:** Queue message or admin action  
**Purpose:** Generate AI-powered roundup articles

```typescript
interface ArticleRequest {
  niche: string;
  productIds: string[];
  title?: string;
  outline?: string[];
}

async function generateArticle(request: ArticleRequest): Promise<Article> {
  const products = await db.product.findMany({
    where: { id: { in: request.productIds } },
    include: { deals: { where: { isActive: true } } },
  });
  
  const prompt = buildPrompt(request, products);
  
  // LLM provider (OpenAI, Anthropic, or mock)
  const content = await llmProvider.complete(prompt, {
    maxTokens: 2000,
    temperature: 0.7,
  });
  
  // Parse sections
  const sections = parseMarkdown(content);
  
  // Add FTC disclosure
  const finalContent = addFTCDisclosure(content);
  
  // Create article
  const article = await db.article.create({
    data: {
      title: request.title || sections.title,
      slug: slugify(request.title || sections.title),
      content: finalContent,
      excerpt: sections.tldr || content.substring(0, 200),
      niche: request.niche,
      status: 'draft', // Requires approval
      products: {
        connect: request.productIds.map(id => ({ id })),
      },
    },
  });
  
  return article;
}

function buildPrompt(request: ArticleRequest, products: Product[]): string {
  return `Role: Expert tech buyer's guide writer
Task: Write a 1200-1500 word article on "${request.niche}"
Style: Conversational, data-driven, unbiased

Products to include:
${products.map(p => `- ${p.title}: $${p.deals[0]?.price || 'N/A'}`).join('\n')}

Structure:
1. TL;DR (3 quick picks)
2. Why This Matters (2-3 paragraphs)
3. Top ${products.length} Recommendations (with specs, benefits, price)
4. Comparison Table
5. FAQ (3-5 Q&As)
6. Responsible Buying Notes

Requirements:
- Explain trade-offs (performance vs. price vs. noise)
- No medical/financial advice
- Cite specific specs
- Neutral tone (no promotional language)

Output format: Markdown with H2/H3 headers`;
}
```

---

#### Social Bot (Scheduler)
**Frequency:** Continuous (rate-limited)  
**Purpose:** Post deals to Twitter/X

```typescript
const socialBotWorker = new Worker('social-post-queue', async (job) => {
  const post = job.data as SocialPost;
  
  if (process.env.DRY_RUN === 'true') {
    console.log('[DRY RUN] Would post:', post.content);
    return { success: true, dryRun: true };
  }
  
  try {
    const shortLink = await shortenUrl(post.dealUrl);
    
    const tweetContent = `${post.content}\n\n${shortLink}`;
    
    const result = await twitterClient.v2.tweet(tweetContent);
    
    await db.socialPost.update({
      where: { id: post.id },
      data: {
        status: 'posted',
        postedAt: new Date(),
        externalId: result.data.id,
      },
    });
    
    console.log(`[Social Bot] Posted tweet ${result.data.id}`);
    
    return { success: true, tweetId: result.data.id };
    
  } catch (error) {
    console.error('[Social Bot] Error:', error);
    
    await db.socialPost.update({
      where: { id: post.id },
      data: {
        status: 'failed',
        error: error.message,
      },
    });
    
    throw error;
  }
}, {
  connection: redisConnection,
  limiter: {
    max: 10, // Max 10 posts per hour
    duration: 60 * 60 * 1000,
  },
});
```

---

### 2.4 Web Application (Next.js)

**Structure:**
```
app/
├── (marketing)/
│   ├── page.tsx              # Homepage
│   ├── about/page.tsx
│   └── contact/page.tsx
├── deals/
│   ├── page.tsx              # Deals list
│   ├── [id]/page.tsx         # Deal detail
│   └── layout.tsx
├── articles/
│   ├── page.tsx              # Article index
│   ├── [slug]/page.tsx       # Article detail
│   └── layout.tsx
├── trends/
│   └── page.tsx              # Trend dashboard
├── admin/
│   ├── layout.tsx            # Protected layout
│   ├── articles/page.tsx
│   ├── deals/page.tsx
│   └── social/page.tsx
├── api/
│   ├── deals/route.ts
│   ├── articles/route.ts
│   ├── trends/route.ts
│   ├── price-watch/route.ts
│   └── admin/[...]/route.ts
└── layout.tsx                # Root layout
```

**Key Patterns:**

#### Server Components (Default)
```typescript
// app/deals/page.tsx
import { db } from '@/lib/db';
import { DealCard } from '@/components/deal-card';

export default async function DealsPage() {
  const deals = await db.deal.findMany({
    where: { isActive: true },
    include: { product: true },
    orderBy: { discount: 'desc' },
    take: 50,
  });
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {deals.map(deal => (
        <DealCard key={deal.id} deal={deal} />
      ))}
    </div>
  );
}
```

#### API Routes
```typescript
// app/api/deals/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  
  const deals = await db.deal.findMany({
    where: {
      isActive: true,
      ...(category && { product: { category } }),
    },
    include: { product: true },
  });
  
  return NextResponse.json(deals);
}
```

---

## 3. DATA FLOW EXAMPLES

### Example 1: User Views Deal

```
1. User → GET /deals/rtx-4090-deal
2. Next.js → Query DB for deal + product + price history
3. Next.js → Query Redis cache for YouTube videos (TTL 24h)
   - Cache HIT → Return cached videos
   - Cache MISS → Query YouTube API → Store in cache
4. Next.js → Render SSR page with:
   - Product details
   - Current price with "as-of" timestamp
   - 3 YouTube review videos
   - Affiliate link with UTM params
5. User clicks "View Deal" → Redirect to retailer with affiliate tag
6. Backend → Log click event to analytics
7. Backend → Increment CTR counter for trend calculation
```

---

### Example 2: Price Drop Detected

```
1. CRON (hourly) → Fetch latest prices from adapters
2. Adapter → Query Amazon PA-API (or mock)
3. Ingest Pipeline → Compare new price vs. last price in DB
4. IF price dropped > 5%:
   a. Create PriceHistory record
   b. Create TrendSignal (type: price_drop)
   c. Create DealPost
   d. Query PriceWatch table for matching watches
   e. For each watch:
      - Create notification job in email queue
      - Mark watch as notified
   f. Create SocialPost in queue (to be posted next hour)
5. Email Worker → Send price alert emails
6. Social Worker → Post to Twitter (rate-limited)
```

---

### Example 3: Article Generation

```
1. Admin → POST /api/admin/articles/generate
   Body: { niche: 'crypto-mining', productIds: ['prod-1', 'prod-2'] }
2. API Route → Queue article generation job
3. Article Worker → Picks up job
4. Worker → Fetches products + deals from DB
5. Worker → Builds LLM prompt with product data
6. Worker → Calls LLM API (OpenAI, Anthropic, or mock)
7. Worker → Parses response (Markdown)
8. Worker → Validates content (no hallucinated specs, no prohibited language)
9. Worker → Adds FTC disclosure footer
10. Worker → Creates Article record (status: draft)
11. Worker → Notifies admin via webhook/email
12. Admin → Reviews article in CMS
13. Admin → Clicks "Approve" → Article published (status: published)
14. Next.js → Revalidates /articles path (ISR)
```

---

## 4. TECHNOLOGY CHOICES

### 4.1 Frontend
| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Next.js 14+ (App Router) | SSR + SSG, great SEO, Vercel deployment |
| **Language** | TypeScript 5+ | Type safety, better DX |
| **Styling** | Tailwind CSS v4 | Rapid prototyping, small bundle |
| **Components** | shadcn/ui | Accessible, customizable, no runtime cost |
| **State** | React Server Components | Reduce client JS, better performance |

### 4.2 Backend
| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Runtime** | Node.js 20+ | Universal JS, large ecosystem |
| **Database** | PostgreSQL 15+ | Robust, ACID, great for structured data |
| **ORM** | Prisma 5+ | Type-safe queries, migrations, schema |
| **Cache** | Redis 7+ | Fast K/V store, pub/sub for jobs |
| **Job Queue** | BullMQ | Reliable, rate-limiting, retries |
| **Search** | (Future) Typesense/Meilisearch | Full-text search, faceted filters |

### 4.3 Infrastructure
| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Hosting** | Vercel / Fly.io | Zero-config Next.js, edge network |
| **Database** | Supabase / Neon | Managed Postgres, generous free tier |
| **CDN** | Cloudflare / Vercel Edge | Global cache, DDoS protection |
| **Monitoring** | Sentry + Vercel Analytics | Error tracking, Web Vitals |
| **CI/CD** | GitHub Actions | Free for public repos, great DX |

---

## 5. DEPLOYMENT ARCHITECTURE

### Production (Vercel)
```
┌────────────────────────────────────────────────┐
│            Cloudflare CDN                      │
│  (DDoS protection, edge cache, SSL)            │
└────────────────┬───────────────────────────────┘
                 │
┌────────────────▼───────────────────────────────┐
│          Vercel Edge Network                   │
│  • Static assets (/_next/static)               │
│  • Images (Next.js Image Optimization)         │
│  • Edge Functions (middleware, redirects)      │
└────────────────┬───────────────────────────────┘
                 │
┌────────────────▼───────────────────────────────┐
│          Vercel Serverless Functions           │
│  • API Routes (/api/*)                         │
│  • SSR Pages (dynamic routes)                  │
│  • ISR (Incremental Static Regeneration)       │
└────────────────┬───────────────────────────────┘
                 │
       ┌─────────┼─────────┐
       │         │         │
┌──────▼─────┐ ┌▼────────┐ ┌▼──────────┐
│ Supabase   │ │ Upstash │ │ AWS S3    │
│ PostgreSQL │ │ Redis   │ │ (Images)  │
└────────────┘ └─────────┘ └───────────┘
```

**Scaling Strategy:**
- Serverless functions auto-scale (0 → ∞)
- Database: Connection pooling (Prisma Data Proxy)
- Redis: Single instance (< 1GB usage expected in MVP)
- Images: CDN-cached (99% cache hit rate goal)

---

### Development (Local)
```
┌────────────────────────────────────────┐
│  Developer Machine                     │
│  • Next.js dev server (port 3000)      │
│  • PostgreSQL (Docker, port 5432)      │
│  • Redis (Docker, port 6379)           │
│  • Prisma Studio (port 5555)           │
└────────────────────────────────────────┘
```

**Commands:**
```bash
# Start all services
docker-compose up -d

# Run dev server
npm run dev

# Run workers (separate terminal)
npm run workers

# Open Prisma Studio
npx prisma studio
```

---

## 6. SECRETS & CONFIG MANAGEMENT

### Environment Variables (.env.sample)

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/techdeals"

# Redis
REDIS_URL="redis://localhost:6379"

# External APIs (optional, mocks work without)
AMAZON_PA_API_KEY="your-amazon-key"
AMAZON_PA_API_SECRET="your-amazon-secret"
AMAZON_ASSOCIATE_TAG="techdeals-20"

BESTBUY_API_KEY="your-bestbuy-key"
BESTBUY_AFFILIATE_ID="your-bestbuy-affiliate-id"

NEWEGG_AFFILIATE_ID="your-newegg-affiliate-id"

YOUTUBE_API_KEY="your-youtube-api-key"

# LLM Provider (choose one)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# Twitter/X API
TWITTER_API_KEY="your-twitter-key"
TWITTER_API_SECRET="your-twitter-secret"
TWITTER_BEARER_TOKEN="your-bearer-token"

# Misc
SITE_URL="https://techdeals.com"
DRY_RUN="true" # Set to false in production for real posts

# Monitoring
SENTRY_DSN="https://..."
```

**Secret Rotation:**
- API keys rotated quarterly
- Stored in Vercel environment variables (encrypted at rest)
- Local dev: Use `.env.local` (gitignored)

---

## 7. FAILURE ISOLATION

### Circuit Breakers
```typescript
import CircuitBreaker from 'opossum';

const amazonAdapter = new CircuitBreaker(
  async (query: string) => await fetchFromAmazon(query),
  {
    timeout: 5000, // 5s max
    errorThresholdPercentage: 50, // Open circuit if 50% fail
    resetTimeout: 30000, // Try again after 30s
  }
);

amazonAdapter.fallback(() => {
  console.warn('[Circuit Breaker] Amazon adapter failed, returning mock data');
  return mockAmazonProducts;
});
```

### Graceful Degradation
| Component Fails | Behavior |
|-----------------|----------|
| **Amazon PA-API** | Use mock data; show "Prices may be delayed" banner |
| **YouTube API** | Show placeholder videos; no embed player |
| **Redis Cache** | Direct DB queries (slower, but functional) |
| **LLM Provider** | Queue article for manual writing; notify admin |
| **Twitter API** | Store posts in DB; retry later; notify admin |

---

## 8. OBSERVABILITY

### Logging (Pino)
```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true },
  },
});

// Usage
logger.info({ productId: '123', price: 99.99 }, 'Price updated');
logger.error({ err: error, userId: '456' }, 'Payment failed');
```

### Metrics (Prometheus-compatible)
```typescript
import { Counter, Histogram } from 'prom-client';

const dealClicks = new Counter({
  name: 'deal_clicks_total',
  help: 'Total deal clicks',
  labelNames: ['retailer', 'category'],
});

const apiLatency = new Histogram({
  name: 'api_response_time_seconds',
  help: 'API response time',
  labelNames: ['method', 'route', 'status'],
});

// Usage
dealClicks.inc({ retailer: 'amazon', category: 'pc-parts' });
apiLatency.observe({ method: 'GET', route: '/api/deals', status: 200 }, 0.152);
```

---

## 9. TESTING STRATEGY

### Unit Tests (Vitest)
```typescript
// lib/affiliate.test.ts
describe('generateAffiliateLink', () => {
  it('adds Amazon tag to product URL', () => {
    const url = 'https://amazon.com/dp/B08HR6FMK3';
    const result = generateAffiliateLink(url, 'amazon');
    expect(result).toContain('tag=techdeals-20');
  });
});
```

### Integration Tests (Playwright)
```typescript
// e2e/deal-page.spec.ts
test('user can view deal and click affiliate link', async ({ page }) => {
  await page.goto('/deals/rtx-4090-deal');
  
  await expect(page.locator('h1')).toContainText('RTX 4090');
  await expect(page.locator('[data-testid="price"]')).toContainText('$1,599');
  await expect(page.locator('[data-testid="as-of-time"]')).toBeVisible();
  
  const [newPage] = await Promise.all([
    page.waitForEvent('popup'),
    page.click('[data-testid="view-deal-btn"]'),
  ]);
  
  await expect(newPage.url()).toContain('amazon.com');
  await expect(newPage.url()).toContain('tag=techdeals-20');
});
```

---

## 10. ARCHITECTURAL DECISIONS (ADRs)

### ADR-001: Why Prisma over TypeORM?
**Decision:** Use Prisma as ORM  
**Rationale:**
- Type-safe client auto-generated from schema
- Migrations are declarative and easy to review
- Great DX with Prisma Studio
- Active community and regular updates

**Trade-offs:**
- ❌ Slightly larger client bundle than raw SQL
- ✅ But: Fewer runtime errors, faster development

---

### ADR-002: Why BullMQ over Celery/RabbitMQ?
**Decision:** Use BullMQ for job queues  
**Rationale:**
- Native TypeScript support
- Rate limiting built-in (critical for social posts)
- UI for monitoring (Bull Board)
- Redis-based (we're already using Redis for cache)

**Trade-offs:**
- ❌ Node-only (can't use Python workers)
- ✅ But: Our entire stack is TypeScript, so consistency wins

---

### ADR-003: Why Next.js App Router over Pages Router?
**Decision:** Use App Router (React Server Components)  
**Rationale:**
- Smaller client bundles (less JS to download)
- Better SEO (more HTML, less hydration)
- Streaming SSR (faster TTFB)
- Future-proof (Pages Router is legacy)

**Trade-offs:**
- ❌ Steeper learning curve
- ❌ Some third-party libs not compatible yet
- ✅ But: Performance gains worth it; community migrating

---

**Document Status:** ✅ Approved for Sprint 0  
**Next Review:** Sprint 2 (after infrastructure deployed)  
**Owner:** Tech Lead  
**Last Updated:** 2025-10-23
