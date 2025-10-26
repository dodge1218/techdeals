# Test Strategy
## TechDeals Platform

**Version:** 1.0  
**Last Updated:** 2025-10-23  
**Status:** Sprint 0 - Foundation

---

## 1. TESTING PYRAMID

```
         /\
        /  \  E2E (10%)
       /────\
      /      \  Integration (30%)
     /────────\
    /          \  Unit (60%)
   /────────────\
```

**Philosophy:** Fast feedback loop; catch bugs early; minimize flakiness

---

## 2. UNIT TESTS (60%)

### Scope
- Business logic (pure functions)
- Utilities (date formatting, slug generation)
- Adapters (mocked external APIs)

### Framework
- **Vitest** (fast, ESM-native, Jest-compatible)

### Example Test
```typescript
// lib/affiliate.test.ts
import { describe, it, expect } from 'vitest';
import { generateAffiliateLink, detectRetailer } from './affiliate';

describe('generateAffiliateLink', () => {
  it('adds Amazon Associates tag to product URL', () => {
    const url = 'https://amazon.com/dp/B08HR6FMK3';
    const result = generateAffiliateLink(url, 'amazon');
    
    expect(result).toContain('tag=techdeals-20');
    expect(result).toContain('utm_source=techdeals');
  });
  
  it('handles URLs with existing query params', () => {
    const url = 'https://amazon.com/dp/B08HR6FMK3?foo=bar';
    const result = generateAffiliateLink(url, 'amazon');
    
    expect(result).toContain('foo=bar');
    expect(result).toContain('tag=techdeals-20');
  });
  
  it('returns original URL for unsupported retailers', () => {
    const url = 'https://example.com/product';
    const result = generateAffiliateLink(url, 'unknown' as any);
    
    expect(result).toBe(url);
  });
});

describe('detectRetailer', () => {
  it('detects Amazon from hostname', () => {
    expect(detectRetailer('https://amazon.com/dp/123')).toBe('amazon');
    expect(detectRetailer('https://amazon.co.uk/dp/123')).toBe('amazon');
  });
  
  it('detects Best Buy', () => {
    expect(detectRetailer('https://bestbuy.com/site/123')).toBe('bestbuy');
  });
  
  it('returns null for unknown retailer', () => {
    expect(detectRetailer('https://example.com')).toBeNull();
  });
});
```

### Coverage Targets
- **Overall:** 80%
- **Critical paths:** 100% (affiliate link generation, price calculation, FTC disclosure)
- **Utilities:** 90%

### Run
```bash
npm run test        # Run all tests
npm run test:watch  # Watch mode
npm run test:coverage  # Generate coverage report
```

---

## 3. INTEGRATION TESTS (30%)

### Scope
- API routes (request → response)
- Database operations (Prisma queries)
- Adapter contracts (mocked external APIs)

### Framework
- **Vitest** + **MSW (Mock Service Worker)** for API mocking

### Example Test
```typescript
// app/api/deals/route.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { GET } from './route';
import { db } from '@/lib/db';

describe('GET /api/deals', () => {
  beforeEach(async () => {
    // Clear database
    await db.deal.deleteMany();
    await db.product.deleteMany();
  });
  
  it('returns active deals', async () => {
    // Seed test data
    const product = await db.product.create({
      data: {
        title: 'Test Product',
        category: 'pc-parts',
        externalId: 'test-123',
        source: 'amazon',
      },
    });
    
    await db.deal.create({
      data: {
        productId: product.id,
        retailer: 'amazon',
        price: 99.99,
        isActive: true,
        url: 'https://amazon.com/test',
      },
    });
    
    // Make request
    const request = new Request('http://localhost:3000/api/deals');
    const response = await GET(request);
    const data = await response.json();
    
    // Assert
    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].product.title).toBe('Test Product');
    expect(data[0].price).toBe(99.99);
  });
  
  it('filters deals by category', async () => {
    const product1 = await db.product.create({
      data: {
        title: 'GPU',
        category: 'pc-parts',
        externalId: 'gpu-123',
        source: 'amazon',
      },
    });
    
    const product2 = await db.product.create({
      data: {
        title: 'Phone',
        category: 'phones',
        externalId: 'phone-456',
        source: 'amazon',
      },
    });
    
    await db.deal.createMany({
      data: [
        { productId: product1.id, retailer: 'amazon', price: 999, isActive: true, url: 'https://amazon.com/gpu' },
        { productId: product2.id, retailer: 'amazon', price: 799, isActive: true, url: 'https://amazon.com/phone' },
      ],
    });
    
    // Filter by category
    const request = new Request('http://localhost:3000/api/deals?category=pc-parts');
    const response = await GET(request);
    const data = await response.json();
    
    expect(data).toHaveLength(1);
    expect(data[0].product.category).toBe('pc-parts');
  });
});
```

