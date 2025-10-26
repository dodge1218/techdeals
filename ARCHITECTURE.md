# TechDeals - System Architecture

**Version:** 1.0  
**Last Updated:** 2025-10-23

---

## 1. High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SOURCES                         │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│ Amazon PA-API│ Best Buy API │ Newegg Feed  │ YouTube Data API  │
│ (Products)   │ (Products)   │ (Products)   │ (Video Metadata)  │
└──────┬───────┴──────┬───────┴──────┬───────┴─────┬─────────────┘
       │              │              │              │
       └──────────────┴──────────────┴──────────────┘
                      │
         ┌────────────▼────────────┐
         │   SOURCE ADAPTERS       │  (Normalize, Rate-Limit)
         │   (Interface + Mocks)   │
         └────────────┬────────────┘
                      │
         ┌────────────▼────────────┐
         │   INGEST PIPELINE       │  (Queue Jobs, Dedupe)
         │   (BullMQ + Redis)      │
         └────────────┬────────────┘
                      │
         ┌────────────▼────────────┐
         │   NORMALIZER SERVICE    │  (Map to Product/Offer)
         └────────────┬────────────┘
                      │
         ┌────────────▼────────────┐
         │   RANKER / INDEXER      │  (BM25, Embeddings)
         └────────────┬────────────┘
                      │
         ┌────────────▼────────────┐
         │   POSTGRESQL (Prisma)   │  (Products, Offers, Articles)
         └────────────┬────────────┘
                      │
       ┌──────────────┴──────────────┐
       │                             │
┌──────▼───────┐            ┌────────▼────────┐
│ DEALS RADAR  │            │ TREND FINDER    │
│ (CRON Watcher│            │ (Signal Agg)    │
│  + Alerts)   │            └────────┬────────┘
└──────┬───────┘                     │
       │                             │
       └──────────────┬──────────────┘
                      │
         ┌────────────▼────────────┐
         │   WRITER SERVICE        │  (Article Generator)
         │   (LLM Abstraction)     │
         └────────────┬────────────┘
                      │
         ┌────────────▼────────────┐
         │   SOCIAL BOT SERVICE    │  (X/Twitter Composer)
         │   (Post Queue + Log)    │
         └────────────┬────────────┘
                      │
       ┌──────────────┴──────────────┐
       │                             │
