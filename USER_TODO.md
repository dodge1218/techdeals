# 🔑 USER TODO: Fill In Your API Keys

**By default, all external APIs run with MOCKS.** The site works fully without real keys—you'll see example data.

To enable real data, follow these steps:

---

## 1️⃣ Amazon Product Advertising API (PA-API 5.0)

**Why:** Fetch real product info, prices, images from Amazon; generate affiliate links.

**Steps:**
1. Sign up for Amazon Associates: https://affiliate-program.amazon.com/
2. Get approved (may take 24-48 hrs)
3. Go to https://affiliate-program.amazon.com/assoc_credentials/home
4. Generate **Access Key** and **Secret Key**
5. Note your **Partner Tag** (e.g., `yoursite-20`)

**Add to `.env`:**
```
AMAZON_ACCESS_KEY="AKIA..."
AMAZON_SECRET_KEY="wJalr..."
AMAZON_PARTNER_TAG="yoursite-20"
AMAZON_HOST="webservices.amazon.com"
AMAZON_REGION="us-east-1"
```

**Compliance:**
- Display "as-of" timestamp for prices ✅ (already handled in code)
- Include disclosure: "As an Amazon Associate I earn from qualifying purchases" ✅ (in footer + articles)
- Don't cache prices >24hrs ✅ (PriceHistory tracks timestamps)

---

## 2️⃣ Best Buy API

**Why:** Fetch products, prices, availability from Best Buy.

**Steps:**
1. Register: https://developer.bestbuy.com/
2. Create an API key (free tier available)

**Add to `.env`:**
```
BESTBUY_API_KEY="your_key_here"
```

---

## 3️⃣ Newegg API (Optional)

**Why:** PC parts & tech deals.

**Steps:**
1. Contact Newegg seller/partner support for API access
2. Receive Seller ID and API key

**Add to `.env`:**
```
NEWEGG_SELLER_ID="your_seller_id"
NEWEGG_API_KEY="your_api_key"
```

---

## 4️⃣ YouTube Data API v3

**Why:** Search and embed product review videos.

**Steps:**
1. Go to https://console.cloud.google.com/
2. Create a new project (or use existing)
3. Enable **YouTube Data API v3**
4. Create credentials → API Key
5. (Optional) Restrict key to YouTube Data API + your domain

**Add to `.env`:**
```
YOUTUBE_API_KEY="AIzaSy..."
```

**Quota:** 10,000 units/day free. Each search = 100 units.

---

## 5️⃣ Twitter/X API v2 (For Auto-Posting)

**Why:** Auto-post deals to Twitter/X.

**Steps:**
1. Apply for developer account: https://developer.twitter.com/
2. Create a new App
3. Generate API Key, Secret, Access Token, Access Secret, Bearer Token
4. Set **Read and Write** permissions

**Add to `.env`:**
```
TWITTER_API_KEY="..."
TWITTER_API_SECRET="..."
TWITTER_ACCESS_TOKEN="..."
TWITTER_ACCESS_SECRET="..."
TWITTER_BEARER_TOKEN="..."
ENABLE_SOCIAL_POSTING="true"
```

**Compliance:**
- Respect rate limits ✅ (queue enforces 15min windows)
- Include #ad or #affiliate in posts ✅ (template includes)
- No automated replies/follows ✅ (only posting deals)

---

## 6️⃣ OpenAI API (Optional, for Article Writer)

**Why:** Generate roundup articles with GPT-4.

**Steps:**
1. Sign up: https://platform.openai.com/
2. Add payment method (pay-as-you-go)
3. Create API key

**Add to `.env`:**
```
OPENAI_API_KEY="sk-proj-..."
```

**Fallback:** Without this key, the Article Writer uses template-based generation (still functional).

---

## 7️⃣ Redis (For BullMQ Job Queues)

**Why:** Schedule CRON jobs (price watchers, social posts).

**Local Dev:**
```bash
# Install Redis (macOS)
brew install redis
brew services start redis

# Or Docker
docker run -d -p 6379:6379 redis:alpine
```

**Add to `.env`:**
```
REDIS_URL="redis://localhost:6379"
```

**Fallback:** Without Redis, jobs run in-memory (not persistent across restarts).

---

## ✅ After Adding Keys

```bash
# Restart dev server to pick up new env vars
npm run dev

# Test adapters (optional)
npm run test:adapters
```

Check the admin dashboard at http://localhost:3000/admin to see real data flowing.

---

## 🛡️ Security Reminders

- ✅ Never commit `.env` to git (already in `.gitignore`)
- ✅ Rotate keys if exposed
- ✅ Use environment variables in production (Vercel, Fly.io, etc.)
- ✅ Enable IP restrictions where available (YouTube, Best Buy APIs)

---

**Questions?** See `docs/ARCHITECTURE.md` for adapter architecture and mock fallback logic.