### Contract Tests (Adapters)
```typescript
// lib/adapters/amazon.test.ts
import { describe, it, expect } from 'vitest';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';
import { AmazonAdapter } from './amazon';

describe('AmazonAdapter', () => {
  it('fetches products from PA-API', async () => {
    // Mock PA-API response
    server.use(
      http.post('https://webservices.amazon.com/paapi5/searchitems', () => {
        return HttpResponse.json({
          SearchResult: {
            Items: [
              {
                ASIN: 'B08HR6FMK3',
                ItemInfo: { Title: { DisplayValue: 'RTX 4090' } },
                Offers: {
                  Listings: [{ Price: { Amount: 1599.99, Currency: 'USD' } }],
                },
              },
            ],
          },
        });
      })
    );
    
    const adapter = new AmazonAdapter();
    const products = await adapter.fetchProducts({ keywords: 'RTX 4090' });
    
    expect(products).toHaveLength(1);
    expect(products[0].externalId).toBe('B08HR6FMK3');
    expect(products[0].price).toBe(1599.99);
  });
  
  it('falls back to mock data when API fails', async () => {
    server.use(
      http.post('https://webservices.amazon.com/paapi5/searchitems', () => {
        return HttpResponse.error();
      })
    );
    
    const adapter = new AmazonAdapter();
    const products = await adapter.fetchProducts({ keywords: 'GPU' });
    
    // Should return mock data instead of throwing
    expect(products.length).toBeGreaterThan(0);
    expect(products[0].source).toBe('amazon');
  });
});
```

---

## 4. END-TO-END TESTS (10%)

### Scope
- Critical user flows (happy paths only)
- Cross-browser compatibility
- Accessibility (keyboard nav, screen readers)

### Framework
- **Playwright** (multi-browser, fast, reliable)

### Example Test
```typescript
// e2e/deal-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Deal Discovery Flow', () => {
  test('user can find and click a deal', async ({ page }) => {
    // 1. Navigate to homepage
    await page.goto('/');
    
    // 2. Verify deals are visible
    await expect(page.locator('[data-testid="deal-card"]').first()).toBeVisible();
    
    // 3. Filter by category
    await page.click('[data-testid="category-filter-pc-parts"]');
    await page.waitForURL(/\?category=pc-parts/);
    
    // 4. Click a deal
    const firstDeal = page.locator('[data-testid="deal-card"]').first();
    const dealTitle = await firstDeal.locator('h3').textContent();
    await firstDeal.click();
    
    // 5. Verify deal detail page
    await expect(page.locator('h1')).toContainText(dealTitle);
    await expect(page.locator('[data-testid="price"]')).toBeVisible();
    await expect(page.locator('[data-testid="as-of-time"]')).toBeVisible();
    
    // 6. Click affiliate link
    const [newPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('[data-testid="view-deal-btn"]'),
    ]);
    
    // 7. Verify redirect to retailer
    await expect(newPage.url()).toMatch(/amazon\.com|bestbuy\.com|newegg\.com/);
    await expect(newPage.url()).toContain('utm_source=techdeals');
  });
  
  test('user can set price watch', async ({ page }) => {
    await page.goto('/deals/rtx-4090-deal');
    
    // Click watch button
    await page.click('[data-testid="watch-deal-btn"]');
    
    // Fill modal
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="target-price-input"]', '1499');
    await page.click('[data-testid="submit-watch-btn"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'We'll notify you when the price drops'
    );
  });
});

test.describe('Article Reading Flow', () => {
  test('user can read article and click product links', async ({ page }) => {
    await page.goto('/articles');
    
    // Click first article
    await page.locator('[data-testid="article-card"]').first().click();
    
    // Verify article content
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('article')).toBeVisible();
    
    // Verify FTC disclosure present
    await expect(page.locator('text=We earn from qualifying purchases')).toBeVisible();
    
    // Verify videos embedded
    await expect(page.locator('iframe[src*="youtube.com/embed"]').first()).toBeVisible();
    
    // Click product link
    const [newPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.locator('a[rel="sponsored"]').first().click(),
    ]);
    
    await expect(newPage.url()).toContain('utm_source=techdeals');
  });
});
```

