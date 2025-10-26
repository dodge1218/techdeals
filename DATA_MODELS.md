# TechDeals - Data Models

**Version:** 1.0  
**Last Updated:** 2025-10-23

---

## 1. Entity Relationship Diagram (Conceptual)

```
┌──────────┐         ┌──────────┐         ┌──────────────┐
│ Product  │────────<│  Offer   │>────────│ PriceHistory │
│          │    1:N  │          │    1:N  │              │
└────┬─────┘         └──────────┘         └──────────────┘
     │                                              
     │ 1:N                                          
     ▼                                              
┌──────────────┐     ┌──────────┐         ┌──────────────┐
│ MediaAsset   │     │ Article  │────────<│ ArticleLink  │
│ (Video)      │     │          │    N:M  │ (join table) │
└──────────────┘     └────┬─────┘         └──────────────┘
                          │                       
     ┌────────────────────┴──────────────┐        
     │                                   │        
     ▼                                   ▼        
┌──────────┐                      ┌──────────────┐
│ DealPost │                      │ SocialPost   │
│          │                      │              │
└──────────┘                      └──────────────┘

┌──────────┐         ┌──────────┐
│   User   │────────<│   Role   │
│          │    N:M  │          │
└──────────┘         └──────────┘
```

---

## 2. Core Entities

### 2.1 Product
**Represents a tech product available from one or more vendors.**

```prisma
model Product {
  id              String   @id @default(cuid())
  slug            String   @unique
  title           String
  description     String?
  category        String   // "crypto-miners" | "pc-parts" | "phones" | "gaming-setup"
  subcategory     String?  // "gpu" | "cpu" | "asic" | "monitor"
  imageUrl        String?
  specs           Json?    // Flexible JSONB for vendor-specific specs
  trendingScore   Float    @default(0)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  offers          Offer[]
  priceHistory    PriceHistory[]
  mediaAssets     MediaAsset[]
  dealPosts       DealPost[]
  articleLinks    ArticleLink[]
  
  @@index([category, trendingScore])
  @@index([trendingScore, updatedAt])
  @@map("products")
}
```

**Fields:**
- `slug`: URL-friendly identifier (e.g., "rtx-4070-nvidia")
- `specs`: JSONB (e.g., `{"cores": 5888, "vram": "12GB", "tdp": "200W"}`)
- `trendingScore`: Composite score (price velocity + media mentions + CTR)

---

### 2.2 Offer
**A product listing from a specific vendor with current price.**

```prisma
model Offer {
  id              String   @id @default(cuid())
  productId       String
  product         Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  vendor          String   // "amazon" | "bestbuy" | "newegg"
  externalId      String   // ASIN, SKU, etc.
  url             String
  affiliateUrl    String?  // Pre-built with UTM tags
  
  price           Float
  currency        String   @default("USD")
  availability    String   // "in_stock" | "out_of_stock" | "preorder"
  
  lastCheckedAt   DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([productId, vendor])
  @@index([vendor, price])
  @@map("offers")
}
```

**Constraints:**
- One offer per vendor per product (unique composite)
- `affiliateUrl` built by `AffiliateLinkBuilder` service

---

### 2.3 PriceHistory
**Time-series data for price tracking.**

```prisma
model PriceHistory {
  id          String   @id @default(cuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  vendor      String
  price       Float
  currency    String   @default("USD")
  availability String
  
  recordedAt  DateTime @default(now())
  
  @@index([productId, recordedAt])
  @@index([vendor, recordedAt])
  @@map("price_history")
}
```

**Usage:**
- CRON inserts hourly snapshots
- Queries for price velocity: `SELECT price FROM price_history WHERE productId = ? AND recordedAt > NOW() - INTERVAL '7 days'`

---

### 2.4 MediaAsset
**Videos, images, or other media linked to products.**

```prisma
model MediaAsset {
  id          String   @id @default(cuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  type        String   // "video" | "image" | "review"
  provider    String   // "youtube" | "vimeo" | "direct"
  providerId  String   // YouTube videoId, etc.
  
  title       String?
  thumbnailUrl String?
  metadata    Json?    // { duration, viewCount, channelTitle, publishedAt }
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([productId, type])
  @@map("media_assets")
}
```

**Example (YouTube):**
```json
{
  "type": "video",
  "provider": "youtube",
  "providerId": "dQw4w9WgXcQ",
  "metadata": {
    "duration": "PT3M33S",
    "viewCount": 1234567,
    "channelTitle": "Tech Reviewer",
    "publishedAt": "2024-01-15T00:00:00Z"
  }
}
```