┌──────▼───────┐            ┌────────▼────────┐
│  WEB APP     │            │  ADMIN CMS      │
│  (Next.js)   │            │  (Protected)    │
│  Public      │            │  Dashboard      │
└──────────────┘            └─────────────────┘
```

---

## 2. Component Breakdown

### 2.1 Source Adapters
**Responsibility:** Fetch data from external APIs/feeds, normalize to internal schema.

#### Interface (TypeScript)
```typescript
interface SourceAdapter {
  name: string; // "amazon" | "bestbuy" | "newegg" | "youtube"
  fetchProducts(query: SearchQuery): Promise<RawProduct[]>;
  fetchProductDetails(id: string): Promise<RawProduct>;
  fetchPriceHistory?(id: string): Promise<PricePoint[]>;
  getRateLimit(): RateLimit; // { maxRequests, window }
}
```

#### Implementations
1. **AmazonAdapter** (PA-API 5.0)
   - Requires access key + secret + associate tag
   - Mock mode: returns static JSON from `fixtures/amazon-products.json`
   - Rate limit: 1 req/sec (dev), 10 req/sec (prod)
2. **BestBuyAdapter** (Open API)
   - Requires API key
   - Mock mode: `fixtures/bestbuy-products.json`
   - Rate limit: 5 req/sec
3. **NeweggAdapter** (RSS/XML Feed)
   - Public feed for deals; no auth required
   - Cache: 1h TTL
4. **YouTubeAdapter** (Data API v3)
   - Requires API key (10,000 quota/day)
   - Search by product name → metadata (title, thumbnail, videoId, channelTitle, viewCount)
   - Cache: 7d TTL to preserve quota
   - Mock mode: `fixtures/youtube-videos.json`

#### Failure Isolation
- Adapter errors logged but don't crash pipeline
- Circuit breaker pattern (3 failures → pause 5 min)
- Fallback to cached data if available

---

### 2.2 Ingest Pipeline
**Tech:** BullMQ (job queue) + Redis (state store)

#### Job Types
1. **`ingest:product`**
   - Triggered: CRON (hourly) or manual admin action
   - Flow: Adapter → Normalizer → Deduper → Upsert DB
   - Retry: 3 attempts with exponential backoff
2. **`ingest:price`**
   - Triggered: CRON (hourly)
   - Updates `PriceHistory` table
   - Detects thresholds → triggers `deals:alert`
3. **`ingest:video`**
   - Triggered: On product create/update
   - Searches YouTube for top 5 videos
   - Stores metadata in `MediaAsset` table

#### Queue Configuration
```typescript
// bullmq.config.ts
const queueConfig = {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100, // keep last 100 for audit
    removeOnFail: 500,
  },
  connection: { host: process.env.REDIS_HOST, port: 6379 },
};
```

---

### 2.3 Normalizer Service
**Responsibility:** Map vendor-specific schemas to unified `Product` + `Offer` model.

#### Logic
```typescript
function normalize(raw: RawProduct, vendor: Vendor): Product {
  return {
    title: cleanTitle(raw.title),
    slug: slugify(raw.title),
    category: inferCategory(raw.category || raw.keywords),
    imageUrl: selectBestImage(raw.images),
    specs: extractSpecs(raw),
    offers: [{
      vendor,
      price: raw.price,
      currency: raw.currency || 'USD',
      availability: mapAvailability(raw.stock),
      url: raw.url,
      lastCheckedAt: new Date(),
    }],
  };
}
```

#### Deduplication
- Hash: `sha256(title_normalized + category + vendor)`
- If hash exists → update `Offer` for that vendor
- If new → create `Product` + `Offer`

---

### 2.4 Ranker / Indexer
**Responsibility:** Search & sort products by relevance + deal quality.

#### Search Engine
- **Primary:** BM25 full-text search (PostgreSQL `tsvector` or lightweight lib like `flexsearch`)
- **Optional Upgrade:** Vector embeddings (OpenAI `text-embedding-3-small`) + HNSW index (pgvector)

#### Ranking Heuristic (Deal Score)
```typescript
const dealScore = (product: Product) => {
  const priceVelocity = (oldPrice - newPrice) / oldPrice; // % drop
  const recencyBoost = product.updatedAt > Date.now() - 24h ? 1.2 : 1.0;
  const availabilityPenalty = product.offers.some(o => o.availability === 'in_stock') ? 1.0 : 0.5;
  const mediaMentions = product.videos.length * 0.05; // +5% per video
  
  return (priceVelocity * 40 + mediaMentions * 30 + 20) * recencyBoost * availabilityPenalty;
};
```

#### Index Updates
- On product upsert → re-index (async job)
- On price change → recalculate deal score → update `trendingScore` field

---

### 2.5 Data Storage (PostgreSQL + Prisma)

#### Schema Highlights (see DATA_MODELS.md for full)
- **Products** (id, slug, title, category, specs JSONB)
- **Offers** (id, productId, vendor, price, url, lastCheckedAt)
- **PriceHistory** (productId, vendor, price, recordedAt)
- **MediaAssets** (id, productId, type, provider, providerId, metadata JSONB)
- **Articles** (id, slug, title, content, authorId, publishedAt)
- **DealPosts** (id, productId, score, status, publishedAt)
- **SocialPosts** (id, content, platform, scheduledAt, status, postedAt)

#### Indexes
```sql
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_trending ON products(trendingScore DESC, updatedAt DESC);
CREATE INDEX idx_offers_price ON offers(price, vendor);
CREATE INDEX idx_price_history_time ON price_history(productId, recordedAt DESC);
CREATE INDEX idx_articles_published ON articles(publishedAt DESC) WHERE status = 'published';
```

---

### 2.6 Deals Radar
**Responsibility:** Monitor price changes, trigger alerts.

#### CRON Job (Hourly)
```typescript
async function watchPrices() {
  const products = await prisma.product.findMany({ include: { offers: true } });
  
  for (const product of products) {
    const history = await prisma.priceHistory.findMany({
      where: { productId: product.id },
      orderBy: { recordedAt: 'desc' },
      take: 48, // last 48 hours
    });
    
    const drop24h = calculateDrop(history, 24);
    const dropAllTime = await checkAllTimeLow(product.id);
    
    if (drop24h > 0.10 || dropAllTime) {
      await createDealAlert(product, { drop24h, dropAllTime });
    }
  }
}
```

#### Alert Actions
1. Create `DealPost` record (status: pending)
2. If score > threshold (e.g., 70) → auto-publish to site
3. Queue `SocialPost` (dry-run by default)

---

### 2.7 Trend Finder
**Responsibility:** Aggregate signals to identify rising products.

#### Signal Sources
1. **Price Velocity:** % change over 7d, 30d
2. **Media Mentions:** Count of YouTube videos uploaded in last 7d (requires periodic re-scan)
3. **Site CTR:** Internal analytics (clicks per impressions)
4. **Social Spikes:** Manual tags for now (future: Twitter API integration)

#### Aggregation (Daily Job)
```typescript
interface TrendSignal {
  productId: string;
  priceVelocity7d: number;
  priceVelocity30d: number;
  mediaCount7d: number;
  ctr30d: number;
  score: number; // weighted sum
}