### Run E2E Tests
```bash
npx playwright test                # Run all E2E tests
npx playwright test --ui           # Interactive UI mode
npx playwright test --headed       # Show browser
npx playwright test --project=chromium  # Single browser
npx playwright show-report         # View report
```

---

## 5. ACCESSIBILITY TESTS

### Framework
- **@axe-core/playwright** (automated a11y checks)

### Example
```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('homepage should not have accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  
  test('deal page should be keyboard navigable', async ({ page }) => {
    await page.goto('/deals/test-deal');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'view-deal-btn');
    
    // Press Enter to activate
    await page.keyboard.press('Enter');
    
    // Should open new tab
    const [newPage] = await Promise.all([
      page.waitForEvent('popup'),
    ]);
    
    expect(newPage.url()).toBeTruthy();
  });
});
```

---

## 6. COMPLIANCE TESTS (Red Team)

### Scope
- Amazon Associates rules
- FTC affiliate disclosure
- Stale price detection
- Dead link handling

### Example
```typescript
// tests/compliance/amazon.test.ts
import { test, expect } from '@playwright/test';

test.describe('Amazon Associates Compliance', () => {
  test('all prices have "as-of" timestamp', async ({ page }) => {
    await page.goto('/deals?retailer=amazon');
    
    const dealCards = await page.locator('[data-testid="deal-card"]').all();
    
    for (const card of dealCards) {
      const asOfTime = card.locator('[data-testid="as-of-time"]');
      await expect(asOfTime).toBeVisible();
      
      // Verify timestamp is within last 24 hours
      const timeText = await asOfTime.textContent();
      expect(timeText).toMatch(/as of/i);
    }
  });
  
  test('no "Add to Cart" buttons on Amazon deals', async ({ page }) => {
    await page.goto('/deals/amazon-deal');
    
    const addToCartBtn = page.locator('button:text("Add to Cart")');
    await expect(addToCartBtn).not.toBeVisible();
  });
  
  test('affiliate links include required tag', async ({ page }) => {
    await page.goto('/deals/amazon-deal');
    
    const viewDealBtn = page.locator('[data-testid="view-deal-btn"]');
    const href = await viewDealBtn.getAttribute('href');
    
    expect(href).toContain('tag=techdeals-20');
    expect(href).toContain('amazon.com');
  });
});

test.describe('FTC Compliance', () => {
  test('disclosure appears above fold on all affiliate pages', async ({ page }) => {
    const pages = ['/deals', '/deals/test-deal', '/articles/test-article'];
    
    for (const path of pages) {
      await page.goto(path);
      
      const disclosure = page.locator('text=We earn from qualifying purchases');
      await expect(disclosure).toBeVisible();
      
      // Check if above fold (visible without scrolling)
      const box = await disclosure.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.y).toBeLessThan(800); // Typical viewport height
    }
  });
  
  test('affiliate links have rel="sponsored"', async ({ page }) => {
    await page.goto('/articles/test-article');
    
    const affiliateLinks = await page.locator('a[href*="amazon.com"]').all();
    
    for (const link of affiliateLinks) {
      const rel = await link.getAttribute('rel');
      expect(rel).toContain('sponsored');
    }
  });
});
```

