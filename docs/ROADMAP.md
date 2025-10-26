# Product Roadmap
## TechDeals Platform

**Version:** 1.0  
**Last Updated:** 2025-10-23  
**Planning Horizon:** 6 months (Sprint 0 → Sprint 12)

---

## EPIC OVERVIEW (ICE Scores)

| Epic | Impact | Cost | Exploitability | ICE Score | Priority |
|------|--------|------|----------------|-----------|----------|
| **E1: Foundation** | 10 | 3 | 10 | 33.3 | P0 |
| **E2: Deal Aggregation** | 9 | 5 | 9 | 16.2 | P0 |
| **E3: Media Integration** | 8 | 4 | 8 | 16.0 | P0 |
| **E4: Article Writer** | 9 | 6 | 7 | 10.5 | P1 |
| **E5: Trend Finder** | 7 | 5 | 8 | 11.2 | P1 |
| **E6: Social Automation** | 6 | 4 | 7 | 10.5 | P2 |
| **E7: Admin CMS** | 5 | 3 | 9 | 15.0 | P2 |
| **E8: SEO & Analytics** | 8 | 4 | 9 | 18.0 | P1 |

**ICE Formula:** Impact × Exploitability / Cost

---

## SPRINT 0: Documentation (COMPLETE ✅)
**Duration:** 1 day  
**Goal:** Define product, architecture, data models

### Stories
- [x] S0.1: Write PRD.md with vision, metrics, features
- [x] S0.2: Document system architecture (adapters, pipeline, services)
- [x] S0.3: Define data models (Prisma schema)
- [x] S0.4: Create roadmap with ICE scores
- [x] S0.5: Plan test strategy

**Deliverables:**
- ✅ PRD.md (19kb)
- ✅ ARCHITECTURE.md (26kb)
- ✅ DATA_MODELS.md (21kb)
- ✅ ROADMAP.md (this file)
- ✅ TEST_STRATEGY.md

---

## SPRINT 1: MVP Foundation (2 weeks)
**Goal:** Repo setup + database + basic web app

### E1: Foundation Infrastructure
**ICE:** 33.3 (Impact: 10 / Cost: 3 / Exploit: 10)  
**Why:** Unblocks all other work; proven stack

#### Stories
- [ ] **S1.1:** Initialize Next.js 14 monorepo with TypeScript
  - **AC:** `npx create-next-app` succeeds; dev server runs
  - **Estimate:** 2 points
  
- [ ] **S1.2:** Setup Prisma with PostgreSQL
  - **AC:** Schema deployed; migrations work; Prisma Studio accessible
  - **Estimate:** 3 points
  
- [ ] **S1.3:** Seed database with 10 products, 20 deals
  - **AC:** `npx prisma db seed` populates all models
  - **Estimate:** 3 points
  
- [ ] **S1.4:** Configure Tailwind + shadcn/ui
  - **AC:** Components render; dark mode works
  - **Estimate:** 2 points
  
- [ ] **S1.5:** Setup Redis + BullMQ
  - **AC:** Job queue processes test job; Redis cache works
  - **Estimate:** 3 points

**Total:** 13 points (~1 week for 2 developers)

---

### E2: Deal Aggregation (Partial)
**ICE:** 16.2  
**Why:** Core business value; monetization foundation

#### Stories
- [ ] **S1.6:** Create adapter interface + Amazon mock adapter
  - **AC:** `AmazonAdapter.fetchProducts()` returns mock data
  - **Estimate:** 5 points
  
- [ ] **S1.7:** Build ingest pipeline (deduper + enricher)
  - **AC:** Duplicate products rejected; price history tracked
  - **Estimate:** 5 points
  
- [ ] **S1.8:** Implement affiliate link generator
  - **AC:** `generateAffiliateLink()` adds correct UTM params
  - **Estimate:** 3 points

**Total:** 13 points

---

### E8: Basic Web Pages
**ICE:** 18.0  
**Why:** Need UI to validate backend; SEO critical

#### Stories
- [ ] **S1.9:** Homepage (deal grid + category filters)
  - **AC:** Shows 20 deals; filter by category works; responsive
  - **Estimate:** 5 points
  
- [ ] **S1.10:** Deal detail page (product info + price + "as-of")
  - **AC:** `/deals/[id]` shows product, price, timestamp, affiliate link
  - **Estimate:** 3 points
  
- [ ] **S1.11:** FTC disclosure component (reusable)
  - **AC:** Footer banner appears on all pages with affiliate links
  - **Estimate:** 2 points

**Total:** 10 points

**Sprint 1 Total:** 36 points (~2 weeks)

---

## SPRINT 2: Media & Price Tracking (2 weeks)
**Goal:** YouTube embeds + price history + trends v0

