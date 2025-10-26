# Product Requirements Document (PRD)
## TechDeals - Tech Deal Aggregation & Content Platform

**Version:** 1.0  
**Last Updated:** 2025-10-23  
**Owner:** Product Team  
**Status:** Sprint 0 - Foundation

---

## 1. VISION & OBJECTIVES

### Vision Statement
Build the world's fastest, most comprehensive tech deals platform that surfaces video reviews, generates AI-powered buying guides, and detects emerging trends—all while earning affiliate revenue through compliant, user-first content.

### North Star Metrics
| Metric | Target (Month 3) | Target (Month 6) | Rationale |
|--------|------------------|------------------|-----------|
| **Monthly Unique Visitors** | 50k | 200k | Growth & reach |
| **Deal CTR (Click-Through Rate)** | 5% | 8% | Conversion quality |
| **EPC (Earnings Per Click)** | $0.50 | $0.75 | Revenue efficiency |
| **RPM (Revenue Per Mille)** | $10 | $15 | Monetization health |
| **Article CTR** | 3% | 5% | Content engagement |
| **Video Engagement (avg watch time)** | 30s | 60s | Media value |
| **Deal-to-Click Latency (p95)** | <500ms | <300ms | Performance |

### Success Criteria (MVP)
- ✅ Aggregate 500+ active tech deals across 3 retailers
- ✅ Generate 20+ AI roundup articles (5-10 links each)
- ✅ Surface 100+ YouTube product reviews with <2s load time
- ✅ Detect 10+ price drop trends weekly
- ✅ Achieve 85+ Lighthouse score (mobile)
- ✅ Amazon Associates approval + first commission

---

## 2. USERS & JOBS-TO-BE-DONE

### Primary Personas

#### 1. **The Deal Hunter** (50% of users)
**Profile:** Tech enthusiast, price-sensitive, comparison shops  
**Jobs-to-Be-Done:**
- Find the absolute best price on a specific product (RTX 4090, iPhone 15)
- Discover deals I didn't know existed (serendipity)
- Set price alerts and get notified when threshold hits
- Verify deal legitimacy (not scam/counterfeit)

**Pain Points:**
- Too many tabs open (Slickdeals, Amazon, Best Buy, Newegg)
- Fake discounts ("was $999, now $998!")
- Stale prices, dead links
- Miss time-sensitive lightning deals

**Success Metrics:** CTR on deals, price watch signups, return visits

---

#### 2. **The Builder/Enthusiast** (30% of users)
**Profile:** Building gaming PC, mining rig, home office setup  
**Jobs-to-Be-Done:**
- Understand "why this component" (not just price)
- See real-world benchmarks and reviews (video preferred)
- Compare 3-5 options in same category
- Get complete build recommendations

**Pain Points:**
- Overwhelming SKU proliferation (100+ GPUs)
- Conflicting YouTube reviews
- Don't know what specs actually matter
- Budget constraints vs. performance trade-offs

**Success Metrics:** Article read time, video watch time, multi-product clicks

---

#### 3. **The Curator/Moderator** (Internal, 20% traffic influence)
**Profile:** Admin team, power users with edit access  
**Jobs-to-Be-Done:**
- Approve/reject AI-generated articles
- Override deal rankings when algo is wrong
- Add manual deals (exclusive finds)
- Schedule social posts

**Pain Points:**
- AI hallucinates specs or prices
- Duplicate deals clutter feed
- Need to manually verify affiliate links work

**Success Metrics:** Time to approve, error rate, user-reported issues

---

## 3. FEATURE SET (MVP → MMP → V1)

### MVP (Minimum Viable Product) - Sprint 1-2

#### 3.1 Media Surface (Videos)
**User Story:** As a deal hunter, I want to see relevant YouTube reviews for a product without leaving the site, so I can make informed decisions quickly.

**Requirements:**
- ✅ YouTube Data API integration (search by product name/model)
- ✅ Embed player in-page (no external navigation)
- ✅ Cache metadata (title, thumbnail, channel, duration) for 24h
- ✅ Show 2-4 most relevant videos per product page
- ✅ Fallback to generic search if no exact matches
- ✅ Lazy load videos below fold (performance)

**Acceptance Criteria:**
- Search "RTX 4090" → Shows 3 review videos from Linus Tech Tips, Gamers Nexus, JayzTwoCents
- Videos load <2s; player controls work (play/pause/seek)
- Mobile: videos responsive, playable inline

