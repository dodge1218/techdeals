# Data Models
## TechDeals Platform

**Version:** 1.0  
**Last Updated:** 2025-10-23  
**Status:** Sprint 0 - Foundation

---

## 1. ENTITY RELATIONSHIP DIAGRAM

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   Product   │──────<│     Deal     │>──────│AffiliateLink│
│             │       │              │       │             │
│ - id        │       │ - id         │       │ - id        │
│ - title     │       │ - productId  │       │ - dealId    │
│ - category  │       │ - retailer   │       │ - url       │
│ - brand     │       │ - price      │       │ - utmParams │
└──────┬──────┘       │ - discount   │       └─────────────┘
       │              └──────────────┘              
       │                     │                      
       │              ┌──────┴───────┐             
       │              │              │             
       ├──────────────┤              │             
       │              │              │             
┌──────▼──────┐ ┌─────▼──────┐ ┌────▼────────┐   
│MediaAsset   │ │PriceHistory│ │  DealPost   │   
│(Video)      │ │            │ │             │   
│             │ │ - id       │ │ - id        │   
│ - platform  │ │ - price    │ │ - productId │   
│ - externalId│ │ - timestamp│ │ - oldPrice  │   
└─────────────┘ └────────────┘ │ - newPrice  │   
                               └─────────────┘   
       │                              │           
       │                              │           
┌──────▼──────┐                ┌─────▼──────┐   
│   Article   │                │SocialPost  │   
│             │                │            │   
│ - id        │                │ - id       │   
│ - title     │                │ - content  │   
│ - content   │                │ - platform │   
│ - slug      │                │ - status   │   
└──────┬──────┘                └────────────┘   
       │                                         
┌──────▼──────┐       ┌──────────────┐          
│ArticleProduct│<─────│     Trend    │          
│(Join Table) │       │              │          
│             │       │ - id         │          
│ - articleId │       │ - productId  │          
│ - productId │       │ - signal     │          
└─────────────┘       │ - value      │          
                      └──────────────┘          