---

### 2.5 Article
**Roundup articles (manual or AI-generated).**

```prisma
model Article {
  id            String   @id @default(cuid())
  slug          String   @unique
  title         String
  excerpt       String?
  content       String   // Markdown
  
  authorId      String?
  author        User?    @relation(fields: [authorId], references: [id], onDelete: SetNull)
  
  status        String   @default("draft") // "draft" | "published" | "archived"
  publishedAt   DateTime?
  
  metadata      Json?    // { targetKeyword, readTime, ftcDisclosure }
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  articleLinks  ArticleLink[]
  
  @@index([status, publishedAt])
  @@map("articles")
}
```

**Markdown Format:**
```markdown
# Best Budget RTX 4060 Gaming PCs Under $1000

**TL;DR:** We tested 8 builds; here are the top 3 for value, performance, and upgradeability.

## 1. CyberPowerPC Gamer Xtreme
- **Use Case:** 1080p gaming at 60+ FPS
- **Key Specs:** RTX 4060, Ryzen 5 5600, 16GB RAM
- **Price:** $899 as of 2024-10-23
- [Check Price on Amazon](#) | [Best Buy](#)

...

**FTC Disclosure:** TechDeals earns affiliate commissions from links in this article.
```

---

### 2.6 ArticleLink
**Join table linking articles to products.**

```prisma
model ArticleLink {
  id          String   @id @default(cuid())
  articleId   String
  article     Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)
  
  productId   String
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  position    Int      // Order in article (1, 2, 3...)
  context     String?  // "top-pick" | "budget-option" | "premium-choice"
  
  createdAt   DateTime @default(now())
  
  @@unique([articleId, productId])
  @@index([articleId, position])
  @@map("article_links")
}
```

---

### 2.7 DealPost
**Published deals (site + optional social).**

```prisma
model DealPost {
  id          String   @id @default(cuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  title       String   // "RTX 4070 Ti drops to $699 (20% off)"
  excerpt     String?
  score       Float    // Deal quality score (0-100)
  
  priceOld    Float?
  priceNew    Float
  priceDrop   Float?   // % drop
  
  status      String   @default("pending") // "pending" | "published" | "expired"
  publishedAt DateTime?
  expiresAt   DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  socialPosts SocialPost[]
  
  @@index([status, publishedAt])
  @@index([score, publishedAt])
  @@map("deal_posts")
}
```

**Lifecycle:**
1. Created by Deals Radar job (status: `pending`)
2. If `score > 70` → auto-publish (status: `published`)
3. If price reverts or product unavailable → status: `expired`

---

### 2.8 SocialPost
**Social media posts (Twitter/X, future: others).**

```prisma
model SocialPost {
  id          String   @id @default(cuid())
  dealPostId  String?
  dealPost    DealPost? @relation(fields: [dealPostId], references: [id], onDelete: SetNull)
  
  platform    String   // "twitter" | "reddit" | "discord"
  content     String   // 200-260 chars for Twitter
  shortLink   String?  // Bitly/TinyURL
  hashtags    String[] // ["TechDeals", "GPU"]
  
  scheduledAt DateTime
  postedAt    DateTime?
  
  status      String   @default("queued") // "queued" | "posted" | "failed"
  error       String?  // Error message if failed
  responseId  String?  // Tweet ID, post ID, etc.
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([platform, status, scheduledAt])
  @@map("social_posts")
}
```

**Rate Limiting:**
- Scheduler enforces 1 post per 20 min
- Query: `SELECT * FROM social_posts WHERE platform='twitter' AND postedAt > NOW() - INTERVAL '20 minutes'`

---

### 2.9 CrawlJob
**Audit log for ingest jobs.**

```prisma
model CrawlJob {
  id          String   @id @default(cuid())
  jobType     String   // "ingest:product" | "ingest:price" | "ingest:video"
  adapter     String   // "amazon" | "bestbuy" | "youtube"
  
  status      String   @default("pending") // "pending" | "running" | "completed" | "failed"
  startedAt   DateTime?
  completedAt DateTime?
  
  itemsProcessed Int   @default(0)
  itemsFailed    Int   @default(0)
  
  error       String?  // JSON error details
  metadata    Json?    // { query, filters, rateLimit }
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([adapter, status, createdAt])
  @@map("crawl_jobs")
}
```

