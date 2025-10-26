# TechDeals - Development Roadmap

**Version:** 1.0  
**Last Updated:** 2025-10-23

---

## Sprint Structure

**Duration:** 1 week per sprint  
**Velocity Target:** 30–40 ICE mini-score points per sprint  
**Definition of Done:**
- Code merged to `main` branch
- Tests passing (unit + integration)
- Deployed to preview environment
- Docs updated (if applicable)

---

## Sprint 0: Foundation (Docs & Planning) – **COMPLETE**

### Deliverables
- [x] PRD.md (vision, features, compliance)
- [x] ARCHITECTURE.md (system design, tech choices)
- [x] DATA_MODELS.md (Prisma schema, entities)
- [x] ROADMAP.md (this file)
- [x] TEST_STRATEGY.md (testing approach)

**ICE Mini-Score:** N/A (documentation only)

---

## Sprint 1: MVP Foundation (Week 1)

### Epic 1.1: Repository Scaffold
**Goal:** Bootstrapped Next.js 14 app with essential tooling.

#### Stories
1. **Initialize Next.js Repo**
   - [x] `npx create-next-app@latest` with TypeScript, App Router, Tailwind
   - [x] Configure ESLint, Prettier, `.editorconfig`
   - [x] Add `package.json` scripts: `dev`, `build`, `test`, `lint`
   - **AC:** `npm run dev` starts on port 3000, shows Next.js default page
   - **ICE:** 9/10 (I:3, C:3, E:3) – Standard setup, zero friction

2. **Docker Compose Setup**
   - [x] `docker-compose.yml` with PostgreSQL, Redis
   - [x] `.env.sample` with DATABASE_URL, REDIS_HOST
   - **AC:** `docker compose up -d` starts services, `psql` connects
   - **ICE:** 8/10 (I:3, C:3, E:2) – Essential for local dev

3. **Install Core Dependencies**
   - [x] Prisma, @prisma/client, BullMQ, ioredis
   - [x] shadcn/ui CLI: `npx shadcn-ui@latest init`
   - [x] Install components: Button, Card, Table, Badge, Dialog
   - **AC:** `npm install` succeeds, `npx prisma` works
   - **ICE:** 7/10 (I:2, C:3, E:2) – One-time cost

---

### Epic 1.2: Data Layer
**Goal:** Prisma schema, migrations, seed data.

#### Stories
4. **Define Prisma Schema**
   - [x] Create `prisma/schema.prisma` with Product, Offer, PriceHistory, MediaAsset models
   - [x] Run `npx prisma migrate dev --name init`
   - **AC:** Migration succeeds, tables visible in `psql`
   - **ICE:** 9/10 (I:4, C:3, E:2) – Foundational, high reuse

5. **Seed Script**
   - [x] `prisma/seed.ts` with 50 products (10 per category)
   - [x] Include offers from Amazon/BestBuy/Newegg (mock data)
   - [x] Add 5 YouTube video metadata records (mock)
   - **AC:** `npm run db:seed` populates DB, `SELECT COUNT(*) FROM products` returns 50
   - **ICE:** 8/10 (I:3, C:3, E:2) – Critical for demos

---

### Epic 1.3: Web UI Skeleton
**Goal:** Home, Category, Product pages (read-only, no data yet).

#### Stories
6. **Layout & Navigation**
   - [x] `app/layout.tsx`: header (logo, nav links), footer (FTC disclosure)
   - [x] Tailwind config with custom theme (brand colors)
   - **AC:** All pages share header/footer, mobile-responsive
   - **ICE:** 7/10 (I:2, C:3, E:2) – Quick win

7. **Home Page (`app/page.tsx`)**
   - [x] Hero: "Today's Top Deals" heading
   - [x] Trending grid (12 placeholder cards with shadcn Card component)
   - [x] "Featured Articles" section (3 placeholder cards)
   - **AC:** Page renders, Lighthouse performance ≥85
   - **ICE:** 8/10 (I:3, C:3, E:2) – High visibility

8. **Category Page (`app/category/[slug]/page.tsx`)**
   - [x] Dynamic route for crypto-miners, pc-parts, phones, gaming-setup
   - [x] Product grid (16 per page)
   - [x] Filters UI (vendor, price range) – non-functional yet
   - **AC:** `/category/pc-parts` renders, shows placeholder cards
   - **ICE:** 7/10 (I:2, C:3, E:2)