```

---

## 2. CORE ENTITIES

### 2.1 Product

**Purpose:** Represents a tech product across all retailers

**Schema:**
```prisma
model Product {
  id          String   @id @default(cuid())
  
  // Identity
  externalId  String   // ASIN, SKU, UPC
  source      String   // amazon, bestbuy, newegg
  title       String   @db.Text
  description String?  @db.Text
  
  // Classification
  category    String   // pc-parts, crypto-miners, phones, gaming-setup
  brand       String?
  model       String?
  
  // Media
  imageUrl    String?
  imageAltText String?
  
  // Metadata
  specs       Json?    // Flexible JSON for product-specific specs
  isActive    Boolean  @default(true)
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  lastScraped DateTime?
  
  // Relations
  deals         Deal[]
  priceHistory  PriceHistory[]
  mediaAssets   MediaAsset[]
  articles      Article[]    @relation("ArticleProducts")
  trends        Trend[]
  priceWatches  PriceWatch[]
  
  @@unique([externalId, source])
  @@index([category])
  @@index([brand])
  @@index([isActive])
  @@index([createdAt])
}
```

**Example Row:**
```json
{
  "id": "clxyz123abc",
  "externalId": "B08HR6FMK3",
  "source": "amazon",
  "title": "NVIDIA GeForce RTX 4090 Founders Edition",
  "description": "24GB GDDR6X, 16384 CUDA Cores, PCIe 4.0",
  "category": "pc-parts",
  "brand": "NVIDIA",
  "model": "RTX 4090",
  "imageUrl": "https://cdn.techdeals.com/products/rtx-4090.jpg",
  "specs": {
    "memory": "24GB GDDR6X",
    "coreClock": "2520 MHz",
    "tdp": "450W",
    "ports": ["HDMI 2.1", "3x DisplayPort 1.4a"]
  },
  "isActive": true,
  "createdAt": "2025-10-01T12:00:00Z",
  "updatedAt": "2025-10-23T03:45:00Z",
  "lastScraped": "2025-10-23T03:45:00Z"
}
```

---

### 2.2 Deal

**Purpose:** Tracks specific offers from retailers with pricing

**Schema:**
```prisma
model Deal {
  id            String   @id @default(cuid())
  
  // Product reference
  productId     String
  product       Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  // Retailer info
  retailer      String   // amazon, bestbuy, newegg
  retailerSKU   String?  // Retailer-specific SKU
  
  // Pricing
  price         Float
  originalPrice Float?   // MSRP or pre-discount price
  discount      Float?   // Calculated: (originalPrice - price) / originalPrice * 100
  currency      String   @default("USD")
  
  // Links
  url           String   @db.Text
  affiliateUrl  String?  @db.Text // Generated with tracking params
  
  // Availability
  isActive      Boolean  @default(true)
  inStock       Boolean  @default(true)
  stockCount    Int?     // If available from API
  
  // Validity
  startDate     DateTime @default(now())
  endDate       DateTime?
  
  // Timestamps
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  lastVerified  DateTime @default(now()) // Last time we checked link is live
  
  // Relations
  affiliateLinks AffiliateLink[]
  dealPosts      DealPost[]
  
  @@index([productId])
  @@index([retailer])
  @@index([isActive])
  @@index([discount(sort: Desc)])
  @@index([price])
  @@index([createdAt])
}
```

**Example Row:**
```json
{
  "id": "deal_abc123",
  "productId": "clxyz123abc",
  "retailer": "amazon",
  "retailerSKU": "B08HR6FMK3",
  "price": 1599.99,
  "originalPrice": 1899.99,
  "discount": 15.79,
  "currency": "USD",
  "url": "https://amazon.com/dp/B08HR6FMK3",
  "affiliateUrl": "https://amazon.com/dp/B08HR6FMK3?tag=techdeals-20&utm_source=techdeals&utm_medium=web",
  "isActive": true,
  "inStock": true,
  "startDate": "2025-10-23T00:00:00Z",
  "createdAt": "2025-10-23T03:45:00Z",
  "updatedAt": "2025-10-23T03:45:00Z",
  "lastVerified": "2025-10-23T03:45:00Z"
}
```

---

### 2.3 AffiliateLink

**Purpose:** Track affiliate link performance and UTM parameters

**Schema:**
```prisma
model AffiliateLink {
  id          String   @id @default(cuid())
  
  // Deal reference
  dealId      String
  deal        Deal     @relation(fields: [dealId], references: [id], onDelete: Cascade)
  
  // Link details
  shortUrl    String?  // bit.ly or custom short domain
  longUrl     String   @db.Text
  
  // UTM Parameters
  utmSource   String   // techdeals
  utmMedium   String   // web, email, social
  utmCampaign String   // deal_{dealId}, article_{articleId}
  utmTerm     String?
  utmContent  String?
  
  // Tracking
  clicks      Int      @default(0)
  conversions Int      @default(0)
  revenue     Float    @default(0)
  
  // Timestamps
  createdAt   DateTime @default(now())
  lastClicked DateTime?
  
  @@index([dealId])
  @@index([utmCampaign])
  @@index([clicks(sort: Desc)])
}
```

---

### 2.4 PriceHistory

**Purpose:** Track price changes over time for trend analysis

**Schema:**
```prisma
model PriceHistory {
  id          String   @id @default(cuid())
  
  // Product reference
  productId   String
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  // Price data
  price       Float
  source      String   // Which adapter reported this price
  currency    String   @default("USD")
  
  // Timestamp
  timestamp   DateTime @default(now())
  
  @@index([productId, timestamp(sort: Desc)])
  @@index([timestamp])
}
```

**Usage:**
```typescript
// Calculate 7-day price trend
const history = await db.priceHistory.findMany({
  where: {
    productId: 'clxyz123abc',
    timestamp: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  },
  orderBy: { timestamp: 'asc' }
});

