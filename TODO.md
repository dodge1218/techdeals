# TechDeals - Setup TODO List

## 🔑 Required: Fill in API Keys

Before deploying to production, update `.env.local` with your actual API keys:

### 1. Amazon Associates (Required for revenue)
- [ ] Sign up: https://affiliate-program.amazon.com/
- [ ] Get credentials: https://affiliate-program.amazon.com/assoc_credentials/home
- [ ] Update in `.env.local`:
  - `AMAZON_ACCESS_KEY`
  - `AMAZON_SECRET_KEY`
  - `AMAZON_ASSOCIATE_TAG` (your Associate ID)

### 2. Best Buy Affiliate API
- [ ] Sign up: https://developer.bestbuy.com/
- [ ] Get API key from developer portal
- [ ] Update `BESTBUY_API_KEY` in `.env.local`

### 3. Newegg API (Optional)
- [ ] Contact Newegg for API access
- [ ] Update `NEWEGG_API_KEY` in `.env.local`

### 4. YouTube Data API (Required for video embeds)
- [ ] Enable API: https://console.cloud.google.com/apis/library/youtube.googleapis.com
- [ ] Create credentials: https://console.cloud.google.com/apis/credentials
- [ ] Update `YOUTUBE_API_KEY` in `.env.local`

### 5. OpenAI API (Optional - for article writer)
- [ ] Sign up: https://platform.openai.com/
- [ ] Get API key: https://platform.openai.com/api-keys
- [ ] Update `OPENAI_API_KEY` in `.env.local`
- [ ] Add billing: https://platform.openai.com/account/billing

### 6. Twitter/X API (Required for social automation)
- [ ] Apply for access: https://developer.twitter.com/en/portal/dashboard
- [ ] Create app and get credentials (OAuth 1.0a)
- [ ] Update in `.env.local`:
  - `TWITTER_API_KEY`
  - `TWITTER_API_SECRET`
  - `TWITTER_ACCESS_TOKEN`
  - `TWITTER_ACCESS_SECRET`
- [ ] Set `TWITTER_DRY_RUN=false` when ready to post live

### 7. Database (Production)
- [ ] Set up PostgreSQL instance (e.g., Supabase, Neon, Railway)
- [ ] Update `DATABASE_URL` in `.env.local`

### 8. Redis (Production)
- [ ] Set up Redis instance (e.g., Upstash, Redis Cloud)
- [ ] Update `REDIS_URL` in `.env.local`

## 📋 Pre-Launch Checklist

- [ ] Test all affiliate links work correctly
- [ ] Verify "as of" timestamps display properly
- [ ] Check FTC disclosure appears on all pages with affiliate links
- [ ] Test YouTube video embeds load correctly
- [ ] Run price update job manually
- [ ] Generate test article
- [ ] Post test tweet (dry-run mode first)
- [ ] Review robots.txt and sitemap.xml
- [ ] Check Core Web Vitals with Lighthouse
- [ ] Test mobile responsiveness

## 🚀 Deployment Steps

1. [ ] Push code to GitHub
2. [ ] Deploy web app to Vercel
3. [ ] Deploy worker service to Fly.io or similar
4. [ ] Configure environment variables in hosting platforms
5. [ ] Run database migrations in production
6. [ ] Seed initial product data
7. [ ] Monitor error logs for first 24 hours

## 📊 Post-Launch Monitoring

- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Monitor affiliate click-through rates
- [ ] Track article performance
- [ ] Review social post engagement
- [ ] Check API rate limits and quotas
- [ ] Monitor database performance

## ⚠️ Compliance Reminders

- [ ] Amazon: Update prices within 24 hours of changes
- [ ] Amazon: Never cache prices longer than 24 hours
- [ ] FTC: Maintain clear affiliate disclosures
- [ ] Twitter: Respect rate limits (300 tweets/3 hours)
- [ ] YouTube: Cache video metadata, don't download videos

## 🔒 Security

- [ ] Never commit `.env.local` to git
- [ ] Rotate API keys periodically
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting on API routes
- [ ] Set up CORS properly
- [ ] Use HTTPS in production
