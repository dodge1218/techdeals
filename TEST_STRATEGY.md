# TechDeals - Test Strategy

**Version:** 1.0  
**Last Updated:** 2025-10-23

---

## 1. Testing Philosophy

### Principles
1. **Test behavior, not implementation** – Focus on user/API contracts, not internal details
2. **Pyramid over ice-cream cone** – Many unit tests, fewer integration tests, minimal E2E
3. **Fast feedback loops** – Unit tests <5s, integration <30s, E2E <3min
4. **Mock external dependencies** – Adapters, APIs, LLMs behind interfaces with fixtures
5. **Compliance as tests** – Red-team checks for affiliate rules, FTC disclosure placement

### Coverage Targets
- **Unit Tests:** 70%+ line coverage (lib/, services/)
- **Integration Tests:** All API routes, critical DB queries
- **E2E Tests:** Happy paths only (search → product → affiliate click)
- **Manual QA:** Compliance, accessibility, cross-browser

---

## 2. Test Layers

### 2.1 Unit Tests
**Scope:** Pure functions, utilities, business logic (no I/O).

**Tools:** Vitest (fast, compatible with Next.js)

**Examples:**
- `lib/affiliate/builder.test.ts`: Verify UTM tag construction
- `lib/ranking/score.test.ts`: Deal score calculation with edge cases
- `lib/youtube/parser.test.ts`: Extract video metadata from API response

**Run:** `npm run test` (watch mode during dev)

**Example Test:**
```typescript
// lib/affiliate/builder.test.ts
import { describe, it, expect } from 'vitest';
import { buildAmazonLink } from './builder';

describe('buildAmazonLink', () => {
  it('should append associate tag and UTM params', () => {
    const url = buildAmazonLink('B09XYZ123', 'techdeals-20', 'crypto-miners');
    expect(url).toContain('tag=techdeals-20');
    expect(url).toContain('utm_source=techdeals');
    expect(url).toContain('utm_campaign=crypto-miners');
  });

  it('should handle missing campaign gracefully', () => {
    const url = buildAmazonLink('B09XYZ123', 'techdeals-20');
    expect(url).toContain('tag=techdeals-20');
    expect(url).not.toContain('utm_campaign');
  });
});
```

---

### 2.2 Integration Tests
**Scope:** API routes, DB queries, adapter contracts.

**Tools:** Vitest + Supertest (HTTP assertions)

**Setup:**
- Use in-memory SQLite for speed (`DATABASE_URL="file::memory:?cache=shared"`)
- Reset DB before each test suite
- Mock external APIs (Amazon, YouTube, Twitter)

**Examples:**
- `app/api/products/route.test.ts`: GET /api/products returns paginated JSON
- `lib/adapters/amazon.test.ts`: Mock PA-API response → verify normalized output
- `lib/jobs/deals-radar.test.ts`: Simulate price drop → verify DealPost created

**Run:** `npm run test:integration`

**Example Test:**
```typescript
// app/api/products/route.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { prisma } from '@/lib/db';

beforeAll(async () => {
  await prisma.product.create({
    data: { slug: 'test-product', title: 'Test GPU', category: 'pc-parts' },
  });
});

describe('GET /api/products', () => {
  it('should return products with offers', async () => {
    const res = await request(app).get('/api/products?category=pc-parts');
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].slug).toBe('test-product');
  });

  it('should paginate results', async () => {
    const res = await request(app).get('/api/products?page=2&perPage=10');
    expect(res.body.page).toBe(2);
    expect(res.body.products.length).toBeLessThanOrEqual(10);
  });
});
```

---

### 2.3 Contract Tests (Adapter Fixtures)
**Scope:** Verify adapter outputs match expected schema.

**Tools:** Vitest + JSON Schema validation (Zod)

**Process:**
1. Capture real API response → save as fixture JSON
2. Write test: `adapter.fetchProducts() → validate schema`
3. If schema changes, update fixtures

**Examples:**
- `lib/adapters/amazon.contract.test.ts`: Load `fixtures/amazon-products.json` → parse → validate
- `lib/adapters/youtube.contract.test.ts`: Verify video metadata fields

**Example Test:**
```typescript
// lib/adapters/amazon.contract.test.ts
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import amazonFixture from '@/fixtures/amazon-products.json';

const RawProductSchema = z.object({
  title: z.string(),
  price: z.number(),
  asin: z.string(),
  imageUrl: z.string().url(),
});

describe('Amazon Adapter Contract', () => {
  it('should match expected schema', () => {
    amazonFixture.forEach((item) => {
      expect(() => RawProductSchema.parse(item)).not.toThrow();
    });
  });
});
```