const priceChange = (history[history.length - 1].price - history[0].price) / history[0].price * 100;
```

---

### 2.5 MediaAsset (Videos)

**Purpose:** Store YouTube video metadata for product reviews

**Schema:**
```prisma
model MediaAsset {
  id           String   @id @default(cuid())
  
  // Product reference
  productId    String?
  product      Product? @relation(fields: [productId], references: [id], onDelete: SetNull)
  
  // Article reference (optional)
  articleId    String?
  article      Article? @relation(fields: [articleId], references: [id], onDelete: SetNull)
  
  // Platform info
  platform     String   // youtube, vimeo, twitch
  externalId   String   // YouTube video ID
  
  // Metadata
  title        String   @db.Text
  description  String?  @db.Text
  thumbnailUrl String?
  channelName  String?
  duration     Int?     // Seconds
  viewCount    Int?
  likeCount    Int?
  
  // URLs
  url          String   @db.Text
  embedUrl     String?  @db.Text
  
  // Timestamps
  publishedAt  DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@unique([platform, externalId])
  @@index([productId])
  @@index([articleId])
  @@index([platform])
}
```

**Example Row:**
```json
{
  "id": "media_xyz789",
  "productId": "clxyz123abc",
  "platform": "youtube",
  "externalId": "dQw4w9WgXcQ",
  "title": "RTX 4090 Review: The Ultimate Gaming GPU?",
  "channelName": "Linus Tech Tips",
  "thumbnailUrl": "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  "duration": 847,
  "viewCount": 1234567,
  "url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
  "embedUrl": "https://youtube.com/embed/dQw4w9WgXcQ",
  "publishedAt": "2025-10-15T18:00:00Z",
  "createdAt": "2025-10-23T04:00:00Z"
}
```

---

### 2.6 Article

**Purpose:** AI-generated or curated buying guides

**Schema:**
```prisma
model Article {
  id          String   @id @default(cuid())
  
  // Content
  title       String   @db.Text
  slug        String   @unique
  content     String   @db.Text // Markdown
  excerpt     String?  @db.Text
  
  // Metadata
  niche       String   // crypto-mining, gaming-setup, phone-accessories
  authorName  String   @default("TechDeals Team")
  status      String   @default("draft") // draft, published, archived
  
  // SEO
  metaTitle       String?
  metaDescription String?
  ogImage         String?
  
  // Timestamps
  publishedAt DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  products    Product[]     @relation("ArticleProducts")
  mediaAssets MediaAsset[]
  
  @@index([slug])
  @@index([niche])
  @@index([status])
  @@index([publishedAt(sort: Desc)])
}
```

**Example Row:**
```json
{
  "id": "art_123abc",
  "title": "Best Graphics Cards for Crypto Mining in 2025",
  "slug": "best-gpus-crypto-mining-2025",
  "content": "# Best Graphics Cards for Crypto Mining in 2025\n\n## TL;DR\n...",
  "excerpt": "Complete guide to choosing the right GPU for cryptocurrency mining",
  "niche": "crypto-mining",
  "authorName": "TechDeals Team",
  "status": "published",
  "metaTitle": "Best Crypto Mining GPUs 2025 | TechDeals",
  "metaDescription": "Top-rated graphics cards for mining Ethereum, Bitcoin, and altcoins",
  "publishedAt": "2025-10-23T12:00:00Z",
  "updatedAt": "2025-10-23T12:00:00Z"
}
```

---

### 2.7 Trend

**Purpose:** Store calculated trend signals for products

**Schema:**
```prisma
model Trend {
  id          String   @id @default(cuid())
  
  // Product reference
  productId   String
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  // Signal details
  signal      String   // price_drop, media_mention, search_volume, social_buzz
  metric      String   // percentage, count, change
  value       Float    // Numeric value of the signal
  
  // Context
  metadata    Json?    // Additional context (e.g., { oldPrice: 100, newPrice: 85 })
  
  // Timestamp
  timestamp   DateTime @default(now())
  
  @@index([productId])
  @@index([signal])
  @@index([timestamp(sort: Desc)])
  @@index([value(sort: Desc)])
}
```

**Signal Types:**
| Signal | Example Value | Interpretation |
|--------|---------------|----------------|
| `price_drop` | -15.8 | Price dropped 15.8% |
| `price_spike` | +8.3 | Price increased 8.3% |
| `media_mention` | 47 | 47 new videos in last 7 days |
| `search_volume` | +23.5 | Search queries up 23.5% |
| `social_buzz` | 89 | 89 Reddit/Twitter mentions |

---

### 2.8 PriceWatch

**Purpose:** User-created price alerts

**Schema:**
```prisma
model PriceWatch {
  id          String   @id @default(cuid())
  
  // Product reference
  productId   String
  
  // User info (pre-auth: just email)
  userId      String?  // Future: User.id when auth is added
  email       String
  
  // Alert parameters
  targetPrice Float
  lastSeenPrice Float?
  
  // Status
  notified    Boolean  @default(false)
  notifiedAt  DateTime?
  
  // Expiry
  expiresAt   DateTime // 30 days from creation
  
  // Timestamps
  createdAt   DateTime @default(now())
  
  @@index([productId])
  @@index([email])
  @@index([notified])
  @@index([expiresAt])
}
```

---

### 2.9 DealPost

**Purpose:** Record of a deal being "posted" (internal or social)

**Schema:**
```prisma
model DealPost {
  id          String   @id @default(cuid())
  
  // Deal reference
  productId   String
  dealId      String?
  
  // Price info
  oldPrice    Float?
  newPrice    Float
  discount    Float?
  
  // Source
  source      String   // price_watch, manual, trending
  
  // Metadata
  metadata    Json?
  
  // Timestamps
  createdAt   DateTime @default(now())
  
  // Relations
  socialPosts SocialPost[]
  
  @@index([productId])
  @@index([createdAt(sort: Desc)])
}
```

---

### 2.10 SocialPost

**Purpose:** Queue and track social media posts (Twitter/X)

**Schema:**
```prisma
model SocialPost {
  id          String   @id @default(cuid())
  
  // Platform
  platform    String   // twitter, facebook, instagram
  
  // Content
  content     String   @db.Text
  mediaUrls   String[] // Image/video URLs
  hashtags    String[]
  
  // Links
  dealId      String?
  articleId   String?
  dealPostId  String?
  dealPost    DealPost? @relation(fields: [dealPostId], references: [id], onDelete: SetNull)
  
  // External tracking
  postId      String?  // Twitter tweet ID, etc.
  shortUrl    String?  // Shortened link
  
  // Scheduling
  scheduledAt DateTime?
  postedAt    DateTime?
  
  // Status
  status      String   @default("draft") // draft, queued, posted, failed
  error       String?  @db.Text
  
  // Engagement (updated via webhook/poll)
  likes       Int      @default(0)
  retweets    Int      @default(0)
  clicks      Int      @default(0)
  
  // Timestamps
  createdAt   DateTime @default(now())
  
  @@index([platform])
  @@index([status])
  @@index([scheduledAt])
  @@index([postedAt(sort: Desc)])
}
```

---

### 2.11 CrawlJob (Future)

**Purpose:** Track scraping jobs for observability

**Schema:**
```prisma
model CrawlJob {
  id          String   @id @default(cuid())
  
  // Job details
  adapter     String   // amazon, bestbuy, youtube
  jobType     String   // product_sync, price_update, video_search
  
  // Parameters
  params      Json?    // Job-specific params
  
  // Results
  itemsFound  Int      @default(0)
  itemsAdded  Int      @default(0)
  itemsUpdated Int     @default(0)
  errors      Json?    // Array of error objects
  
  // Status
  status      String   // pending, running, completed, failed
  startedAt   DateTime?
  completedAt DateTime?
  
  // Timestamps
  createdAt   DateTime @default(now())
  
  @@index([adapter])
  @@index([status])
  @@index([createdAt(sort: Desc)])
}
```

---

### 2.12 User (Future - Post-MVP)

**Purpose:** User accounts for personalized features

**Schema:**
```prisma
model User {
  id          String   @id @default(cuid())
  
  // Auth
  email       String   @unique
  passwordHash String? // Null if OAuth only
  emailVerified Boolean @default(false)
  
  // Profile
  name        String?
  avatar      String?
  
  // Roles
  role        String   @default("user") // user, moderator, admin
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  lastLoginAt DateTime?
  
  // Relations
  priceWatches PriceWatch[]
  savedDeals   SavedDeal[]
  comments     Comment[]
  
  @@index([email])
  @@index([role])
}
```

---

## 3. INDEXES & CONSTRAINTS

### Critical Indexes (Performance)
```prisma
// Product lookups by category (deals page)
@@index([category, isActive])