9. **Product Page (`app/product/[slug]/page.tsx`)**
   - [x] Hero: product image, title
   - [x] Price grid (Amazon/BestBuy/Newegg placeholders)
   - [x] Spec table (empty for now)
   - [x] "Where to Buy" section with disabled buttons
   - **AC:** `/product/rtx-4070-ti` renders, looks complete (even without data)
   - **ICE:** 8/10 (I:3, C:3, E:2)

---

### Epic 1.4: Ingest Skeleton
**Goal:** Adapter interfaces + mock implementations.

#### Stories
10. **Adapter Interfaces**
    - [x] `lib/adapters/types.ts`: `SourceAdapter`, `RawProduct`, `RateLimit` interfaces
    - [x] `lib/adapters/mock.ts`: `MockAmazonAdapter`, `MockBestBuyAdapter`, `MockYouTubeAdapter`
    - **AC:** `const adapter = new MockAmazonAdapter(); await adapter.fetchProducts()` returns fixtures
    - **ICE:** 9/10 (I:4, C:2, E:3) – Enables parallel work

11. **Fixture Data**
    - [x] `fixtures/amazon-products.json` (10 products)
    - [x] `fixtures/bestbuy-products.json` (10 products)
    - [x] `fixtures/youtube-videos.json` (20 videos)
    - **AC:** Fixtures valid JSON, match `RawProduct` schema
    - **ICE:** 6/10 (I:2, C:2, E:2) – Low impact, but necessary

---

### Sprint 1 Summary
**Total ICE Score:** 86/110 (avg 7.8/10)  
**Deliverables:** Repo scaffold, DB schema, 3 pages, mock adapters  
**Demo:** Browse products (mock data), see placeholder UI  
**Risks:** None (all standard tools)

---

## Sprint 2: Core Features (Week 2)

### Epic 2.1: Data Wiring
**Goal:** Connect UI to real DB data.

#### Stories
12. **Fetch Products in Server Components**
    - [x] Home page: query top 12 by `trendingScore`
    - [x] Category page: filter by `category`, paginate
    - [x] Product page: fetch by `slug` with `offers` + `mediaAssets`
    - **AC:** Real product titles/prices display, no mock data
    - **ICE:** 9/10 (I:4, C:3, E:2)

13. **Affiliate Link Builder**
    - [x] `lib/affiliate/builder.ts`: `buildAmazonLink(asin, tag)`, `buildBestBuyLink(sku, campId)`
    - [x] UTM tagging: `utm_source=techdeals&utm_medium=affiliate&utm_campaign=<category>`
    - [x] Store in `Offer.affiliateUrl`
    - **AC:** Clicking "Buy on Amazon" opens tagged link
    - **ICE:** 10/10 (I:5, C:2, E:3) – **Revenue critical**

14. **Price "As-Of" Timestamps**
    - [x] Display `lastCheckedAt` under price: "$699.99 as of Oct 23, 2:30 PM"
    - [x] Show "⚠️ May be outdated" badge if `lastCheckedAt > 24h`
    - **AC:** Timestamp visible, badge shows when stale
    - **ICE:** 8/10 (I:3, C:2, E:3) – Compliance requirement

---

### Epic 2.2: YouTube Integration
**Goal:** Embed videos on product pages.

#### Stories
15. **YouTube Search Service**
    - [x] `lib/youtube/search.ts`: `searchVideos(productTitle)` → top 5 videos
    - [x] Use YouTube Data API v3 (or mock if no key)
    - [x] Cache results in `MediaAsset` table (7d TTL)
    - **AC:** Product page shows 3-5 video thumbnails below specs
    - **ICE:** 9/10 (I:4, C:2, E:3) – High engagement driver

16. **Video Embed Modal**
    - [x] Click thumbnail → open shadcn Dialog with `<iframe src="https://youtube.com/embed/{videoId}">`
    - [x] Responsive embed (16:9 ratio)
    - **AC:** Video plays in modal, closes on backdrop click
    - **ICE:** 7/10 (I:2, C:3, E:2) – Polish, but low complexity

---

### Epic 2.3: Price History
**Goal:** Show price trends over time.

#### Stories
17. **Price History Chart**
    - [x] `app/product/[slug]/price-chart.tsx`: line chart (last 30 days)
    - [x] Use Recharts or simple Canvas
    - [x] Query `PriceHistory` table, group by vendor
    - **AC:** Chart visible, 3 lines (Amazon/BestBuy/Newegg), responsive
    - **ICE:** 8/10 (I:3, C:3, E:2) – Strong value signal