---

### 2.4 End-to-End Tests
**Scope:** Critical user flows (search, view product, click affiliate link).

**Tools:** Playwright (headless Chrome)

**Setup:**
- Seed staging DB with known products
- Run tests against `http://localhost:3000` or staging URL
- Use test affiliate tag (`techdeals-test-20`) to avoid polluting analytics

**Examples:**
1. **Search Flow:** Home → search "RTX 4070" → see results → click product
2. **Affiliate Click:** Product page → click "Buy on Amazon" → verify redirect to Amazon with tag
3. **Video Embed:** Product page → click video thumbnail → modal opens → video plays

**Run:** `npm run test:e2e`

**Example Test:**
```typescript
// e2e/affiliate-click.spec.ts
import { test, expect } from '@playwright/test';

test('should redirect to Amazon with affiliate tag', async ({ page, context }) => {
  await page.goto('http://localhost:3000/product/rtx-4070-ti');
  
  // Wait for page load
  await expect(page.locator('h1')).toContainText('RTX 4070 Ti');
  
  // Click "Buy on Amazon" button
  const [popup] = await Promise.all([
    context.waitForEvent('page'),
    page.click('text=Buy on Amazon'),
  ]);
  
  // Verify redirect URL
  const url = popup.url();
  expect(url).toContain('amazon.com');
  expect(url).toContain('tag=techdeals-20');
  expect(url).toContain('utm_source=techdeals');
  
  await popup.close();
});
```

---

### 2.5 Compliance Red-Team Tests
**Scope:** Verify affiliate program rules, FTC disclosure, legal requirements.

**Tools:** Manual checklist + automated assertions (Playwright)

**Red-Team Checks:**

#### Amazon Associates Compliance
- [ ] All prices show "as of [timestamp]"
- [ ] Stale prices (>24h) display warning badge
- [ ] No price displayed if >24h without update (auto-hide)
- [ ] Required disclaimer present on all pages with Amazon links: "As an Amazon Associate, TechDeals earns from qualifying purchases."
- [ ] Product images from Amazon CDN (or approved sources)
- [ ] No misleading claims (e.g., "guaranteed lowest price")

#### FTC Disclosure
- [ ] Affiliate disclosure above-the-fold on article pages
- [ ] Footer disclosure on all pages with affiliate links
- [ ] Disclosure language clear (not buried in legalese)
- [ ] No dark patterns (e.g., disclosure in light gray on white)

#### ToS Compliance (Adapters)
- [ ] YouTube: No downloading videos, only embedding
- [ ] Best Buy: Attribution present, rate limits respected
- [ ] Newegg: Feed terms followed, no prohibited re-hosting

**Automated Test Example:**
```typescript
// e2e/compliance.spec.ts
import { test, expect } from '@playwright/test';

test('should display FTC disclosure on article page', async ({ page }) => {
  await page.goto('http://localhost:3000/article/best-crypto-miners-2024');
  
  // Check disclosure in header (above content)
  const disclosure = page.locator('text=/affiliate/i').first();
  await expect(disclosure).toBeVisible();
  
  // Verify position (should be in top 20% of viewport)
  const box = await disclosure.boundingBox();
  expect(box!.y).toBeLessThan(page.viewportSize()!.height * 0.2);
});

test('should show "as-of" timestamp on product page', async ({ page }) => {
  await page.goto('http://localhost:3000/product/rtx-4070-ti');
  
  const timestamp = page.locator('text=/as of/i');
  await expect(timestamp).toBeVisible();
  
  // Verify timestamp is recent (within 48h)
  const text = await timestamp.textContent();
  const date = new Date(text!.split('as of ')[1]);
  const hoursSince = (Date.now() - date.getTime()) / (1000 * 60 * 60);
  expect(hoursSince).toBeLessThan(48);
});
```

---

### 2.6 Accessibility (a11y) Tests
**Scope:** Keyboard navigation, screen reader compatibility, WCAG 2.1 AA.

**Tools:** axe-core (automated), manual testing with NVDA/VoiceOver

**Automated Checks:**
```typescript
// e2e/a11y.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('should have no accessibility violations on home page', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toHaveLength(0);
});

test('should be keyboard navigable', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Tab through interactive elements
  await page.keyboard.press('Tab'); // Focus search
  await page.keyboard.press('Tab'); // Focus first product card
  
  const focused = page.locator(':focus');
  await expect(focused).toHaveAttribute('href'); // Should be a link
});
```