// Deal sorting by discount
@@index([isActive, discount(sort: Desc)])

// Price history time-series queries
@@index([productId, timestamp(sort: Desc)])

// Trend analysis
@@index([signal, timestamp(sort: Desc)])

// Article slugs (SEO URLs)
@@unique([slug])

// Prevent duplicate price watches
@@unique([email, productId])
```

### Foreign Key Constraints
- **ON DELETE CASCADE:** If product deleted → delete all deals, price history, trends
- **ON DELETE SET NULL:** If product deleted → media assets remain (may be reused)
- **ON DELETE RESTRICT:** Cannot delete product if active price watches exist

---

## 4. SAMPLE QUERIES

### Get Hot Deals with Products
```typescript
const hotDeals = await db.deal.findMany({
  where: { 
    isActive: true,
    discount: { gte: 10 } // At least 10% off
  },
  include: {
    product: {
      include: {
        mediaAssets: { take: 3 },
      },
    },
  },
  orderBy: { discount: 'desc' },
  take: 20,
});
```

### Get Article with Linked Products and Deals
```typescript
const article = await db.article.findUnique({
  where: { slug: 'best-gpus-crypto-mining-2025' },
  include: {
    products: {
      include: {
        deals: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
          take: 1, // Cheapest deal per product
        },
      },
    },
    mediaAssets: true,
  },
});
```

### Calculate Price Trend (7-day moving average)
```typescript
const history = await db.priceHistory.findMany({
  where: {
    productId: 'clxyz123abc',
    timestamp: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  },
  orderBy: { timestamp: 'asc' }
});