### E3: Media Integration
**ICE:** 16.0  
**Why:** Differentiator; user engagement; SEO (VideoObject schema)

#### Stories
- [ ] **S2.1:** YouTube Data API adapter (search by product name)
  - **AC:** `YouTubeAdapter.searchVideos()` returns 5 videos
  - **Estimate:** 5 points
  
- [ ] **S2.2:** Video embed component (responsive player)
  - **AC:** Videos play inline; mobile-optimized; lazy load
  - **Estimate:** 3 points
  
- [ ] **S2.3:** Cache video metadata in Redis (24h TTL)
  - **AC:** Second request for same product returns cached videos
  - **Estimate:** 2 points
  
- [ ] **S2.4:** Add videos to deal detail page
  - **AC:** Deal page shows 3 relevant YouTube videos
  - **Estimate:** 2 points

**Total:** 12 points

---

### E5: Trend Finder (v0)
**ICE:** 11.2  
**Why:** Discovery feature; drives repeat visits; SEO long-tail

#### Stories
- [ ] **S2.5:** Price history tracking (CRON job)
  - **AC:** Hourly job compares current vs. last price; creates Trend record
  - **Estimate:** 5 points
  
- [ ] **S2.6:** Trend scoring algorithm (v0: price drop only)
  - **AC:** Products with >10% price drop get trend_score > 0.5
  - **Estimate:** 3 points
  
- [ ] **S2.7:** Trends page UI (list + filters)
  - **AC:** `/trends` shows top 20 trending products; filter by signal type
  - **Estimate:** 5 points

**Total:** 13 points

---

### E2: Deal Aggregation (Complete)
#### Stories
- [ ] **S2.8:** Best Buy API adapter
  - **AC:** Fetches products; normalizes to Product model
  - **Estimate:** 5 points
  
- [ ] **S2.9:** Newegg feed parser (RSS/XML)
  - **AC:** Parses feed; creates Deal records
  - **Estimate:** 5 points
  
- [ ] **S2.10:** Link validation service (check HTTP 200)
  - **AC:** Dead links marked inactive within 1 hour
  - **Estimate:** 3 points

**Total:** 13 points

**Sprint 2 Total:** 38 points (~2 weeks)

---

## SPRINT 3: Article Writer + Deals Radar (2 weeks)
**Goal:** AI content generation + price watch alerts

### E4: Article Writer
**ICE:** 10.5  
**Why:** SEO content at scale; affiliate link multiplier

#### Stories
- [ ] **S3.1:** LLM provider interface (OpenAI/Anthropic/mock)
  - **AC:** `LLMProvider.complete()` returns text; swap providers via config
  - **Estimate:** 5 points
  
- [ ] **S3.2:** Article generator service (prompt + products → markdown)
  - **AC:** Generate 1500-word article with 7 product links
  - **Estimate:** 8 points
  
- [ ] **S3.3:** Article approval queue (admin CMS v0)
  - **AC:** Admin can view draft articles; approve/reject with 1-click
  - **Estimate:** 5 points
  
- [ ] **S3.4:** Article detail page (markdown renderer + SEO)
  - **AC:** `/articles/[slug]` renders content; OpenGraph tags present
  - **Estimate:** 3 points

**Total:** 21 points

---

### E5: Deals Radar
**ICE:** 11.2 (shared with Trend Finder)  
**Why:** User retention; viral potential (tell-a-friend)

#### Stories
- [ ] **S3.5:** PriceWatch model + API (create/list)
  - **AC:** `POST /api/price-watch` creates watch; validates email
  - **Estimate:** 3 points
  
- [ ] **S3.6:** Price watcher CRON job (hourly check)
  - **AC:** Compares target price vs. current; triggers notification
  - **Estimate:** 5 points
  
- [ ] **S3.7:** Email notification service (SendGrid/Resend)
  - **AC:** User receives email when price drops below target
  - **Estimate:** 5 points
  
- [ ] **S3.8:** "Watch This Deal" button on deal pages
  - **AC:** Modal opens; user enters email + target price; watch created
  - **Estimate:** 3 points

**Total:** 16 points

**Sprint 3 Total:** 37 points (~2 weeks)

---

## SPRINT 4: Social Automation + SEO (2 weeks)
**Goal:** Twitter bot + sitemaps + structured data

### E6: Social Automation
**ICE:** 10.5  
**Why:** Traffic driver; brand awareness; viral potential

#### Stories
- [ ] **S4.1:** Twitter API integration (v2 client)
  - **AC:** `twitterClient.tweet()` posts to account
  - **Estimate:** 5 points
  