**Manual Checklist:**
- [ ] All images have `alt` text
- [ ] Form inputs have `<label>` or `aria-label`
- [ ] Focus indicators visible (no `outline: none` without replacement)
- [ ] Color contrast ≥4.5:1 for text
- [ ] Headings in logical order (H1 → H2 → H3)
- [ ] ARIA landmarks (`<nav>`, `<main>`, `<aside>`)

---

### 2.7 Performance Tests
**Scope:** Page load times, API latency, Core Web Vitals.

**Tools:** Lighthouse CI, k6 (load testing)

**Targets:**
- **LCP (Largest Contentful Paint):** <2.5s
- **FID (First Input Delay):** <100ms
- **CLS (Cumulative Layout Shift):** <0.1
- **API p95 Latency:** <300ms

**Lighthouse CI Config:**
```yaml
# .lighthouserc.yml
ci:
  collect:
    url:
      - http://localhost:3000
      - http://localhost:3000/category/pc-parts
      - http://localhost:3000/product/rtx-4070-ti
    numberOfRuns: 3
  assert:
    preset: lighthouse:recommended
    assertions:
      first-contentful-paint: ['error', { maxNumericValue: 2000 }]
      interactive: ['error', { maxNumericValue: 3500 }]
      performance: ['error', { minScore: 0.85 }]
```

**k6 Load Test:**
```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp to 50 users
    { duration: '2m', target: 100 }, // Sustain 100 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests <500ms
    http_req_failed: ['rate<0.01'],   // <1% error rate
  },
};

export default function () {
  const res = http.get('http://localhost:3000/category/pc-parts');
  check(res, {
    'status 200': (r) => r.status === 200,
    'has products': (r) => r.body.includes('RTX'),
  });
  sleep(1);
}
```

**Run:** `k6 run load-test.js`

---

## 3. Test Data Management

### Fixtures (Static Data)
- **Location:** `fixtures/` directory
- **Format:** JSON (validated against Zod schemas)
- **Examples:**
  - `amazon-products.json` (10 products)
  - `youtube-videos.json` (20 videos)
  - `articles.json` (5 roundups)

### Seed Script (Dynamic Data)
- **File:** `prisma/seed.ts`
- **Purpose:** Populate dev/test DB with realistic data
- **Run:** `npm run db:seed`
- **Contents:**
  - 50 products (10 per category)
  - 150 offers (3 vendors × 50 products)
  - 500 price history records
  - 100 video metadata records
  - 10 articles with affiliate links
  - 5 users (admin, editor, viewer roles)

**Idempotency:** Seed script should be re-runnable (upsert, not insert).

---

## 4. CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  pull_request:
  push:
    branches: [main]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test

  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx prisma migrate deploy
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/techdeals_test

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
        env:
          BASE_URL: http://localhost:3000

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: treosh/lighthouse-ci-action@v9
        with:
          configPath: ./.lighthouserc.yml
          uploadArtifacts: true
```

### Pre-Commit Hooks (Optional)
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "vitest related --run"]
  }
}
```

---

## 5. Test Scenarios (Critical Paths)

### Scenario 1: Deal Hunter Discovers Price Drop
1. User visits home page
2. Sees "Trending Now" section with RTX 4070 (20% off badge)
3. Clicks product card → product page loads
4. Sees price history chart (line shows drop)
5. Clicks "Buy on Amazon" → redirects with affiliate tag
6. **Assertions:** Badge visible, chart accurate, link tagged, timestamp <24h

### Scenario 2: Content Creator Generates Roundup Article
1. Admin logs into `/admin`
2. Navigates to "Articles" → "Generate New"
3. Selects niche: "Best Budget Crypto Miners"
4. Clicks "Generate" → LLM (or mock) creates draft
5. Reviews content, edits intro paragraph
6. Clicks "Publish" → article live at `/article/best-budget-crypto-miners-2024`
7. **Assertions:** Article has 5+ product links, FTC disclosure present, slug correct

### Scenario 3: Social Bot Posts Deal to Twitter
1. Deals Radar detects 15% price drop on GPU
2. Creates `DealPost` with score=85 (auto-publish threshold)
3. Composes tweet: "🔥 RTX 4070 Ti dropped to $699 (15% off)! ..."
4. Queues `SocialPost` (status: queued)
5. Scheduler runs (every 20 min) → posts to Twitter
6. Updates `SocialPost` (status: posted, responseId: tweet_id)
7. **Assertions:** Tweet visible on Twitter, link tagged, rate limit not exceeded

---

## 6. Defect Triage Process