const avgPrice = history.reduce((sum, h) => sum + h.price, 0) / history.length;
const latestPrice = history[history.length - 1].price;
const priceChange = ((latestPrice - avgPrice) / avgPrice) * 100;
```

### Find Products Trending Up
```typescript
const trendingProducts = await db.product.findMany({
  where: {
    trends: {
      some: {
        signal: 'price_drop',
        value: { gte: 10 }, // At least 10% drop
        timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    }
  },
  include: {
    trends: {
      where: {
        timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      },
      orderBy: { value: 'desc' }
    },
    deals: {
      where: { isActive: true },
      orderBy: { price: 'asc' },
      take: 1,
    }
  },
  take: 10,
});
```

---

## 5. DATA VALIDATION RULES

### Product
- ✅ `title`: Required, max 500 chars
- ✅ `category`: Enum (pc-parts, crypto-miners, phones, gaming-setup, accessories)
- ✅ `imageUrl`: Valid URL or null
- ✅ `externalId + source`: Unique pair

### Deal
- ✅ `price`: Positive number, max 2 decimal places
- ✅ `discount`: 0-100 (calculated server-side)
- ✅ `retailer`: Enum (amazon, bestbuy, newegg)
- ✅ `endDate`: Must be after startDate (if set)
- ✅ `url`: Valid HTTP/HTTPS URL

### Article
- ✅ `slug`: Unique, lowercase, no spaces (use hyphens)
- ✅ `status`: Enum (draft, published, archived)
- ✅ `content`: Max 50,000 chars
- ✅ `niche`: Required, max 100 chars

### PriceWatch
- ✅ `email`: Valid email format
- ✅ `targetPrice`: Must be positive
- ✅ `expiresAt`: Max 90 days from creation
- ✅ `email + productId`: Unique (prevent duplicate watches)

---

## 6. MIGRATION STRATEGY

### Initial Schema (Sprint 1)
```bash
npx prisma migrate dev --name init
```

### Adding Indexes (Sprint 2)
```bash
npx prisma migrate dev --name add_performance_indexes
```

### New Features (Sprint 3+)
```bash
# Add User model
npx prisma migrate dev --name add_users

# Add saved deals
npx prisma migrate dev --name add_saved_deals
```

### Production Migrations
```bash
# Generate SQL (don't auto-apply)
npx prisma migrate deploy --preview-feature

# Review SQL, then apply
npx prisma migrate deploy
```

---

## 7. SEEDING STRATEGY

### Seed File Structure
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Products
  const rtx4090 = await prisma.product.create({
    data: {
      externalId: 'B08HR6FMK3',
      source: 'amazon',
      title: 'NVIDIA RTX 4090 Founders Edition',
      category: 'pc-parts',
      brand: 'NVIDIA',
      // ...
    },
  });
  
  // 2. Deals
  await prisma.deal.create({
    data: {
      productId: rtx4090.id,
      retailer: 'amazon',
      price: 1599.99,
      originalPrice: 1899.99,
      discount: 15.79,
      url: 'https://amazon.com/dp/B08HR6FMK3',
      // ...
    },
  });
  
  // 3. Videos
  await prisma.mediaAsset.createMany({
    data: [
      {
        productId: rtx4090.id,
        platform: 'youtube',
        externalId: 'dQw4w9WgXcQ',
        title: 'RTX 4090 Review',
        // ...
      },
    ],
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Run Seed
```bash
npx prisma db seed
```

---

**Document Status:** ✅ Approved for Sprint 0  
**Next Review:** Sprint 1 (after first migration)  
**Owner:** Data Team  
**Last Updated:** 2025-10-23