---

### 2.10 User
**Admin/editor accounts.**

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String   // bcrypt
  name          String?
  
  role          String   @default("viewer") // "admin" | "editor" | "viewer"
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  articles      Article[]
  
  @@map("users")
}
```

**Roles:**
- **Admin:** Full access (products, articles, deals, social, settings)
- **Editor:** Content only (edit articles, approve deals)
- **Viewer:** Read-only analytics

---

## 3. Indexes & Constraints

### Performance Indexes
```sql
-- Products
CREATE INDEX idx_products_category_score ON products(category, trendingScore DESC);
CREATE INDEX idx_products_updated ON products(updatedAt DESC);

-- Offers
CREATE INDEX idx_offers_vendor_price ON offers(vendor, price);
CREATE INDEX idx_offers_product ON offers(productId);

-- PriceHistory (time-series queries)
CREATE INDEX idx_price_history_product_time ON price_history(productId, recordedAt DESC);

-- Articles
CREATE INDEX idx_articles_published ON articles(status, publishedAt DESC) WHERE status = 'published';

-- DealPosts
CREATE INDEX idx_deal_posts_score ON deal_posts(score DESC, publishedAt DESC) WHERE status = 'published';

-- SocialPosts (scheduler queries)
CREATE INDEX idx_social_posts_schedule ON social_posts(platform, status, scheduledAt) WHERE status = 'queued';
```

### Unique Constraints
```sql
-- One offer per vendor per product
ALTER TABLE offers ADD CONSTRAINT uq_offers_product_vendor UNIQUE (productId, vendor);

-- One article link per product per article
ALTER TABLE article_links ADD CONSTRAINT uq_article_links UNIQUE (articleId, productId);

-- Slugs must be unique
ALTER TABLE products ADD CONSTRAINT uq_products_slug UNIQUE (slug);
ALTER TABLE articles ADD CONSTRAINT uq_articles_slug UNIQUE (slug);
```

---

## 4. Prisma Schema (Full Example)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Product {
  id              String   @id @default(cuid())
  slug            String   @unique
  title           String
  description     String?
  category        String
  subcategory     String?
  imageUrl        String?
  specs           Json?
  trendingScore   Float    @default(0)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  offers          Offer[]
  priceHistory    PriceHistory[]
  mediaAssets     MediaAsset[]
  dealPosts       DealPost[]
  articleLinks    ArticleLink[]
  
  @@index([category, trendingScore])
  @@index([trendingScore, updatedAt])
  @@map("products")
}

model Offer {
  id              String   @id @default(cuid())
  productId       String
  product         Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  vendor          String
  externalId      String
  url             String
  affiliateUrl    String?
  
  price           Float
  currency        String   @default("USD")
  availability    String
  
  lastCheckedAt   DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([productId, vendor])
  @@index([vendor, price])
  @@map("offers")
}

model PriceHistory {
  id          String   @id @default(cuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  vendor      String
  price       Float
  currency    String   @default("USD")
  availability String
  
  recordedAt  DateTime @default(now())
  
  @@index([productId, recordedAt])
  @@index([vendor, recordedAt])
  @@map("price_history")
}

model MediaAsset {
  id          String   @id @default(cuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  type        String
  provider    String
  providerId  String
  
  title       String?
  thumbnailUrl String?
  metadata    Json?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([productId, type])
  @@map("media_assets")
}

model Article {
  id            String   @id @default(cuid())
  slug          String   @unique
  title         String
  excerpt       String?
  content       String
  
  authorId      String?
  author        User?    @relation(fields: [authorId], references: [id], onDelete: SetNull)
  
  status        String   @default("draft")
  publishedAt   DateTime?
  
  metadata      Json?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  articleLinks  ArticleLink[]
  
  @@index([status, publishedAt])
  @@map("articles")
}

model ArticleLink {
  id          String   @id @default(cuid())
  articleId   String
  article     Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)
  
  productId   String
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  position    Int
  context     String?
  
  createdAt   DateTime @default(now())
  
  @@unique([articleId, productId])
  @@index([articleId, position])
  @@map("article_links")
}

model DealPost {
  id          String   @id @default(cuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  title       String
  excerpt     String?
  score       Float
  
  priceOld    Float?
  priceNew    Float
  priceDrop   Float?
  
  status      String   @default("pending")
  publishedAt DateTime?
  expiresAt   DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  socialPosts SocialPost[]
  
  @@index([status, publishedAt])
  @@index([score, publishedAt])
  @@map("deal_posts")
}

model SocialPost {
  id          String   @id @default(cuid())
  dealPostId  String?
  dealPost    DealPost? @relation(fields: [dealPostId], references: [id], onDelete: SetNull)
  
  platform    String
  content     String
  shortLink   String?
  hashtags    String[]
  
  scheduledAt DateTime
  postedAt    DateTime?
  
  status      String   @default("queued")
  error       String?
  responseId  String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([platform, status, scheduledAt])
  @@map("social_posts")
}

model CrawlJob {
  id          String   @id @default(cuid())
  jobType     String
  adapter     String
  
  status      String   @default("pending")
  startedAt   DateTime?
  completedAt DateTime?
  
  itemsProcessed Int   @default(0)
  itemsFailed    Int   @default(0)
  
  error       String?
  metadata    Json?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([adapter, status, createdAt])
  @@map("crawl_jobs")
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  name          String?
  
  role          String   @default("viewer")
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  articles      Article[]
  
  @@map("users")
}
```