const trendScore = (signal: TrendSignal) =>
  0.4 * signal.priceVelocity7d +
  0.3 * (signal.mediaCount7d / 10) +
  0.2 * signal.ctr30d +
  0.1 * (signal.priceVelocity30d / 2);
```

---

### 2.8 Writer Service
**Responsibility:** Generate niche roundup articles.

#### LLM Abstraction
```typescript
interface Writer {
  generate(outline: Outline, facts: ProductFact[]): Promise<Article>;
}

// Implementations
class MockWriter implements Writer { /* returns placeholder */ }
class OpenAIWriter implements Writer { /* GPT-4 */ }
class AnthropicWriter implements Writer { /* Claude 3.5 */ }
```

#### Prompt Template
```
Role: You are a tech product analyst writing a roundup article.
Audience: Deal hunters researching [NICHE].
Tone: Neutral, factual, concise.

Outline:
H1: [PROBLEM] → [OUTCOME]
TL;DR: [3 quick picks]
[PRODUCT 1]: Use-case, specs, price as of [DATE], affiliate link
[PRODUCT 2]: ...
Comparison Table: [VALUE | PERFORMANCE | NOISE]
FAQ: [3-5 questions]
Disclaimer: FTC affiliate disclosure

Facts (structured data):
{JSON array of ProductFact}

Generate sections in Markdown. Include "[Affiliate Link]" placeholders.
```

#### Content Policy Guards
- No superlatives without data ("best" → "highest benchmark score")
- No medical/financial advice
- Fact-check prices/specs against structured data
- Auto-insert FTC disclosure header

---

### 2.9 Social Bot Service (X/Twitter)
**Responsibility:** Compose & schedule compliant posts.

#### Post Composer
```typescript
interface SocialPost {
  content: string; // 200-260 chars
  shortLink: string; // Bitly/TinyURL with UTM
  hashtags: string[];
  scheduledAt: Date;
  status: 'queued' | 'posted' | 'failed';
}

