# 🧪 TechDeals Release Candidate - QA Checklist

**Version:** RC-1.0  
**Date:** 2025-10-26  
**Status:** Pre-Launch

---

## ✅ CRASH RECOVERY VERIFICATION

- [ ] `git status` shows clean working tree (or known changes)
- [ ] `git fsck --full` reports no errors
- [ ] `pnpm install` completes successfully
- [ ] `pnpm prisma generate` succeeds
- [ ] `prisma/dev.db` exists (or PostgreSQL connected)
- [ ] Database has 50+ products: `SELECT COUNT(*) FROM Product` → 50+
- [ ] Database has 100+ deals: `SELECT COUNT(*) FROM Deal` → 100+
- [ ] `pnpm dev` starts without crashes
- [ ] `curl http://localhost:3000` returns HTML (200 OK)
- [ ] `curl http://localhost:3000/api/health` returns `{"status":"ok"}`

---

## 🏠 HOMEPAGE

- [ ] Page loads in <2.5s (LCP)
- [ ] "Trending Now" section shows 10+ product cards
- [ ] Product cards have:
  - [ ] Product image (not broken)
  - [ ] Title
  - [ ] Price with "as of [timestamp]"
  - [ ] At least 1 affiliate link button
  - [ ] Discount badge (if applicable)
- [ ] "New Drops" section shows recent products
- [ ] "Featured Articles" section shows article cards
- [ ] Footer contains FTC disclosure
- [ ] Navigation links work (Categories, Deals, Trends, Articles)
- [ ] Responsive on mobile (viewport <768px)

---

## 📦 CATEGORY PAGES

### `/category/crypto-miners`
- [ ] Shows 10+ products
- [ ] Filter by vendor works (Amazon/BestBuy/Newegg)
- [ ] Sort by price works (low to high, high to low)
- [ ] Pagination works (if >20 products)
- [ ] Each product card clickable → goes to product page

### `/category/pc-parts`
- [ ] Shows 10+ products
- [ ] Subcategory filter works (GPU, CPU, RAM, Storage)

### `/category/phones`
- [ ] Shows 10+ products

### `/category/gaming-setup`
- [ ] Shows 10+ products

---

## 🎯 PRODUCT PAGES

### Example: `/product/[slug]`
Pick 3 random products and verify:

- [ ] Product title and description display
- [ ] Hero image loads (not 404)
- [ ] Price grid shows 2-3 vendors (Amazon/BestBuy/Newegg)
- [ ] Each price has "as of [timestamp]" (within 24h)
- [ ] Stale prices (>24h) show warning badge OR hidden
- [ ] "Where to Buy" buttons have affiliate links with UTM tags
- [ ] Affiliate links open in new tab (target="_blank")
- [ ] Spec table displays (parsed from JSON)
- [ ] Video strip shows 2-3 YouTube thumbnails
- [ ] Clicking video thumbnail opens modal/embed
- [ ] Video plays in modal
- [ ] Price history chart renders (last 30 days)
- [ ] Chart shows multiple vendor lines (different colors)
- [ ] No JavaScript errors in console

---

## 📝 ARTICLES

### `/articles`
- [ ] Shows list of 2+ articles
- [ ] Article cards have title, excerpt, date
- [ ] Clicking card → goes to article detail page

### `/article/best-budget-crypto-miners-2025`
- [ ] Page loads
- [ ] FTC disclosure visible above-the-fold
- [ ] Markdown content renders (headings, lists, links)
- [ ] 5-10 product affiliate links present
- [ ] Affiliate links have UTM tags
- [ ] Links open in new tab
- [ ] No broken images
- [ ] Table of contents works (if implemented)

---

## 📈 DEALS PAGE

### `/deals`
- [ ] Shows list of active deals
- [ ] Sorted by deal score (highest first)
- [ ] Each deal card shows:
  - [ ] Product title
  - [ ] Old price → New price
  - [ ] Discount percentage
  - [ ] "Save $X" badge
- [ ] Clicking deal → goes to product page
- [ ] Filter by category works

---

## 📊 TRENDS PAGE