**Non-Goals (MMP):** TikTok, Instagram Reels, Twitch clips

---

#### 3.2 Affiliate Links
**User Story:** As the business, I want to earn commission on every purchase, while being fully compliant with retailer terms.

**Requirements:**
- ✅ **Amazon Associates:** PA-API or link builder; tag injection; "as-of" timestamp; 24h cache
- ✅ **Best Buy Affiliate:** Partner Network links with SID parameter
- ✅ **Newegg Affiliate:** Commission Junction integration or direct links
- ✅ UTM tagging: `utm_source=techdeals&utm_medium=web&utm_campaign=deal_{id}`
- ✅ Price display: "$1,599.99 (as of Oct 23, 2025 3:45 PM EST)"
- ✅ Out-of-stock badge: "Currently Unavailable" with alternative links
- ✅ Link validation: Check HTTP 200 before displaying; quarantine 404s

**Compliance Rules:**
- ⚠️ **Amazon:** No "Add to Cart" buttons; no false urgency ("Only 2 left!"); must show "as-of" time; 24h max staleness
- ⚠️ **FTC:** Disclose affiliate relationship above fold on every page with links
- ⚠️ **Privacy:** No PII in UTM tags; respect Do Not Track

**Acceptance Criteria:**
- Deal card shows price with timestamp: "$1,299 (as of Oct 23, 2025)"
- Click → Redirects to `amazon.com/?tag=techdeals-20&...`
- Footer disclaimer: "We earn from qualifying purchases"
- Dead link → Deal marked "Expired" within 1 hour

---

#### 3.3 Article Writer (AI Roundups)
**User Story:** As a builder, I want expert buying guides that explain "why this product" with 5-10 vetted options, so I don't waste time researching.

**Template Structure:**
```markdown
# [Niche Topic]: Best [Category] for [Use Case] in 2025

## TL;DR (Quick Picks)
- **Best Overall:** [Product A] - [1-line reason]
- **Best Budget:** [Product B] - [1-line reason]
- **Best Premium:** [Product C] - [1-line reason]

## Why This Matters
[2-3 paragraphs: problem space, what's changed in 2025, key considerations]

## Top 5-10 Recommendations

### 1. [Product Name] - [Price] ([Affiliate Link])
**Best For:** [Use case]
**Why We Recommend It:**
- [Benefit 1 with spec]
- [Benefit 2 with spec]
- [Real-world performance note]

**Key Specs:**
| Spec | Value |
|------|-------|
| [Spec 1] | [Value] |

[Repeat for 5-10 products]

## Comparison Table
| Product | Price | [Key Spec 1] | [Key Spec 2] | Best For |
|---------|-------|--------------|--------------|----------|

## FAQ
**Q: [Common question]?**
A: [Answer with product link if relevant]

## Responsible Buying Notes
- [Environmental consideration]
- [Warranty/return policy advice]
- [Avoid common pitfalls]

---
**Disclosure:** We earn from qualifying purchases made through our links. Prices accurate as of [timestamp].
```

**AI Prompt Template (for Writer Service):**
```
Role: Expert tech buyer's guide writer
Task: Write a 1200-1500 word article on "{niche_topic}"
Style: Conversational, data-driven, unbiased
Structure: TL;DR → Problem → 5-10 Products → Comparison → FAQ
Requirements:
- Include {affiliate_links} with "as-of" timestamps
- Cite specs from {product_data}
- Explain trade-offs (performance vs. noise vs. price)
- No medical/financial advice; stick to product specs
- FTC disclosure at end
Output: Markdown with H2/H3 headers, tables, bullet lists
```

**Acceptance Criteria:**
- Generate article "Best GPUs for Crypto Mining 2025" with 7 products
- Each product has: title, price, 3 benefits, specs table, affiliate link
- FAQ section has 3-5 Q&As
- FTC disclosure present at bottom
- Passes content policy (no hallucinated specs, no promotional language)
- Editor can approve/reject in admin CMS

**Non-Goals (MMP):** Real-time price updates, user comments, multi-language

---

#### 3.4 Trend Finder
**User Story:** As a deal hunter, I want to discover products gaining popularity or dropping in price before they sell out.

