# TechDeals - Product Requirements Document

**Version:** 1.0  
**Owner:** Lead PM/Tech Architect  
**Last Updated:** 2025-10-23

---

## 1. Vision & Objectives

### Vision
Become the **fastest, most trusted destination** for tech deal hunters who need:
- Real-time price drops across crypto miners, PC parts, phones, gaming gear
- Rich contextual media (YouTube reviews/unboxings) embedded in-page
- Curated roundup articles explaining "why buy this"
- Automated alerts & social feeds for trending deals

### North Star Metrics
1. **Traffic → CTR → EPC → RPM**
   - Monthly active users (MAU) > 10k by Month 3
   - Aggregate affiliate CTR > 3.5%
   - Earnings-per-click (EPC) > $0.15
   - Revenue-per-mille (RPM) > $12
2. **Article CTR** (from organic search) > 2.5%
3. **Video Engagement** (play rate on embedded videos) > 18%
4. **Deal-to-Click Latency** < 4 hours (from price drop detection to site publish)

---

## 2. Users & Jobs-to-Be-Done

### Primary Personas
1. **Deal Hunter (Chris)**
   - Monitors GPU/CPU/SSD price drops for PC build
   - Wants instant notifications when target price hit
   - Trusts affiliate sites that show real-time "as-of" timestamps
2. **Crypto Miner (Alex)**
   - Needs ROI calculators for ASICs (not in MVP, future)
   - Tracks miner availability across vendors
   - Watches YouTube reviews for thermal/noise data
3. **Gaming Setup Builder (Jordan)**
   - Browses curated "starter desk setup" roundups
   - Needs comparisons: monitor arms, RGB strips, soundproofing
   - Values explainer articles with 5–10 product links

### Jobs-to-Be-Done
- **When** a new tech product drops or price falls, **I want to** see it ranked by value + relevance **so I can** act before stock runs out.
- **When** researching a purchase, **I want to** watch embedded reviews without leaving the site **so I can** make faster decisions.
- **When** I need buying guidance, **I want to** read niche roundups with clear affiliate disclosure **so I can** trust the recommendations.

---

## 3. Feature Set (MVP → MMP → V1)

### MVP (Sprint 1-2)
**Core Experience: Browse, Search, Click Affiliate Links**

#### 3.1 Media Surface
- **YouTube Integration**
  - Search by product name/SKU → fetch top 3–5 video metadata (title, thumbnail, channel, view count)
  - In-page embed player (click thumbnail → modal or inline player)
  - Cache metadata for 7 days to respect quota limits
  - Graceful fallback if quota exceeded: show "video unavailable" card with manual YouTube search link
- **No downloads/re-hosting** (ToS compliant)

#### 3.2 Affiliate Links
- **Supported Vendors:** Amazon, Best Buy, Newegg
- **Link Builder Interface** (`AffiliateProvider`)
  - Input: product ASIN/SKU, campaign tag
  - Output: tagged URL with UTM params (`utm_source=techdeals&utm_medium=affiliate&utm_campaign=<niche>`)
- **Price Display**
  - Show "$XXX.XX as of [timestamp]"
  - If price > 24h old, show "⚠️ May be outdated" badge
  - Out-of-stock: gray out link, show "Check availability" CTA
- **Compliance**
  - Amazon Associates: include required disclosure on every page with Amazon links
  - FTC: clear "Affiliate Link Disclosure" block in footer + article headers
  - No price caching > 24h without refresh

#### 3.3 Product Pages
- Hero: product image, title, current price grid (Amazon/BestBuy/Newegg)
- Spec table (parsed from API or manual entry)
- Video strip (3–5 YouTube embeds)
- "Where to Buy" section with affiliate buttons
- Price history chart (simple line graph, last 30 days)

#### 3.4 Home & Category Pages
- **Home**
  - "Trending Now" (top 10 by deal score)
  - "New Drops" (last 48h)
  - "Top Roundups" (featured articles)
- **Categories**
  - Crypto Miners, PC Parts (CPU/GPU/RAM/Storage), Phones & Accessories, Gaming Setup (desks/monitors/audio/lighting)
  - Filter by vendor, price range, availability

### MMP (Sprint 3-4)
**Add Intelligence: Writing, Trends, Radar**

