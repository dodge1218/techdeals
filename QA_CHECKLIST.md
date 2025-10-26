# ✅ QA Checklist - TechDeals MVP

## Pre-Flight Checks

### Database
- [x] Schema generated successfully
- [x] Migrations applied
- [x] Seed data loaded (10 products)
- [x] All relations working

### Dependencies
- [x] All npm packages installed
- [x] No security vulnerabilities
- [x] Prisma client generated
- [x] TypeScript compiles

### Configuration
- [x] .env.sample provided
- [x] Example keys included
- [x] Database URL configured
- [x] Mock fallbacks active

## Functional Tests

### Pages Load
- [ ] Home page (`/`) renders
- [ ] Product detail (`/products/product-gpu-1`) renders
- [ ] Trends page (`/trends`) renders
- [ ] Articles list (`/articles`) renders
- [ ] Admin dashboard (`/admin`) renders

### Affiliate Links
- [ ] Amazon links include associate tag
- [ ] Best Buy links include irclickid
- [ ] Newegg links include tracking params
- [ ] UTM parameters appended correctly
- [ ] Links open in new tab with rel="noopener noreferrer sponsored"

### Media
- [ ] YouTube embeds display
- [ ] Video thumbnails load
- [ ] Mock videos shown when no API key

### Trends
- [ ] Price signals appear
- [ ] Scores calculated correctly
- [ ] Signals grouped by type
- [ ] Links to products work

### Admin
- [ ] Dashboard stats display
- [ ] Product count accurate
- [ ] Offer count accurate
- [ ] Recent jobs listed

### Compliance
- [ ] FTC disclosure in footer
- [ ] FTC disclosure on article pages
- [ ] "As of" timestamps on all offers
- [ ] rel="sponsored" on affiliate links

## API Endpoints

- [ ] POST `/api/generate-article` returns article
- [ ] Article created in database
- [ ] Article links created

## Background Jobs (If Redis Running)

- [ ] Price update worker starts
- [ ] Trend analysis worker starts
- [ ] Media fetch worker starts
- [ ] Social post worker starts
- [ ] Workers log activity

## Mock Mode Verification

- [ ] Amazon adapter returns mock data
- [ ] Best Buy adapter returns mock data
- [ ] YouTube returns 3 example videos
- [ ] Article generator uses templates
- [ ] Twitter bot logs (doesn't post)

## Error Handling

- [ ] 404 page for missing products
- [ ] 404 for unpublished articles
- [ ] Graceful degradation when API fails
- [ ] Console logs errors (not crashes)

## Performance

- [ ] Home page loads quickly
- [ ] Images lazy load
- [ ] No console errors
- [ ] No memory leaks in dev tools

## Documentation

- [x] README.md present
- [x] QUICKSTART.md present  
- [x] TODO.md with API key checklist
- [x] DELIVERY_SUMMARY.md present
- [x] Comments in complex code

## Security

- [x] .env* in .gitignore
- [x] No secrets in code
- [x] SQL injection protected (Prisma)
- [x] XSS protection (React)

---

## ✅ Ready for Demo

Once all checkboxes ticked, run:
```bash
npm run dev
```

Then visit:
1. http://localhost:3000 (Home)
2. http://localhost:3000/products/product-gpu-1 (Product)
3. http://localhost:3000/trends (Trends)
4. http://localhost:3000/admin (Admin)