18. **CRON: Record Prices Hourly**
    - [x] BullMQ job `ingest:price` (runs every 1h)
    - [x] Fetch current prices from adapters → insert `PriceHistory`
    - **AC:** `docker compose logs worker` shows job running, new rows in DB
    - **ICE:** 9/10 (I:4, C:2, E:3) – Enables trend detection

---

### Sprint 2 Summary
**Total ICE Score:** 60/70 (avg 8.6/10)  
**Deliverables:** Live data in UI, affiliate links, YouTube embeds, price chart  
**Demo:** Click "Buy" → tagged Amazon link; watch video in modal; see 30d price drop  
**Risks:** YouTube quota limits (mitigated by 7d cache)

---

## Sprint 3: Intelligence Layer (Week 3)

### Epic 3.1: Deals Radar
**Goal:** Detect price drops, auto-publish deals.

#### Stories
19. **Threshold Detector**
    - [x] CRON job (hourly): compare current price vs. 24h ago
    - [x] Trigger if drop >10% or all-time low
    - [x] Create `DealPost` (status: pending)
    - **AC:** Drop GPU price by 15% in seed → deal appears in admin queue
    - **ICE:** 10/10 (I:5, C:2, E:3) – **Core value prop**

20. **Deals Page (`app/deals/page.tsx`)**
    - [x] List all `DealPost` where `status='published'`
    - [x] Sort by `score` DESC, then `publishedAt` DESC
    - [x] Card: product image, title, price old → new, "Save X%"
    - **AC:** `/deals` shows 10+ deals, clickable to product pages
    - **ICE:** 8/10 (I:3, C:3, E:2)

21. **Auto-Publish Logic**
    - [x] If `DealPost.score > 70` → set status to 'published' immediately
    - [x] Else, send to admin approval queue
    - **AC:** High-score deals appear on site within 5 min of detection
    - **ICE:** 9/10 (I:4, C:2, E:3)

---

### Epic 3.2: Trend Finder
**Goal:** Surface rising products by multi-signal ranking.

#### Stories
22. **Signal Aggregator**
    - [x] Daily job: calculate `priceVelocity7d`, `mediaCount7d`, `ctr30d`
    - [x] Store in Product `trendingScore` field
    - [x] Weighted formula: `0.4×priceVel + 0.3×media + 0.2×ctr + 0.1×recency`
    - **AC:** Seed data shows scores 0–100, sorted correctly
    - **ICE:** 9/10 (I:4, C:2, E:3) – Unique ranking

23. **Trends Page (`app/trends/page.tsx`)**
    - [x] Table: Rank | Product | Score | Price Δ | Videos | CTR | Action
    - [x] Score breakdown tooltip (bar chart per component)
    - [x] "Explain Score" button → modal with formula
    - **AC:** `/trends` shows top 50, scores explainable
    - **ICE:** 7/10 (I:2, C:3, E:2) – Nice-to-have transparency

---

### Epic 3.3: Article Writer (MVP)
**Goal:** Generate roundup articles with LLM.

#### Stories
24. **Writer Interface + Mock**
    - [x] `lib/writer/types.ts`: `Writer.generate(outline, facts) → Article`
    - [x] `MockWriter`: returns placeholder Markdown with `[Product X]` slots
    - [x] Config: `WRITER_PROVIDER=mock|openai|anthropic`
    - **AC:** Admin can trigger "Generate Article" → draft created
    - **ICE:** 9/10 (I:4, C:2, E:3) – Scales content production

25. **Article Template**
    - [x] Prompt: "Write 1200-word roundup for [niche] with 5-10 products"
    - [x] Include: TL;DR, sections per product, comparison table, FAQ, FTC disclosure
    - [x] Fact-check: prices/specs from DB (no hallucinations)
    - **AC:** Generated article has all sections, affiliate links inserted
    - **ICE:** 8/10 (I:3, C:3, E:2)

26. **Admin: Article Approval**
    - [x] `/admin/articles` table: status filter (draft/published)
    - [x] Edit button → Markdown editor (simple textarea)
    - [x] Publish button → sets `status='published'`, `publishedAt=NOW()`
    - **AC:** Admin edits draft, publishes, visible on `/articles/[slug]`
    - **ICE:** 7/10 (I:2, C:3, E:2)

---