### `/trends`
- [ ] Shows 5+ products ranked by trend score
- [ ] Table columns: Rank | Product | Score | Price Δ | Videos | CTR | Action
- [ ] Score breakdown visible (tooltip or modal)
- [ ] Score components explained:
  - [ ] Price velocity (%)
  - [ ] Media mentions (#)
  - [ ] Click-through rate (%)
- [ ] "View Product" button works
- [ ] Sorting by column works (if implemented)

---

## 🔗 AFFILIATE LINK COMPLIANCE

### Amazon Associates
- [ ] All Amazon prices show "as of [timestamp]"
- [ ] Timestamps are <24h old (or badge shown)
- [ ] Required disclaimer on pages with Amazon links:  
  "As an Amazon Associate, TechDeals earns from qualifying purchases."
- [ ] Disclaimer in footer
- [ ] Disclaimer on article pages
- [ ] No misleading pricing claims

### Best Buy
- [ ] Attribution present
- [ ] Links open to Best Buy with affiliate ID

### Newegg
- [ ] Links work (even if mock data)

### UTM Parameters
- [ ] All affiliate links have:
  - [ ] `utm_source=techdeals`
  - [ ] `utm_medium=affiliate`
  - [ ] `utm_campaign=[category]`

---

## 🎥 YOUTUBE INTEGRATION

### Video Embeds
- [ ] Product pages show 2-3 video thumbnails
- [ ] Thumbnails are not 404
- [ ] Clicking thumbnail opens modal
- [ ] `<iframe>` embed works (or mock placeholder)
- [ ] Video metadata displays:
  - [ ] Title
  - [ ] Channel name
  - [ ] View count
  - [ ] Duration
- [ ] Modal closes on backdrop click
- [ ] No downloads/re-hosting (ToS compliant)

---

## 🤖 DEALS RADAR (Backend Job)

### Manual Trigger Test
```bash
# Manually edit a price to drop >10%
pnpm tsx -e "
import { prisma } from './lib/db';
const deal = await prisma.deal.findFirst();
await prisma.deal.update({
  where: { id: deal.id },
  data: { price: deal.price * 0.8 } // 20% drop
});
console.log('Price dropped');
"

# Check if DealPost created
pnpm tsx -e "
import { prisma } from './lib/db';
const posts = await prisma.dealPost.findMany();
console.log('Deal posts:', posts.length);
"
```

- [ ] Price drop detected
- [ ] DealPost created (status: pending or published)
- [ ] If score >70 → auto-published
- [ ] SocialPost enqueued (if social enabled)

---

## 🐦 SOCIAL AUTOMATION (Dry-Run)

### Twitter/X Bot Test
```bash
# View queued posts
pnpm tsx -e "
import { prisma } from './lib/db';
const posts = await prisma.socialPost.findMany({ take: 5 });
console.log(posts.map(p => p.content));
"
```

- [ ] SocialPost records exist
- [ ] Content is 200-260 chars
- [ ] Contains emoji (🔥 or 💰)
- [ ] Contains product name + price + discount
- [ ] Contains short link (or full URL)
- [ ] Hashtags present (#TechDeals #[category])
- [ ] Status is 'queued' (not 'posted' if dry-run)
- [ ] scheduledAt is in future (rate-limited)

---

## 🛡️ ADMIN PANEL

### `/admin` (Read-Only)
- [ ] Login required (or basic auth)
- [ ] Dashboard shows:
  - [ ] Product count
  - [ ] Deal count
  - [ ] Article count
  - [ ] Traffic metrics (or placeholder)
- [ ] Product list shows 50+ items
- [ ] Article list shows 2+ items
- [ ] Deal queue shows pending deals
- [ ] Social queue shows queued posts
- [ ] Edit buttons disabled (read-only mode)

---

## 🔍 SEO PRIMITIVES

### Structured Data
```bash
# Check if JSON-LD exists
curl -s http://localhost:3000/product/[slug] | grep -o '@type.*Product'
```

- [ ] Product pages have `Product` schema
- [ ] Offers schema with price, currency, availability
- [ ] Article pages have `Article` schema
- [ ] VideoObject schema on pages with YouTube embeds

### Sitemaps
- [ ] `/sitemap.xml` exists and returns XML
- [ ] Contains links to products, articles, categories
- [ ] Valid XML (no parse errors)

### Robots.txt
- [ ] `/robots.txt` exists
- [ ] Allows crawling (`User-agent: * Allow: /`)
- [ ] Disallows `/admin` and `/api/internal`
- [ ] Links to sitemap

### OpenGraph Tags
- [ ] Pages have `og:title`, `og:description`, `og:image`
- [ ] Twitter Card meta tags present
- [ ] Canonical URL set correctly

---

## ⚡ PERFORMANCE

### Lighthouse Scores (Run on 3 pages)
```bash
lighthouse http://localhost:3000 --only-categories=performance --quiet
lighthouse http://localhost:3000/product/[slug] --only-categories=performance --quiet
lighthouse http://localhost:3000/article/[slug] --only-categories=performance --quiet
```

- [ ] Performance score ≥85
- [ ] LCP <2.5s
- [ ] FID <100ms
- [ ] CLS <0.1

### Bundle Size
```bash
pnpm build
# Check output size
ls -lh .next/static/chunks/*.js | awk '{print $5, $9}'
```

- [ ] Main bundle <500KB (gzipped)
- [ ] Individual chunks <200KB

---

## ♿ ACCESSIBILITY

### Automated (axe-core)
```bash
# Run axe audit (if installed)
pnpm test:a11y || echo "Manual check required"
```

- [ ] No critical violations
- [ ] All images have `alt` text
- [ ] Form inputs have `<label>` or `aria-label`
- [ ] Links have descriptive text (not "click here")
- [ ] Headings in logical order (H1 → H2 → H3)

### Manual (Keyboard Navigation)
- [ ] Tab through page (all interactive elements focusable)
- [ ] Focus indicators visible (outline or custom style)
- [ ] Modal closes on `Esc` key
- [ ] No keyboard traps

### Screen Reader (NVDA/VoiceOver)
- [ ] Page structure announced correctly
- [ ] Product prices announced with "as of" timestamp
- [ ] Affiliate links announced (not just "link")

---

## 🔒 SECURITY

- [ ] No secrets in code (check `.env` not committed)
- [ ] `.gitignore` includes `.env`, `.env.local`, `*.db`
- [ ] Admin routes protected (auth required)
- [ ] No SQL injection risk (Prisma parameterized queries)
- [ ] No XSS risk (React escapes by default)
- [ ] External links have `rel="noopener noreferrer"`

---

## 🧪 SMOKE TESTS (CLI)

### Database Connection
```bash
pnpm tsx -e "import { prisma } from './lib/db'; await prisma.\$executeRaw\`SELECT 1\`; console.log('✅ DB connected');"
```
- [ ] Passes

### API Health
```bash
curl http://localhost:3000/api/health
```
- [ ] Returns `{"status":"ok","db":true}`

### Product Query
```bash
pnpm tsx -e "import { prisma } from './lib/db'; const p = await prisma.product.findFirst(); console.log('✅ Product:', p.title);"
```
- [ ] Returns product

### Affiliate Link Builder
```bash
pnpm tsx -e "import { buildAmazonLink } from './lib/affiliate'; console.log(buildAmazonLink('B09XYZ', 'techdeals-20', 'crypto'));"
```
- [ ] Returns URL with `tag=techdeals-20&utm_source=techdeals`

---

## 📦 BUILD & DEPLOY

### Production Build
```bash
pnpm build
```
- [ ] Completes without errors
- [ ] No TypeScript errors
- [ ] No ESLint warnings (or acceptable)
- [ ] `.next/` directory created

### Type Check
```bash
pnpm type-check
```
- [ ] No errors

### Lint
```bash
pnpm lint
```
- [ ] No critical errors

---

## 🚀 DEPLOYMENT READINESS

- [ ] `.env.sample` documented with all required variables
- [ ] `README.md` has quickstart instructions
- [ ] `RECOVERY.md` has rebuild commands
- [ ] `Makefile` has `make fresh` and `make rc` targets
- [ ] Docker Compose config works (if using)
- [ ] Vercel config ready (if deploying to Vercel)
- [ ] Database migration plan documented
- [ ] Secrets rotation plan documented

---

## 🎯 ACCEPTANCE CRITERIA (MVP)

- [x] Home LCP ≤ 2.5s on mid device
- [x] Search "RTX 4070" shows product card with affiliate links
- [x] Product page has "as-of" label, 2-3 videos
- [x] 1 Roundup Article with 5+ links, FTC disclosure
- [x] Trend Finder lists ≥5 items with visible scores
- [x] Deals Radar detects seeded price drop → creates DealPost
- [x] Social post queue has dry-run posts

---

## 📝 NOTES

**Tester:** _______________  
**Date:** _______________  
**Environment:** Development / Staging / Production  
**Issues Found:** _______________

---

**Sign-Off Required:**
- [ ] QA Lead
- [ ] Product Owner
- [ ] Tech Lead
- [ ] Compliance Officer (for affiliate/FTC review)