**Signal Types:**
| Signal | Source | Update Frequency | Weight |
|--------|--------|------------------|--------|
| **Price Drop %** | Price history DB | Hourly | 40% |
| **Price Velocity** | 7-day moving avg | Daily | 20% |
| **Media Mentions** | YouTube video count (last 7 days) | Daily | 15% |
| **Click-Through Spike** | Internal analytics | Real-time | 15% |
| **Social Buzz** | Twitter/Reddit mentions (optional) | Daily | 10% |

**Ranking Algorithm (v0):**
```
trend_score = (price_drop_pct * 0.4) + 
              (velocity_change * 0.2) + 
              (log(media_mentions + 1) * 0.15) + 
              (ctr_spike * 0.15) + 
              (social_score * 0.1)
```

**UI Requirements:**
- Page: `/trends`
- Filters: Category, Time range (24h, 7d, 30d), Signal type
- Card per product: Image, title, trend badge ("🔥 Trending"), score breakdown tooltip
- Sort: Highest score first
- Refresh: Every 15 minutes

**Acceptance Criteria:**
- RTX 4090 price drops 15% → Appears in "Trending" with "Price Drop" badge
- Click-through rate doubles → Trend score increases
- Explainable: Hover over score shows "(40% price, 20% velocity, ...)"

---

#### 3.5 Deals Radar (Price Watching)
**User Story:** As a deal hunter, I want to set a target price and get notified when it's reached.

**Flow:**
1. User clicks "Watch This Deal" on product page
2. Modal: "Notify me when price drops below $[input]"
3. Backend: Creates `PriceWatch` record with threshold
4. CRON job (hourly): Checks current price vs. threshold
5. If triggered: Creates `DealPost` + queues email/push/social post
6. User receives notification via chosen channel

**Requirements:**
- ✅ Anonymous watch (no login required): Store email + product ID
- ✅ Threshold validation: Must be ≤ current price - 5%
- ✅ De-dupe: One watch per email per product
- ✅ Expiry: Auto-expire after 30 days or 5 notifications
- ✅ Unsubscribe: One-click link in email

**Backend (Price Watcher CRON):**
```typescript
// Pseudocode
async function priceWatcherJob() {
  const watches = await db.priceWatch.findMany({
    where: { notified: false, expiresAt: { gt: new Date() } }
  });
  
  for (const watch of watches) {
    const currentPrice = await fetchCurrentPrice(watch.productId);
    if (currentPrice <= watch.targetPrice) {
      await createDealPost({
        productId: watch.productId,
        oldPrice: watch.lastSeenPrice,
        newPrice: currentPrice,
        discount: ((watch.lastSeenPrice - currentPrice) / watch.lastSeenPrice) * 100
      });
      await notifyUser(watch.email, watch.productId, currentPrice);
      await db.priceWatch.update({
        where: { id: watch.id },
        data: { notified: true, notifiedAt: new Date() }
      });
    }
  }
}
```

**Acceptance Criteria:**
- User sets watch: RTX 4090 @ $1,500
- Price drops to $1,499 → Email sent within 1 hour
- Email contains: Product name, new price, deal link, unsubscribe link
- Watch marked as notified; no duplicate emails

---

#### 3.6 Twitter/X Automation
**User Story:** As the business, I want to automatically post hot deals to Twitter to drive traffic.

**Post Composer Template:**
```
🔥 [Product Name] just dropped to [Price] ([Discount]% off)!

[1-line benefit or spec highlight]

👉 [Short link with UTM]

#TechDeals #[Category] #[Brand]
```

**Requirements:**
- ✅ Scheduler: Queue posts with `scheduledAt` timestamp
- ✅ Rate limiting: Max 10 posts/hour (Twitter limits)
- ✅ Dry-run mode: Log to console instead of posting (default for dev)
- ✅ UTM tracking: `utm_source=twitter&utm_medium=social&utm_campaign=auto_post`
- ✅ Link shortener: bit.ly API or custom short domain
- ✅ Audit log: Store all posts (success/failure, engagement stats)
- ✅ Manual override: Admin can edit/delete queued posts

**Compliance:**
- ⚠️ Twitter ToS: No spam, no misleading content, respect rate limits
- ⚠️ FTC: Include #ad or #affiliate in posts with commission links (optional: inline disclosure)