#### 3.5 Article Writer
- **Template-Driven Roundups**
  - Input: niche topic (e.g., "Best budget RTX 4060 builds")
  - Output: 1200–1800 word article with:
    - H1: Problem → Outcome framing
    - TL;DR block (3 quick picks)
    - 5–10 product sections (use-case, key specs, price, affiliate link)
    - Comparison table
    - FAQ (3–5 questions)
    - FTC disclosure
- **Content Policy Safeguards**
  - No medical/financial advice
  - No superlatives without data ("best" requires metric)
  - Neutral tone; cite sources for claims
- **LLM Abstraction**
  - Provider interface: `Writer.generate(outline, facts) → sections`
  - Mock mode (returns placeholder text) if no API key
  - Upgrade path: OpenAI, Anthropic, local Llama

#### 3.6 Trend Finder
- **Signal Sources**
  - Price velocity (% drop over 7d, 30d)
  - Media mentions count (YouTube video uploads in last 7d)
  - Social spikes (manual tags for now; future: Twitter API)
  - Site CTR (internal analytics)
- **Ranking Heuristic**
  - `TrendScore = 0.4×PriceVelocity + 0.3×MediaMentions + 0.2×CTR + 0.1×Recency`
  - Explainable breakdown in UI (bar chart per component)
- **UI**
  - Table: Product | Score | Price Δ | Videos | CTR | Action
  - Auto-refresh every 6h

#### 3.7 Deals Radar
- **Price Watchers**
  - CRON job (every 1h) checks price history for thresholds:
    - >10% drop in 24h
    - All-time low
    - Back in stock after 7d+ unavailability
- **Alert Queue**
  - Creates `DealPost` record (status: pending)
  - Publishes to site (auto-approve if score > threshold)
  - Queues social post (dry-run by default)
- **User Alerts** (future: email/push; MVP: on-site badge)

### V1 (Sprint 5-6)
**Scale & Automate**

#### 3.8 Social Automation (Twitter/X)
- **Post Composer**
  - Template: `"🔥 [Product] dropped to $XXX (down Y%)! [1-line benefit] [short link] #TechDeals #[Category]"`
  - Character limit: 200–260
  - UTM-tagged short link (Bitly/TinyURL API)
- **Scheduler**
  - Rate limit: max 1 post per 20 min (respects X ToS)
  - Queue table: `SocialPost(content, scheduled_at, status, posted_at)`
  - Dry-run mode default; admin must enable live posting
- **Audit Log**
  - All posts logged with timestamp, response, errors
  - Manual retry for failed posts

#### 3.9 Admin CMS
- **Curation Tools**
  - Approve/reject queued articles & deals
  - Override product descriptions, images, prices
  - Manual re-rank (boost/bury)
  - Tag management (add/remove categories)
- **Analytics Dashboard**
  - Traffic by page, CTR by vendor, EPC trends
  - Top-performing articles & products
  - Quota usage (API limits)
- **Role-Based Access**
  - Admin (full access)
  - Editor (content only)
  - Viewer (read-only)

#### 3.10 SEO Hardening
- **Structured Data**
  - `Product` schema with offers (per vendor)
  - `Article` schema for roundups
  - `VideoObject` schema for embeds
- **Sitemaps**
  - `/sitemap.xml` (index)
  - `/sitemap-products.xml`, `/sitemap-articles.xml`
  - Auto-regenerate on publish
- **OpenGraph & Twitter Cards**
  - Dynamic OG images (product + price overlay)
  - Proper canonical URLs
- **Performance**
  - Core Web Vitals target: LCP <2.5s, CLS <0.1, FID <100ms
  - Image optimization (next/image, WebP/AVIF)
  - Edge caching (Vercel/Cloudflare)

---

## 4. Non-Functional Requirements

### Performance
- **LCP < 2.5s** on 4G mid-tier device
- **API response times** < 300ms p95
- **Search latency** < 150ms (BM25 + optional vector index)

### Accessibility
- **WCAG 2.1 AA** compliance
- Keyboard navigation, screen reader labels, color contrast >4.5:1

### Security
- **Secrets management:** env vars only, never committed
- **Rate limiting:** 100 req/min per IP (public API if added)
- **Input sanitization:** SQL injection, XSS guards