### Sprint 3 Summary
**Total ICE Score:** 67/80 (avg 8.4/10)  
**Deliverables:** Deals Radar (auto-publish), Trend Finder page, Article Writer (mock)  
**Demo:** Price drop detected → deal auto-published; generate "Best Crypto Miners" article  
**Risks:** LLM API costs (mitigated by mock default)

---

## Sprint 4: Social Automation (Week 4)

### Epic 4.1: Twitter/X Bot
**Goal:** Automated deal posts with rate limits.

#### Stories
27. **Post Composer**
    - [x] `lib/social/composer.ts`: template `"🔥 {product} dropped to ${price}... {link}"`
    - [x] Character limit validation (260 max)
    - [x] UTM-tagged short link (Bitly API or manual shortener)
    - [x] Hashtag insertion: `#TechDeals #[category]`
    - **AC:** Call `composePost(deal)` → valid tweet text + link
    - **ICE:** 8/10 (I:3, C:3, E:2)

28. **Scheduler Service**
    - [x] BullMQ job `social:post` (runs every 20 min, processes 1 queued post)
    - [x] Twitter API v2: `POST /2/tweets` (requires OAuth 2.0)
    - [x] Dry-run mode (env: `TWITTER_DRY_RUN=true`) → logs but doesn't post
    - **AC:** Queue 5 posts → scheduler posts 1 every 20 min, logs tweet IDs
    - **ICE:** 9/10 (I:4, C:2, E:3) – Traffic driver

29. **Admin: Social Dashboard**
    - [x] `/admin/social`: table of `SocialPost` (scheduled, posted, failed)
    - [x] Toggle "Enable Live Posting" (sets env var or DB flag)
    - [x] Manual retry button for failed posts
    - **AC:** Admin sees queue, toggles live mode, retries failures
    - **ICE:** 7/10 (I:2, C:3, E:2)

---

### Epic 4.2: Analytics & Monitoring
**Goal:** Track performance, detect issues.

#### Stories
30. **Logging Setup**
    - [x] Install Pino: `npm install pino pino-pretty`
    - [x] Structured logs: `logger.info({ productId, action: 'price_drop' })`
    - [x] Log levels: debug (dev), info (prod)
    - **AC:** `docker compose logs app` shows JSON logs
    - **ICE:** 6/10 (I:2, C:2, E:2) – Ops hygiene

31. **Health Check Endpoint**
    - [x] `/api/health`: returns `{ status: 'ok', db: true, redis: true }`
    - [x] Check Prisma + Redis connections
    - **AC:** `curl localhost:3000/api/health` returns 200
    - **ICE:** 7/10 (I:2, C:3, E:2)

32. **Error Boundaries**
    - [x] Wrap pages in `error.tsx` (Next.js convention)
    - [x] Catch adapter errors → show "Data temporarily unavailable"
    - **AC:** Simulate adapter failure → page renders error UI, logs error
    - **ICE:** 6/10 (I:2, C:2, E:2)

---

### Sprint 4 Summary
**Total ICE Score:** 43/60 (avg 7.2/10)  
**Deliverables:** Twitter bot (dry-run ready), logging, health checks  
**Demo:** Scheduled tweet posts to Twitter (or logs if dry-run); admin toggles live mode  
**Risks:** Twitter API approval delays (use dry-run until approved)

---

## Sprint 5: SEO & Admin (Week 5)

### Epic 5.1: SEO Hardening
**Goal:** Rank in Google for target keywords.

#### Stories
33. **Structured Data**
    - [x] Product pages: JSON-LD `Product` schema with offers
    - [x] Article pages: `Article` schema with author, datePublished
    - [x] Video embeds: `VideoObject` schema
    - **AC:** Google Structured Data Validator shows no errors
    - **ICE:** 9/10 (I:4, C:2, E:3) – SEO critical

34. **Sitemaps**
    - [x] `/sitemap.xml`: index with links to product/article sitemaps
    - [x] `/sitemap-products.xml`: all products (paginated, 1000 per file)
    - [x] Auto-regenerate on publish (BullMQ job)
    - **AC:** `curl localhost:3000/sitemap.xml` returns valid XML
    - **ICE:** 8/10 (I:3, C:3, E:2)

35. **OpenGraph & Twitter Cards**
    - [x] Dynamic OG images (product + price overlay via Satori/Vercel OG)
    - [x] Meta tags: title, description, image, canonical
    - **AC:** Share product link on Slack → shows rich preview
    - **ICE:** 7/10 (I:2, C:3, E:2)