- [ ] **S4.2:** Social post composer (template + short link)
  - **AC:** DealPost → formatted tweet with UTM link
  - **Estimate:** 3 points
  
- [ ] **S4.3:** Social post scheduler (BullMQ worker + rate limit)
  - **AC:** Max 10 posts/hour; queued posts auto-post at scheduled time
  - **Estimate:** 5 points
  
- [ ] **S4.4:** Admin social queue UI (calendar view)
  - **AC:** Admin sees queued posts; can edit/delete; preview tweet
  - **Estimate:** 5 points

**Total:** 18 points

---

### E8: SEO Optimization
**ICE:** 18.0  
**Why:** Organic traffic = free acquisition; long-term moat

#### Stories
- [ ] **S4.5:** Sitemap.xml generation (dynamic)
  - **AC:** `/sitemap.xml` lists all products, deals, articles
  - **Estimate:** 3 points
  
- [ ] **S4.6:** Structured data (Product, Offer, Article schemas)
  - **AC:** Google Rich Results Test shows 0 errors
  - **Estimate:** 5 points
  
- [ ] **S4.7:** OpenGraph + Twitter Card meta tags
  - **AC:** Share on Twitter → Rich preview appears
  - **Estimate:** 2 points
  
- [ ] **S4.8:** Performance audit (Core Web Vitals)
  - **AC:** Lighthouse score ≥90 (mobile); LCP <2.5s
  - **Estimate:** 5 points

**Total:** 15 points

**Sprint 4 Total:** 33 points (~2 weeks)

---

## SPRINT 5-6: Admin CMS + Analytics (3 weeks)
**Goal:** Full admin interface + observability

### E7: Admin CMS (Complete)
**ICE:** 15.0  
**Why:** Operations efficiency; content quality control

#### Stories
- [ ] **S5.1:** Auth system (NextAuth.js with magic links)
- [ ] **S5.2:** Deal moderation (approve/reject/hide)
- [ ] **S5.3:** Manual deal entry form
- [ ] **S5.4:** Article editor (markdown + preview)
- [ ] **S5.5:** Analytics dashboard (CTR, EPC, top products)

**Total:** ~25 points

---

### E8: Analytics & Monitoring
#### Stories
- [ ] **S6.1:** Plausible/GA4 integration
- [ ] **S6.2:** Sentry error tracking
- [ ] **S6.3:** Prometheus metrics + Grafana dashboard
- [ ] **S6.4:** Alerting (PagerDuty for P0/P1)

**Total:** ~15 points

**Sprint 5-6 Total:** 40 points (~3 weeks)

---

## SPRINT 7-12: Enhancements (12 weeks)
**Post-MVP Features** (Prioritize based on user feedback)

### V1 Roadmap
- [ ] User accounts (saved deals, preferences)
- [ ] Comment system (moderated)
- [ ] Advanced search (Typesense/Meilisearch)
- [ ] Browser extension (price overlay)
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Affiliate performance dashboard
- [ ] A/B testing framework

---

## RELEASE MILESTONES

### Alpha (Sprint 3 Complete)
- Internal team testing
- 100+ deals, 10+ articles
- Invite-only access

### Beta (Sprint 4 Complete)
- 500+ deals, 50+ articles
- Public URL live
- Amazon Associates approved
- Twitter bot active
- 100 beta testers

### V1.0 Launch (Sprint 6 Complete)
- 1000+ deals, 100+ articles
- Full SEO optimization
- Admin CMS operational
- Press release + Product Hunt launch
- Target: 10k visitors in month 1

---

## RISK MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Amazon PA-API approval delayed** | High | High | Use mock adapter; scrape fallback |
| **LLM costs exceed budget** | Medium | Medium | Provider-agnostic; cache aggressively |
| **Twitter API access revoked** | Low | Medium | Dry-run mode; email alerts backup |
| **Database scaling issues** | Low | High | Connection pooling; read replicas |
| **Content quality poor** | Medium | High | Human review queue; A/B test articles |

---

## SUCCESS METRICS

### Sprint 1-2 (MVP)
- [ ] Deploy to production (Vercel)
- [ ] 500+ deals indexed
- [ ] Lighthouse score ≥85
- [ ] 0 critical bugs

### Sprint 3-4 (MMP)
- [ ] Amazon Associates approval
- [ ] First affiliate commission
- [ ] 1000+ visitors
- [ ] 50+ price watches created

### Sprint 5-6 (V1)
- [ ] 10k+ monthly visitors
- [ ] $500+ monthly revenue
- [ ] 100+ articles published
- [ ] Twitter: 500+ followers

---

**Document Status:** ✅ Approved for Sprint 0  
**Next Review:** End of Sprint 2  
**Owner:** Product Team  
**Last Updated:** 2025-10-23