### Severity Levels
- **P0 (Critical):** Site down, data loss, compliance violation
- **P1 (High):** Affiliate links broken, prices stale >24h, SEO tags missing
- **P2 (Medium):** UI bug, slow query, missing accessibility label
- **P3 (Low):** Cosmetic issue, typo, minor perf degradation

### Triage Flow
1. Bug reported → assigned to on-call engineer
2. Reproduce locally (or in staging)
3. Write regression test (TDD: test should fail)
4. Fix bug → test passes
5. Verify in staging → deploy to prod
6. Update runbook if config/ops issue

---

## 7. QA Checklist (Pre-Launch)

### Functional
- [ ] Home page loads, shows products
- [ ] Search works (returns relevant results)
- [ ] Product page displays price grid, specs, videos
- [ ] Affiliate links open with correct tags
- [ ] Price history chart renders (no errors)
- [ ] Articles render with Markdown formatting
- [ ] Deals page shows recent drops
- [ ] Trends page ranks correctly
- [ ] Admin login works (Next-Auth)
- [ ] Admin can edit products, approve deals

### Compliance
- [ ] All prices show "as-of" timestamp
- [ ] Stale prices (>24h) hidden or badged
- [ ] FTC disclosure on all affiliate pages
- [ ] Amazon disclaimer present
- [ ] Privacy policy + Terms pages live

### Performance
- [ ] Lighthouse score ≥85 (all pages)
- [ ] LCP <2.5s on 4G connection
- [ ] API latency p95 <300ms
- [ ] Load test passes (100 concurrent users)

### Accessibility
- [ ] No axe-core violations
- [ ] Keyboard navigation works
- [ ] Screen reader tested (NVDA or VoiceOver)
- [ ] Color contrast ≥4.5:1

### Security
- [ ] No secrets in code/commits
- [ ] Admin routes protected (auth required)
- [ ] SQL injection guards (Prisma parameterized queries)
- [ ] XSS guards (React escapes by default)

### SEO
- [ ] Sitemaps generated
- [ ] Robots.txt published
- [ ] OpenGraph tags on all pages
- [ ] Structured data validates (Google tool)

---

## 8. Continuous Monitoring (Post-Launch)

### Synthetic Tests (Uptime Monitoring)
- **Tool:** UptimeRobot or Checkly
- **Endpoints:**
  - `GET /` (home page, expect 200)
  - `GET /api/health` (health check, expect `{status: 'ok'}`)
  - `GET /product/rtx-4070-ti` (product page, expect 200)
- **Frequency:** Every 5 min
- **Alerts:** Slack on 3 consecutive failures

### Real User Monitoring (RUM)
- **Tool:** Vercel Analytics or Plausible
- **Metrics:** Page views, Core Web Vitals, error rates
- **Dashboards:** Weekly review in admin panel

### Error Tracking
- **Tool:** Sentry (free tier)
- **Config:** Capture 5xx errors, unhandled exceptions
- **Alerts:** Email on new error type

---

## 9. Testing Anti-Patterns to Avoid

❌ **Don't test implementation details** (e.g., "component state is X")  
✅ **Do test user-visible behavior** (e.g., "button is disabled after click")

❌ **Don't rely on brittle selectors** (`.css-12345`)  
✅ **Do use semantic queries** (`getByRole('button', { name: 'Buy' })`)

❌ **Don't mock everything** (makes tests useless)  
✅ **Do mock external APIs only** (keep DB, business logic real)

❌ **Don't write flaky E2E tests** (random timeouts)  
✅ **Do use explicit waits** (`waitFor`, `toBeVisible`)

❌ **Don't skip compliance tests** (legal risk)  
✅ **Do automate red-team checks** (FTC disclosure, stale prices)

---

## 10. Success Metrics

### Test Suite Health
- **Build Time:** <5 min (unit + integration + E2E)
- **Flakiness:** <2% (re-run success rate)
- **Coverage:** 70%+ lines (unit), 100% critical paths (E2E)

### Defect Escape Rate
- **Target:** <5% of bugs found in production (vs. caught in test/staging)
- **Measure:** Track Sentry errors not covered by existing tests

### Regression Prevention
- **All P0/P1 bugs** must have regression test before fix merged
- **Track:** "Tests added per bug fix" (target: 100%)

---

**QA Sign-Off:** This strategy will be reviewed and updated after Sprint 3 (once Article Writer and Social Bot are testable).

---

**Next Actions:**
1. Set up Vitest + Playwright in repo (Sprint 1)
2. Write first contract tests for mock adapters (Sprint 1)
3. Add Lighthouse CI to GitHub Actions (Sprint 5)