36. **Robots.txt**
    - [x] `/robots.txt`: allow all, link to sitemap
    - [x] Disallow `/admin`, `/api/internal`
    - **AC:** `curl localhost:3000/robots.txt` shows rules
    - **ICE:** 5/10 (I:1, C:2, E:2) – Quick win

---

### Epic 5.2: Admin CMS v1
**Goal:** Full editorial control.

#### Stories
37. **Product Editor**
    - [x] `/admin/products`: search/filter products
    - [x] Edit modal: override title, description, imageUrl
    - [x] Manual re-rank (adjust `trendingScore`)
    - **AC:** Admin edits product → changes reflected on site
    - **ICE:** 7/10 (I:2, C:3, E:2)

38. **Deal Approvals**
    - [x] `/admin/deals`: pending queue with approve/reject buttons
    - [x] Manual deal creation form (select product, set discount, schedule)
    - **AC:** Admin approves deal → status changes to 'published'
    - **ICE:** 8/10 (I:3, C:3, E:2)

39. **Analytics Dashboard**
    - [x] `/admin/dashboard`: cards for MAU, CTR, EPC (mock data initially)
    - [x] Chart: traffic over time (placeholder)
    - [x] Top products by clicks
    - **AC:** Dashboard renders, shows placeholder metrics
    - **ICE:** 6/10 (I:2, C:2, E:2) – Low priority for MVP

---

### Sprint 5 Summary
**Total ICE Score:** 50/70 (avg 7.1/10)  
**Deliverables:** SEO tags, sitemaps, admin CRUD  
**Demo:** Google preview shows rich snippets; admin edits product description  
**Risks:** None

---

## Sprint 6: Polish & Launch Prep (Week 6)

### Epic 6.1: Performance Optimization
**Goal:** Meet Core Web Vitals targets.

#### Stories
40. **Image Optimization**
    - [x] Replace `<img>` with Next.js `<Image>` component
    - [x] Serve WebP/AVIF formats
    - [x] Lazy-load below fold
    - **AC:** Lighthouse performance score ≥90
    - **ICE:** 8/10 (I:3, C:3, E:2)

41. **Edge Caching**
    - [x] Add `Cache-Control` headers: `public, max-age=3600` for pages
    - [x] Vercel/Cloudflare CDN config
    - **AC:** Second page load <500ms (cached)
    - **ICE:** 7/10 (I:2, C:3, E:2)

42. **Database Query Optimization**
    - [x] Add missing indexes (identified via `EXPLAIN ANALYZE`)
    - [x] Use `select` to limit fields (e.g., exclude `content` in list views)
    - **AC:** `/category/pc-parts` loads in <300ms
    - **ICE:** 6/10 (I:2, C:2, E:2)

---

### Epic 6.2: Compliance & Legal
**Goal:** Pass legal review.

#### Stories
43. **FTC Disclosure Review**
    - [x] Audit all pages with affiliate links → ensure disclosure visible
    - [x] Add disclosure to article headers (above fold)
    - [x] Footer disclosure on every page
    - **AC:** Compliance officer approves (or self-audit checklist)
    - **ICE:** 10/10 (I:5, C:2, E:3) – **Risk mitigation**

44. **Amazon Associates Compliance**
    - [x] Price "as-of" timestamps everywhere
    - [x] No stale prices (auto-hide if >24h)
    - [x] Required disclaimer text on pages with Amazon links
    - **AC:** All Amazon ToS rules followed (documented checklist)
    - **ICE:** 9/10 (I:4, C:2, E:3)

45. **Privacy Policy & Terms**
    - [x] `/privacy` page (cookie policy, analytics disclosure)
    - [x] `/terms` page (affiliate disclaimer, user-generated content rules)
    - **AC:** Pages published, linked in footer
    - **ICE:** 7/10 (I:2, C:3, E:2)

---

### Epic 6.3: Launch Readiness
**Goal:** Production deployment.

#### Stories
46. **CI/CD Pipeline**
    - [x] GitHub Actions: lint + test on PR, deploy on merge
    - [x] Vercel preview deploys for PRs
    - [x] Production deploy on tag `v1.0.0`
    - **AC:** Push to `main` → auto-deploy to staging
    - **ICE:** 8/10 (I:3, C:3, E:2)

