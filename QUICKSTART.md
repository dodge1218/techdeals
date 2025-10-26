# ⚡ TechDeals - Quick Start Guide

**Ship NOW, optimize later! All systems use mocks by default.**

## 🚀 Launch in 30 Seconds

```bash
# 1. Install
npm install

# 2. Setup database
export DATABASE_URL="file:./dev.sqlite"
npx prisma generate
npx prisma db push  
npx tsx prisma/seed.ts

# 3. Run dev server
npm run dev
# → Open http://localhost:3000
```

## ✅ What's Working NOW

✓ Home Page - Trending products  
✓ Product Pages - Affiliate links with mocks  
✓ Video Embeds - YouTube (mock)  
✓ Trend Finder - Price signals  
✓ Admin Dashboard - Stats  
✓ Database - SQLite + seed data  

## 🔧 All Services Running with Mocks

Amazon PA-API, Best Buy, Newegg, YouTube, OpenAI, Twitter - all functional with example keys.

## 📖 Try These URLs

- `/` - Home  
- `/products/product-gpu-1` - Product detail  
- `/trends` - Trends  
- `/admin` - Dashboard  

## 🔑 Add Real Keys Later

See `TODO.md` for API key setup checklist.

## 🎉 You're Live in Dev Mode!

**Note**: Production build has known Next.js 16 Turbopack issue. Deploy to Vercel or use dev mode.