**Backend (Social Bot Worker):**
```typescript
async function socialPostWorker() {
  const posts = await db.socialPost.findMany({
    where: { 
      status: 'queued',
      scheduledAt: { lte: new Date() }
    },
    orderBy: { scheduledAt: 'asc' },
    take: 10
  });
  
  for (const post of posts) {
    try {
      if (process.env.DRY_RUN === 'true') {
        console.log('[DRY RUN] Would post:', post.content);
      } else {
        const result = await twitterClient.tweet(post.content);
        await db.socialPost.update({
          where: { id: post.id },
          data: { 
            status: 'posted',
            postedAt: new Date(),
            externalId: result.id
          }
        });
      }
    } catch (error) {
      await db.socialPost.update({
        where: { id: post.id },
        data: { status: 'failed', error: error.message }
      });
    }
  }
}
```

**Acceptance Criteria:**
- Create post: "RTX 4090 - $1599 (15% off)" → Queued for next hour
- Dry-run mode: Logs to console; no actual tweet
- Production mode: Posts to Twitter; stores tweet ID
- Rate limit: If 10 posts already sent this hour → Delay until next hour

---

### MMP (Minimum Marketable Product) - Sprint 3-4

#### 3.7 Admin CMS
**User Story:** As a curator, I want to review AI-generated articles and manually promote deals.

**Features:**
- Article approval queue (list view)
- Deal override: Boost rank, hide from feed, mark expired
- Manual deal entry: Custom title, price, affiliate link
- Social post scheduler: Calendar view
- Analytics dashboard: CTR, EPC, top products

**Acceptance Criteria:**
- Admin can approve/reject article with 1-click
- Edit article: Modify title, content, add/remove links
- Promote deal: Pin to homepage for 24h

---

#### 3.8 SEO Optimization
**User Story:** As the business, I want Google to index our content and rank us for "best [product] 2025" queries.

**Requirements:**
- ✅ Sitemap.xml: Auto-generate, update daily
- ✅ Robots.txt: Allow all except /admin, /api
- ✅ OpenGraph tags: Title, description, image for social shares
- ✅ Structured data (schema.org):
  - `Product` with offers, reviews, images
  - `Article` with author, datePublished, dateModified
  - `VideoObject` for YouTube embeds
  - `Offer` with price, availability, seller
- ✅ Canonical URLs: Avoid duplicate content
- ✅ Meta descriptions: 120-160 chars per page

**Acceptance Criteria:**
- Google Search Console: 0 errors, 500+ pages indexed
- Rich snippets appear in search results (stars, price)
- Lighthouse SEO score: 100

---

### V1 (Enhanced Product) - Sprint 5+

#### 3.9 User Accounts
- Saved deals, watch lists
- Personalized recommendations
- Comment on articles (moderated)

#### 3.10 Mobile App
- Push notifications for price alerts
- Barcode scanner → Deal lookup

#### 3.11 Browser Extension
- Real-time deal overlay on Amazon/Best Buy
- Price history charts

---

## 4. NON-FUNCTIONAL REQUIREMENTS

### 4.1 Performance
| Metric | Target | Rationale |
|--------|--------|-----------|
| **LCP (Largest Contentful Paint)** | <2.5s | Core Web Vitals |
| **FID (First Input Delay)** | <100ms | Interactivity |
| **CLS (Cumulative Layout Shift)** | <0.1 | Visual stability |
| **API Response Time (p95)** | <500ms | User experience |
| **Cache Hit Rate** | >80% | Cost efficiency |

**Strategies:**
- Next.js Image Optimization + lazy loading
- Redis caching (product data, video metadata)
- CDN for static assets (Cloudflare/Vercel)
- Database indexing (price, category, createdAt)

---

### 4.2 Accessibility (a11y)
- WCAG 2.1 Level AA compliance
- Keyboard navigation (Tab, Enter, Esc)
- Screen reader support (ARIA labels)
- Color contrast: 4.5:1 minimum
- Focus indicators visible

---

### 4.3 Security
- HTTPS everywhere (HSTS)
- CSRF tokens on forms
- Rate limiting (10 req/sec per IP)
- SQL injection prevention (Prisma parameterized queries)
- XSS prevention (React auto-escaping)
- Secrets in env vars (never in code)

---