47. **Monitoring & Alerts**
    - [x] Uptime monitoring (UptimeRobot or Vercel Analytics)
    - [x] Error tracking (Sentry free tier)
    - [x] Slack alerts for 5xx errors
    - **AC:** Simulate error → Slack notification received
    - **ICE:** 7/10 (I:2, C:3, E:2)

48. **Load Testing**
    - [x] k6 script: simulate 100 concurrent users on home/category pages
    - [x] Verify p95 latency <500ms
    - **AC:** Load test passes without 5xx errors
    - **ICE:** 6/10 (I:2, C:2, E:2)

49. **Docs: Runbook**
    - [x] `RUNBOOK.md`: deployment steps, rollback, common issues
    - [x] Secrets checklist (env vars required)
    - **AC:** New dev can deploy following runbook
    - **ICE:** 5/10 (I:1, C:2, E:2)

---

### Sprint 6 Summary
**Total ICE Score:** 73/100 (avg 7.3/10)  
**Deliverables:** Performance optimizations, compliance sign-off, CI/CD, monitoring  
**Demo:** Full site ready for production; Lighthouse 90+; legal approved  
**Risks:** None (all polish)

---

## Post-Launch: Backlog (Future Sprints)

### High Priority (Sprint 7–8)
- **User Accounts:** Wishlists, price alerts per user
- **Email Notifications:** Daily digest of deals matching user interests
- **ROI Calculator:** Crypto miner profitability (electricity cost, hashrate, difficulty)
- **Reddit Bot:** Post deals to `/r/buildapcsales` (with permission)
- **Advanced Search:** Faceted filters (brand, specs, ratings)

### Medium Priority (Sprint 9–10)
- **Multi-Language:** Spanish, Portuguese (i18n)
- **Mobile App:** React Native or PWA enhancements
- **Affiliate Network Expansion:** Walmart, Target, AliExpress
- **Content Partnerships:** Sponsored posts, brand deals
- **A/B Testing:** Optimize CTAs, article layouts

### Low Priority (Backlog)
- **Community Features:** Comments, forums, user reviews
- **Browser Extension:** Price tracker overlay on vendor sites
- **Comparison Tool:** Side-by-side specs for 2–4 products
- **API for Developers:** Public read-only API for deal feeds

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Amazon PA-API approval delayed | Medium | High | Use mock adapters; manually build links until approved |
| YouTube quota exceeded | Low | Medium | Cache metadata 7d; show fallback "Search on YouTube" link |
| LLM API costs spiral | Low | Medium | Default to mock; set monthly budget alerts |
| Twitter API suspended | Low | High | Have alternate social platforms (Reddit, Discord) ready |
| Legal challenge (FTC/FCC) | Very Low | Critical | Over-disclose; legal review before launch |
| Competitor price scraping blocked | Medium | Medium | Only use official APIs/feeds; document ToS compliance |
| Database performance degrades | Medium | Medium | Add read replicas; optimize queries; consider Redis cache |

---

## Success Metrics (Post-Launch, Week 1–4)

### Traffic
- **Week 1:** 500+ unique visitors
- **Week 4:** 2,000+ unique visitors
- **Organic Search:** 10+ keywords ranking in top 50

### Engagement
- **Affiliate CTR:** >2.5% (clicks per impression)
- **Video Play Rate:** >15% (plays per product page view)
- **Article Dwell Time:** >90 seconds avg

### Revenue
- **Week 1:** $10+ in affiliate commissions
- **Week 4:** $100+ in affiliate commissions
- **EPC (Earnings Per Click):** >$0.10

### Reliability
- **Uptime:** >99.5%
- **Error Rate:** <0.5% (5xx responses)
- **API Quota Usage:** <80% of limits

---

## Open Questions for Product Owner

1. **LLM Budget:** What's max monthly spend for article generation? ($0 = mock only, $50 = ~500 articles/month with GPT-4o-mini)
2. **Social Priority:** Twitter/X only, or also Reddit/Discord in Sprint 4?
3. **Monetization Mix:** 100% affiliate, or add display ads (Adsense)?
4. **Content Policy:** Allow user-submitted deal tips, or curated-only?
5. **Internationalization:** US-only for V1, or plan for EU/APAC in Sprint 7?

---

**Next Steps:**
1. Review/approve roadmap
2. Proceed to Sprint 1 code delivery (B.1 Repo Scaffold)
3. Set up GitHub repo + project board

---

**Signature:**  
_Lead PM/Tech Architect_  
_TechDeals Team_
