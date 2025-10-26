# TechDeals - Production-Ready Tech Deals Platform

A comprehensive tech deals aggregator with affiliate link management, article generation, trend analysis, and automated social posting.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup database  
DATABASE_URL="file:./dev.db" npx prisma generate
DATABASE_URL="file:./dev.db" npx prisma db push

# 3. Seed with sample data
DATABASE_URL="file:./dev.db" npx --yes tsx scripts/seed.ts

# 4. Start development server
npm run dev
```

Visit **http://localhost:3000**

## ✨ Features

- **Deal Aggregation**: Amazon, Best Buy, Newegg with affiliate link generation
- **Article Writer**: AI-powered content with 5-10 product links per article  
- **Trend Finder**: Price changes, media mentions, search volume, social signals
- **Price Watching**: Automated alerts system
- **Media Integration**: YouTube video embedding
- **Compliance**: FTC disclosure, Amazon Associates compliant

## 🛠️ Tech Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Prisma ORM (SQLite dev, PostgreSQL prod)
- BullMQ + Redis (background jobs)
- shadcn/ui components
- Provider-agnostic LLM interface (mock included)

## 📚 API Routes

- `GET /api/deals` - List deals (filter by category/retailer)
- `GET /api/articles` - List articles
- `GET /api/trends` - Market signals
- `POST /api/write-article` - Generate content
- `POST /api/price-watch` - Create alert

## 🐳 Docker

```bash
docker-compose up -d
```

## 📝 License

MIT
