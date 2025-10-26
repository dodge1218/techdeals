# TechDeals Deployment Guide

## 🚀 Quick Deploy Options

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd /home/uba/techdeals
vercel deploy --prod

# Set environment variables
vercel env add ADMIN_PASSWORD
vercel env add DATABASE_URL
vercel env add NEXT_PUBLIC_SITE_URL
```

**Vercel Configuration (`vercel.json`):**
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

---

### Option 2: Docker

**Build Image:**
```bash
docker build -t techdeals .
```

**Run Container:**
```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="file:./prisma/dev.db" \
  -e ADMIN_PASSWORD="your-secure-password" \
  --name techdeals \
  techdeals
```

**Docker Compose:**
```bash
docker-compose up -d
```

---

### Option 3: VPS (DigitalOcean, Linode, etc.)

**1. Setup Server**
```bash
# SSH into server
ssh root@your-server-ip

# Install Node.js 24.x
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2
npm install -g pm2
```

**2. Deploy App**
```bash
# Clone repo
git clone https://github.com/yourusername/techdeals.git
cd techdeals

# Install dependencies
pnpm install

# Build
pnpm build

# Start with PM2
pm2 start npm --name "techdeals-web" -- start
pm2 start scripts/scheduler.js --name "techdeals-scheduler"
pm2 save
pm2 startup
```

**3. Setup Nginx**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔐 Environment Variables

Create `.env.production`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/techdeals"
# OR for SQLite
DATABASE_URL="file:./prisma/prod.db"

# Admin Auth
ADMIN_PASSWORD="your-secure-password-here"

# Site URL
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"

# Optional: Redis (for caching)
REDIS_URL="redis://localhost:6379"

# Optional: Affiliate IDs
AMAZON_ASSOCIATE_ID="yourtag-20"
BESTBUY_AFFILIATE_ID="your-bestbuy-id"
NEWEGG_AFFILIATE_ID="your-newegg-id"

# Optional: APIs (if using real integrations)
AMAZON_ACCESS_KEY=""
AMAZON_SECRET_KEY=""
YOUTUBE_API_KEY=""
```

---

## 📦 Pre-Deployment Checklist

- [ ] Run `pnpm type-check` (no errors)
- [ ] Run `pnpm lint` (no critical warnings)
- [ ] Run `pnpm build` (successful build)
- [ ] Test health check: `curl /api/health` (200 OK)
- [ ] Verify database connection
- [ ] Set strong `ADMIN_PASSWORD` in environment
- [ ] Update `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Test admin login with new password
- [ ] Run smoke tests: `make smoke`
- [ ] Backup database: `cp prisma/dev.db prisma/backup.db`

---

## 🔄 Post-Deployment Steps

### 1. Verify Health
```bash
curl https://yourdomain.com/api/health
# Expected: {"status":"ok","database":"connected"}
```

### 2. Test Admin Access
```bash
curl -u admin:your-password https://yourdomain.com/api/admin/articles
# Should return articles JSON
```

### 3. Setup Monitoring

**Uptime Robot:**
- Monitor: https://yourdomain.com/api/health
- Alert: Email when down

**Sentry (Error Tracking):**
```bash
npm install @sentry/nextjs
```

**Google Analytics:**
```html
<!-- Add to app/layout.tsx -->
<Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" />
```

### 4. Setup Backups

**Database Backup (Cron):**
```bash
# Add to crontab
0 2 * * * cd /path/to/techdeals && cp prisma/prod.db backups/prod-$(date +\%Y\%m\%d).db
```

**Automated Backup Script:**
```bash
#!/bin/bash
# scripts/backup.sh
DATE=$(date +%Y%m%d-%H%M%S)
cp prisma/prod.db backups/prod-${DATE}.db
gzip backups/prod-${DATE}.db
# Keep only last 7 days
find backups/ -name "*.gz" -mtime +7 -delete
```

---

## 🚨 Troubleshooting

### Build Fails
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
pnpm install

# Try build again
pnpm build
```

### Database Connection Error
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test Prisma connection
pnpm prisma db push

# Regenerate Prisma Client
pnpm prisma generate
```

### Port Already in Use
```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 pnpm start
```

---

## 📊 Performance Optimization

### 1. Enable Caching

**Install Redis:**
```bash
docker run -d -p 6379:6379 redis:alpine
```

**Add to code:**
```typescript
import Redis from 'ioredis'
const redis = new Redis(process.env.REDIS_URL)

// Cache product data
await redis.set(`product:${id}`, JSON.stringify(product), 'EX', 3600)
```

### 2. Image Optimization

**Use Next.js Image:**
```tsx
import Image from 'next/image'
<Image src={product.imageUrl} width={400} height={400} alt={product.title} />
```

### 3. Static Generation

**For category pages:**
```typescript
export const dynamic = 'force-static'
export const revalidate = 3600 // 1 hour
```

---

## 🔒 Security Hardening

### 1. Rate Limiting

```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
```

### 2. HTTPS Only

**In nginx:**
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}
```

### 3. Helmet Security Headers

```bash
npm install helmet
```

---

## ✅ Production Checklist

- [ ] SSL certificate installed
- [ ] HTTPS redirects working
- [ ] Admin password changed from default
- [ ] Database backed up
- [ ] Monitoring enabled (Uptime Robot)
- [ ] Error tracking enabled (Sentry)
- [ ] Analytics enabled (Google Analytics)
- [ ] Sitemap submitted to Google Search Console
- [ ] Robots.txt verified
- [ ] Performance tested (Lighthouse >85)
- [ ] Mobile responsive verified
- [ ] Admin authentication tested
- [ ] Background jobs running (scheduler)
- [ ] Health endpoint responding (200 OK)

---

## 📞 Support

**Documentation:**
- See RECOVERY.md for troubleshooting
- See COMMANDS_REFERENCE.md for all commands
- See QA_RC_CHECKLIST.md for testing

**Monitoring:**
- Health: https://yourdomain.com/api/health
- Admin: https://yourdomain.com/admin
- Sitemap: https://yourdomain.com/api/sitemap

---

**Deployment complete! Your TechDeals site is production-ready. 🎉**