---

## 7. PERFORMANCE TESTS

### Framework
- **Lighthouse CI** (automated audits)

### Config (.lighthouserc.js)
```javascript
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start',
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/deals',
        'http://localhost:3000/articles',
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### Run
```bash
npm run lighthouse:ci
```

---

## 8. SMOKE TESTS (Production)

### Scope
- Critical paths in production
- Runs every 5 minutes via cron

### Example
```typescript
// scripts/smoke-test.ts
import fetch from 'node-fetch';

const SITE_URL = process.env.SITE_URL || 'https://techdeals.com';

async function smokeTest() {
  const tests = [
    { name: 'Homepage', url: '/', expectedStatus: 200 },
    { name: 'Deals API', url: '/api/deals', expectedStatus: 200 },
    { name: 'Articles', url: '/articles', expectedStatus: 200 },
    { name: 'Sitemap', url: '/sitemap.xml', expectedStatus: 200 },
  ];
  
  for (const test of tests) {
    try {
      const response = await fetch(`${SITE_URL}${test.url}`);
      
      if (response.status !== test.expectedStatus) {
        throw new Error(`Expected ${test.expectedStatus}, got ${response.status}`);
      }
      
      console.log(`✅ ${test.name}: PASS`);
    } catch (error) {
      console.error(`❌ ${test.name}: FAIL - ${error.message}`);
      process.exit(1);
    }
  }
  
  console.log('✅ All smoke tests passed');
}

smokeTest();
```

---

## 9. TEST DATA MANAGEMENT

### Fixtures
```typescript
// tests/fixtures/products.ts
export const mockProduct = {
  id: 'test-product-1',
  title: 'Test Product',
  category: 'pc-parts',
  brand: 'Test Brand',
  externalId: 'TEST-123',
  source: 'amazon',
  isActive: true,
};

export const mockDeal = {
  id: 'test-deal-1',
  productId: mockProduct.id,
  retailer: 'amazon',
  price: 99.99,
  originalPrice: 149.99,
  discount: 33.33,
  url: 'https://amazon.com/test',
  isActive: true,
};
```

### Factories
```typescript
// tests/factories/product.factory.ts
import { faker } from '@faker-js/faker';

export function createProduct(overrides = {}) {
  return {
    id: faker.string.uuid(),
    title: faker.commerce.productName(),
    category: faker.helpers.arrayElement(['pc-parts', 'phones', 'gaming-setup']),
    brand: faker.company.name(),
    externalId: faker.string.alphanumeric(10),
    source: 'amazon',
    price: parseFloat(faker.commerce.price()),
    ...overrides,
  };
}
```

---

## 10. CI/CD INTEGRATION

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
  
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
  
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - run: npm run lighthouse:ci
```

---

## 11. QA CHECKLIST (Pre-Release)

### Functional
- [ ] All API routes return correct status codes
- [ ] Affiliate links have correct UTM parameters
- [ ] Price "as-of" timestamps are within 24h
- [ ] Dead links are marked inactive
- [ ] Email notifications sent for price watches
- [ ] Articles have FTC disclosure
- [ ] Videos play inline (not broken embeds)

### Non-Functional
- [ ] Lighthouse score ≥85 (mobile)
- [ ] No accessibility violations (axe)
- [ ] Response time <500ms (p95)
- [ ] Database queries optimized (no N+1)

### Compliance
- [ ] Amazon Associates rules verified
- [ ] FTC disclosure visible on all pages
- [ ] No prohibited content (fake urgency)
- [ ] Robots.txt allows crawlers

### Security
- [ ] HTTPS everywhere
- [ ] No secrets in logs
- [ ] CSRF protection on forms
- [ ] Rate limiting active

---

**Document Status:** ✅ Approved for Sprint 0  
**Next Review:** Sprint 1 (after first tests written)  
**Owner:** QA Team  
**Last Updated:** 2025-10-23