function composePost(deal: DealPost): SocialPost {
  const emoji = deal.score > 80 ? '🔥' : '💰';
  const content = `${emoji} ${deal.product.title} dropped to $${deal.price} (down ${deal.drop}%)! ${deal.benefit} ${deal.shortLink} #TechDeals #${deal.category}`;
  
  return {
    content: truncate(content, 260),
    shortLink: createShortLink(deal.url),
    hashtags: ['TechDeals', deal.category],
    scheduledAt: getNextSlot(), // rate-limited
    status: 'queued',
  };
}
```

#### Scheduler
- **Rate Limit:** 1 post per 20 min (72/day max, respects X ToS)
- **Queue:** BullMQ job `social:post`
- **Dry-Run Mode:** Default; admin must enable live posting
- **Audit Log:** All posts stored in `SocialPosts` table with response/error

---

### 2.10 Web App (Next.js 14 + App Router)

#### Pages
1. **Home** (`/`)
   - Hero: "Today's Top Deals"
   - Trending grid (12 products)
   - Featured articles (3 cards)
2. **Category** (`/category/[slug]`)
   - Product grid with filters (vendor, price, availability)
   - Sort by: price, deal score, newest
3. **Product Detail** (`/product/[slug]`)
   - Hero image, title, price grid (3 vendors)
   - Spec table
   - Video strip (YouTube embeds)
   - "Where to Buy" affiliate buttons
   - Price history chart
4. **Article** (`/article/[slug]`)
   - Markdown content with affiliate links
   - Table of contents
   - FTC disclosure header
5. **Trends** (`/trends`)
   - Table: Product | Score | Price Δ | Videos | CTR
   - Explainer for score components
6. **Admin** (`/admin/*`)
   - Dashboard (traffic, EPC, quota usage)
   - Product editor (override descriptions)
   - Article approvals
   - Social post queue

#### Tech Stack
- **Framework:** Next.js 14 (App Router, RSC)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Data Fetching:** Server Components for SEO, Client Components for interactivity
- **State:** Zustand (minimal; prefer server state)
- **Forms:** React Hook Form + Zod validation

---

### 2.11 Admin CMS
**Responsibility:** Internal tools for curators.

#### Features
1. **Product Management**
   - Search products, edit titles/descriptions
   - Manual price overrides (with expiry)
   - Tag assignment (categories, flags)
2. **Article Workflow**
   - Approve/reject AI-generated drafts
   - Edit in Markdown
   - Preview before publish
3. **Deals Queue**
   - View pending alerts
   - Approve/reject/reschedule
   - Manual deal creation
4. **Social Dashboard**
   - View scheduled posts
   - Enable/disable live posting
   - Retry failed posts
5. **Analytics**
   - Traffic by page (GA4 embed or custom)
   - CTR by vendor
   - EPC trends (requires affiliate network webhooks)

#### Auth
- **Next-Auth** with email/password (admin-only)
- Role-based guards (Admin, Editor, Viewer)

---

## 3. Secrets & Configuration

### Environment Variables (`.env.sample`)
```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/techdeals"

# Redis (BullMQ)
REDIS_HOST="localhost"
REDIS_PORT=6379

# Affiliate APIs (leave empty for mock mode)
AMAZON_ACCESS_KEY=""
AMAZON_SECRET_KEY=""
AMAZON_ASSOCIATE_TAG="techdeals-20"

BESTBUY_API_KEY=""
NEWEGG_FEED_URL=""

# YouTube
YOUTUBE_API_KEY=""

# LLM (optional)
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""

# Social
TWITTER_API_KEY=""
TWITTER_API_SECRET=""
TWITTER_ACCESS_TOKEN=""
TWITTER_ACCESS_SECRET=""
TWITTER_DRY_RUN="true" # set to "false" to enable live posting

# URL Shortener
BITLY_ACCESS_TOKEN=""

# Next.js
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate-random-string>"
NEXTAUTH_URL="http://localhost:3000"

# Observability (optional)
SENTRY_DSN=""
```

---

## 4. Deployment Architecture

### Development
- **Docker Compose:** PostgreSQL + Redis + Next.js dev server
- **Hot Reload:** Next.js fast refresh
- **Seed Data:** `npm run db:seed` (50 products, 10 articles)

### Production (Vercel / Fly.io)
```
┌─────────────────────┐
│   Vercel Edge       │  (Next.js SSR + Static)
│   (US, EU regions)  │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   Fly.io Instances  │  (Ingest workers, Jobs)
│   (2x redundancy)   │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   Managed Postgres  │  (Neon / Supabase)
│   (Primary + Replica│
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   Upstash Redis     │  (Serverless Redis)
└─────────────────────┘
```

#### CI/CD (GitHub Actions)
1. **On PR:** Lint, type-check, test
2. **On merge to `main`:** Deploy preview (Vercel)
3. **On tag `v*`:** Deploy production + run migrations

---

## 5. Failure Modes & Resilience

| Failure | Detection | Mitigation |
|---------|-----------|------------|
| Adapter API down | Circuit breaker | Serve cached data, show "stale" badge |
| Database connection lost | Health check endpoint | Retry with backoff, alert on-call |
| YouTube quota exceeded | 403 response | Fallback to manual embeds, cache 7d |
| LLM API timeout | 30s timeout | Return placeholder article, queue retry |
| Social post rate-limited | 429 response | Reschedule next available slot |

---

## 6. Observability

### Logging
- **Library:** Pino (JSON structured)
- **Levels:** debug (dev only), info, warn, error
- **Correlation:** Request ID in all logs

### Metrics (Future)
- **Tool:** Prometheus + Grafana (optional)
- **Key Metrics:**
  - API latency (p50, p95, p99)
  - DB query duration
  - Job queue depth
  - Affiliate click-through rate

### Alerts
- **Critical:** Database down, all adapters failing
- **Warning:** High queue depth (>1000), quota near limit

---

## 7. Tech Choices Rationale

| Choice | Why | Alternatives Considered |
|--------|-----|-------------------------|
| Next.js 14 | RSC for SEO, Edge deploy, React ecosystem | Remix (less mature), Astro (no React) |
| Prisma | Type-safe ORM, migrations, great DX | Drizzle (newer), raw SQL (verbose) |
| BullMQ | Redis-backed, retries, UI dashboard | SQS (vendor lock-in), pg-boss (slower) |
| Tailwind + shadcn | Fast iteration, a11y components | Material-UI (heavier), custom CSS (slow) |
| PostgreSQL | Full-text search, JSONB, pgvector | MongoDB (weak search), SQLite (prod limit) |

---

**Next:** See DATA_MODELS.md for schema details.