### Observability
- **Logging:** JSON structured logs (pino), log levels (debug/info/warn/error)
- **Metrics:** API latency, DB query times, job queue depth
- **Error tracking:** Sentry or similar (optional)

---

## 5. Compliance & Safety (Safety Pivot)

### Affiliate Program Rules
1. **Amazon Associates**
   - Show "as-of" timestamp on all prices
   - Never cache prices > 24h without refresh
   - Include: "As an Amazon Associate, TechDeals earns from qualifying purchases."
   - No prohibited displays (e.g., stale prices, misleading images)
2. **Best Buy Affiliate Network**
   - Use official API; respect rate limits
   - Disclose affiliate relationship
3. **Newegg**
   - Follow feed ToS; attribute properly

### Data Collection
- **Only use official APIs/feeds** where required
- **No prohibited scraping** (e.g., competitor pricing via HTML scrape)
- **Respect robots.txt** and crawl-delay directives
- **Cache responsibly:** 6–24h for metadata, 1h for prices

### Content Moderation
- **AI-generated articles** must pass:
  - Fact-check (prices/specs from structured data)
  - Tone check (neutral, no hype)
  - Disclosure (clearly marked as AI-assisted if applicable)
- **No medical/financial advice** beyond product specs

### FTC Compliance
- **Clear disclosure** on every page with affiliate links
- **Above-the-fold or in-article header** for roundups
- **No dark patterns** (hidden disclosures, misleading CTAs)

---

## 6. Example Product Domains (Seed Data)

### Crypto Miners
- Bitmain Antminer S19 XP, Whatsminer M50S, Goldshell KD6, AvalonMiner 1246

### PC Parts
- GPUs: RTX 4090/4080/4070, RX 7900 XTX/XT
- CPUs: Ryzen 9 7950X, Intel i9-14900K
- RAM: DDR5 kits (Corsair, G.Skill)
- Storage: Samsung 990 Pro, WD Black SN850X

### Phones & Accessories
- iPhone 15 Pro, Galaxy S24 Ultra, Pixel 8 Pro
- Cases, screen protectors, wireless chargers, earbuds

### Gaming Setup
- Desks: Flexispot, Autonomous
- Monitors: LG UltraGear, ASUS ROG Swift
- Audio: HyperX Cloud, Blue Yeti
- Lighting: Philips Hue, Govee LED strips

---

## 7. Out of Scope (V1)

- User accounts / wishlists
- Community forums / comments
- ROI calculators (crypto miners)
- Browser extensions
- Mobile apps (PWA sufficient)
- Internationalization (US-only MVP)

---

## 8. Success Criteria (MVP Launch)

### Pre-Launch Checklist
- [ ] 50+ products seeded across 4 categories
- [ ] 10+ roundup articles published with FTC disclosures
- [ ] Affiliate links tested (Amazon/BestBuy/Newegg) with UTM tags
- [ ] YouTube embeds working (3 videos per product page)
- [ ] Lighthouse score ≥85 (performance, accessibility, SEO)
- [ ] Legal review of disclosures & ToS compliance

### Post-Launch (Week 1–4)
- [ ] 500+ unique visitors
- [ ] 20+ affiliate clicks
- [ ] 1+ article ranking in Google top 50 for target keyword
- [ ] 0 affiliate compliance violations
- [ ] <0.5% error rate (5xx responses)

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Amazon PA-API approval delayed | High | Use mock data + manual link building until approved |
| YouTube quota exceeded | Medium | Cache metadata 7d; fallback to manual embeds |
| No LLM API key | Medium | Ship mock article writer; upgrade when key available |
| Competitor price scraping prohibited | High | Only use official APIs/feeds; document sources |
| FTC enforcement action | Critical | Legal review before launch; over-disclose |

---

## 10. Open Questions

1. **LLM Provider:** OpenAI (fast, expensive) vs. Anthropic (cheaper, slower) vs. local (free, requires GPU)?
2. **Social Platform Priority:** Twitter/X only, or add Reddit/Discord bots?
3. **Monetization Mix:** 100% affiliate, or add display ads (impact on UX)?

---

**Next Steps:** Proceed to Architecture & Data Models.