### 4.4 Observability
- Logging: Pino (structured JSON)
- Metrics: Prometheus + Grafana (req/sec, error rate, latency)
- Alerts: PagerDuty for P0/P1 incidents
- Tracing: OpenTelemetry (distributed traces)

---

## 5. COMPLIANCE & LEGAL

### 5.1 Amazon Associates
**MUST comply with:**
- ✅ Show "as-of" timestamp with every price
- ✅ Update prices at least every 24 hours
- ✅ Do NOT use "Add to Cart" buttons
- ✅ Do NOT claim "Only X left" or fake urgency
- ✅ Include disclaimer: "As an Amazon Associate, we earn from qualifying purchases"
- ✅ Link directly to Amazon product pages (no intermediary pages)

**Prohibited:**
- ❌ Stale prices (>24h old)
- ❌ Misleading product info
- ❌ Pop-ups covering Amazon page
- ❌ Offline use (e.g., PDF catalogs)

**Verification:**
- Automated test: Check every deal page has timestamp within 24h
- Red team: Manually verify 10 random deals/week

---

### 5.2 FTC Affiliate Disclosure
**Requirements:**
- ✅ Disclosure above the fold on every page with affiliate links
- ✅ Clear, conspicuous language (not hidden in footer)
- ✅ Examples:
  - "We earn from qualifying purchases"
  - "Affiliate links support this site"
- ✅ Placement: Below header, before first product card

**Template:**
```html
<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
  <p class="text-sm text-yellow-800">
    <strong>Disclosure:</strong> We earn from qualifying purchases made through our links. 
    This supports our site at no extra cost to you.
  </p>
</div>
```

---

### 5.3 Data Privacy
- ✅ Privacy Policy published (GDPR, CCPA compliant)
- ✅ Cookie consent banner (only essential cookies in MVP)
- ✅ No PII in UTM tags or logs
- ✅ Email: One-click unsubscribe for price alerts

---

### 5.4 Scraping & Robots.txt
**Allowed:**
- ✅ Official APIs (YouTube Data API, Amazon PA-API, Best Buy API)
- ✅ RSS feeds with explicit permission
- ✅ Public product pages (with rate limiting)

**Prohibited:**
- ❌ Bypassing authentication
- ❌ Ignoring robots.txt or crawl-delay
- ❌ Overloading servers (DOS)

**Our Robots.txt:**
```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /_next
Crawl-delay: 1
```

---

## 6. LAUNCH READINESS CHECKLIST

### Pre-Launch (MVP)
- [ ] 500+ deals across 3 retailers
- [ ] 20+ AI articles published
- [ ] Amazon Associates approval received
- [ ] FTC disclosure on all pages
- [ ] Lighthouse score ≥85 (mobile/desktop)
- [ ] Sitemap.xml live
- [ ] Analytics tracking (GA4 or Plausible)
- [ ] Error monitoring (Sentry or LogRocket)
- [ ] Privacy Policy + Terms of Service published
- [ ] 10 user beta tests (no critical bugs)

### Post-Launch (Week 1)
- [ ] 1,000+ unique visitors
- [ ] First affiliate commission earned
- [ ] 0 downtime incidents
- [ ] <5% bounce rate on deal pages
- [ ] Twitter bot: 50+ posts, 0 violations

---

## 7. OUT OF SCOPE (Explicitly NOT in MVP)

- ❌ User-generated content (reviews, comments)
- ❌ Multi-language support
- ❌ Mobile app (web-first)
- ❌ Live chat support
- ❌ Comparison shopping cart
- ❌ Crypto payments
- ❌ B2B/wholesale deals
- ❌ Physical product sales (we're affiliate-only)

---

## 8. GLOSSARY

| Term | Definition |
|------|------------|
| **CTR** | Click-Through Rate: (Clicks / Impressions) * 100 |
| **EPC** | Earnings Per Click: Total revenue / Total clicks |
| **RPM** | Revenue Per Mille (1000 impressions) |
| **PA-API** | Product Advertising API (Amazon's official API) |
| **UTM** | Urchin Tracking Module (URL parameters for analytics) |
| **LCP** | Largest Contentful Paint (Core Web Vitals metric) |
| **WCAG** | Web Content Accessibility Guidelines |

---

**Document Status:** ✅ Approved for Sprint 0  
**Next Review:** Sprint 2 Retrospective  
**Owner:** Product Team  
**Last Updated:** 2025-10-23