---

## 5. Seed Data Examples

### Products
```typescript
const seedProducts = [
  {
    slug: 'bitmain-antminer-s19-xp',
    title: 'Bitmain Antminer S19 XP (140 TH/s)',
    category: 'crypto-miners',
    subcategory: 'asic',
    specs: { hashrate: '140 TH/s', power: '3010W', algorithm: 'SHA-256' },
    offers: [
      { vendor: 'amazon', price: 5299.99, externalId: 'B09XYZ123' },
      { vendor: 'newegg', price: 5199.99, externalId: 'N82E16123456' },
    ],
  },
  {
    slug: 'nvidia-rtx-4070-ti',
    title: 'NVIDIA GeForce RTX 4070 Ti 12GB',
    category: 'pc-parts',
    subcategory: 'gpu',
    specs: { cores: 7680, vram: '12GB GDDR6X', tdp: '285W' },
    offers: [
      { vendor: 'bestbuy', price: 799.99, externalId: 'SKU12345' },
      { vendor: 'amazon', price: 829.99, externalId: 'B0ABCD1234' },
    ],
  },
  // ... 48 more
];
```

### Articles
```typescript
const seedArticles = [
  {
    slug: 'best-budget-crypto-miners-2024',
    title: 'Best Budget Crypto Miners Under $2000 (2024)',
    status: 'published',
    publishedAt: new Date('2024-10-01'),
    content: `# Best Budget Crypto Miners Under $2000\n\n**TL;DR:** ...`,
    articleLinks: [
      { productId: 'product-1', position: 1, context: 'top-pick' },
      { productId: 'product-2', position: 2, context: 'best-value' },
    ],
  },
];
```

---

## 6. Query Patterns

### Get Trending Products (Home Page)
```typescript
const trending = await prisma.product.findMany({
  where: { category: 'pc-parts' },
  include: {
    offers: {
      orderBy: { price: 'asc' },
      take: 3,
    },
    mediaAssets: {
      where: { type: 'video' },
      take: 3,
    },
  },
  orderBy: [
    { trendingScore: 'desc' },
    { updatedAt: 'desc' },
  ],
  take: 12,
});
```

### Get Price Drop Last 24h
```typescript
const drops = await prisma.$queryRaw`
  SELECT 
    p.id, p.title,
    ph_old.price AS price_old,
    ph_new.price AS price_new,
    ((ph_old.price - ph_new.price) / ph_old.price) AS drop_pct
  FROM products p
  JOIN price_history ph_old ON p.id = ph_old.productId
  JOIN price_history ph_new ON p.id = ph_new.productId
  WHERE ph_old.recordedAt = NOW() - INTERVAL '24 hours'
    AND ph_new.recordedAt >= NOW() - INTERVAL '1 hour'
    AND ph_new.price < ph_old.price * 0.9
`;
```

### Affiliate Link CTR (Analytics)
```typescript
// Requires external analytics integration (GA4, Plausible)
// Example placeholder query:
const ctr = await db.query(`
  SELECT 
    o.vendor,
    COUNT(*) AS impressions,
    SUM(CASE WHEN clicked THEN 1 ELSE 0 END) AS clicks
  FROM analytics_events
  WHERE event_type = 'affiliate_link'
  GROUP BY o.vendor
`);
```

---

**Next:** See ROADMAP.md for sprint plan.
