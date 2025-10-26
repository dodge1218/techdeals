# 🚀 VERCEL DEPLOYMENT INSTRUCTIONS

## ✅ GitHub - DONE!
Your code is now on GitHub:
**Repository:** https://github.com/dodge1218/techdeals

---

## 📦 VERCEL DEPLOYMENT - 3 Options

### Option 1: Vercel CLI (Recommended)

```bash
cd /home/uba/techdeals

# Step 1: Login to Vercel
vercel login

# Step 2: Deploy to production
vercel --prod

# Follow the prompts:
# - Set up and deploy: Y
# - Which scope: [Your Vercel account]
# - Link to existing project: N
# - Project name: techdeals
# - Directory: ./
# - Override settings: N
```

---

### Option 2: Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard:**
   https://vercel.com/new

2. **Import Git Repository:**
   - Click "Add New Project"
   - Select "Import Git Repository"
   - Choose GitHub
   - Find: `dodge1218/techdeals`

3. **Configure Project:**
   ```
   Framework Preset: Next.js
   Build Command: pnpm build
   Output Directory: .next
   Install Command: pnpm install
   ```

4. **Add Environment Variables:**
   ```
   ADMIN_PASSWORD=your-secure-password-here
   NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
   DATABASE_URL=file:./prisma/dev.db
   ```

5. **Click "Deploy"**
   - Vercel will build and deploy automatically
   - Takes ~3-5 minutes

---

### Option 3: Vercel for GitHub (Automatic)

1. **Install Vercel GitHub App:**
   https://github.com/apps/vercel

2. **Grant access to `dodge1218/techdeals` repo**

3. **Configure on Vercel Dashboard:**
   - Go to https://vercel.com/dashboard
   - Find imported project
   - Add environment variables
   - Every git push will auto-deploy!

---

## 🔐 REQUIRED ENVIRONMENT VARIABLES

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

```bash
# Required
ADMIN_PASSWORD=change-this-password-now
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app

# Optional (SQLite works by default)
DATABASE_URL=file:./prisma/dev.db

# Optional (for real APIs later)
AMAZON_TAG=yourtag-20
BESTBUY_PROGRAM_ID=your-program
NEWEGG_AFFILIATE_ID=your-affiliate
YOUTUBE_API_KEY=your-key
```

---

## 📋 POST-DEPLOYMENT CHECKLIST

Once deployed, verify:

```bash
# 1. Health check
curl https://your-project.vercel.app/api/health

# 2. Homepage
curl https://your-project.vercel.app

# 3. Admin (with auth)
curl -u admin:your-password https://your-project.vercel.app/api/admin/articles

# 4. Sitemap
curl https://your-project.vercel.app/api/sitemap
```

**Expected Results:**
- Health: `{"status":"ok","database":"connected"}`
- Homepage: HTML response (200 OK)
- Admin: JSON articles list (200 OK)
- Sitemap: XML with URLs

---

## 🚨 KNOWN ISSUES & FIXES

### Issue: Build fails with Turbopack error
**Solution:** Vercel uses Webpack by default (not Turbopack), so it should work fine.

### Issue: Database not seeded
**Solution:** 
```bash
# After first deploy, run:
vercel env pull .env.production
pnpm prisma db push
pnpm db:seed

# Or seed via API:
curl -X POST https://your-project.vercel.app/api/admin/jobs \
  -H "Content-Type: application/json" \
  -d '{"job":"seed-db"}'
```

### Issue: Admin password not working
**Solution:** Double-check ADMIN_PASSWORD environment variable in Vercel dashboard

---

## 🎯 NEXT STEPS AFTER DEPLOYMENT

1. **Change Admin Password**
   - Update ADMIN_PASSWORD in Vercel environment variables
   - Redeploy (or auto-deploys on save)

2. **Setup Custom Domain** (Optional)
   - Vercel Dashboard → Project → Settings → Domains
   - Add your custom domain (e.g., techdeals.com)
   - Update NEXT_PUBLIC_SITE_URL

3. **Enable Monitoring**
   - Vercel Analytics (built-in, free)
   - Uptime Robot: https://uptimerobot.com
   - Monitor: https://your-project.vercel.app/api/health

4. **Submit Sitemap**
   - Google Search Console: https://search.google.com/search-console
   - Add property: https://your-project.vercel.app
   - Submit sitemap: https://your-project.vercel.app/api/sitemap

5. **Setup Background Jobs** (Vercel Cron)
   - Create `/api/cron/deals-radar.ts`
   - Add to `vercel.json`:
     ```json
     {
       "crons": [
         {
           "path": "/api/cron/deals-radar",
           "schedule": "0 * * * *"
         }
       ]
     }
     ```

---

## 📊 DEPLOYMENT STATUS

- [x] Code on GitHub: https://github.com/dodge1218/techdeals
- [ ] Deployed on Vercel: (pending - follow options above)
- [ ] Custom domain configured: (optional)
- [ ] Environment variables set: (required)
- [ ] Monitoring enabled: (recommended)

---

## 🆘 NEED HELP?

**Vercel Documentation:**
- Getting Started: https://vercel.com/docs
- Next.js on Vercel: https://vercel.com/docs/frameworks/nextjs
- Environment Variables: https://vercel.com/docs/projects/environment-variables

**TechDeals Documentation:**
- See DEPLOYMENT.md for complete guide
- See COMMANDS_REFERENCE.md for all commands
- See RECOVERY.md for troubleshooting

---

## ✅ QUICK DEPLOY (Summary)

```bash
# Method 1: CLI
vercel login
cd /home/uba/techdeals
vercel --prod

# Method 2: Dashboard
# Visit: https://vercel.com/new
# Import: github.com/dodge1218/techdeals
# Deploy!

# Method 3: GitHub Integration
# Install: https://github.com/apps/vercel
# Auto-deploys on every push!
```

---

**🎉 Your code is on GitHub! Choose a deployment method above to go live. 🚀**
