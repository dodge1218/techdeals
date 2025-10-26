# 🎮 TechDeals - Command Reference

Quick reference for all available commands.

---

## 🚀 ESSENTIAL COMMANDS

### Start Development Server
```bash
pnpm dev
# OR
make dev
```
Open http://localhost:3000

### Full Clean Rebuild (Idempotent)
```bash
make fresh
```
Deletes node_modules, rebuilds everything, seeds database.

### Build Release Candidate
```bash
make rc
```
Runs: install → generate → push → typecheck → build → smoke tests

---

## 🗄️ DATABASE COMMANDS

### Generate Prisma Client
```bash
pnpm db:generate
# OR
make db-generate
```

### Push Schema (Development)
```bash
pnpm db:push
# OR
make db-push
```

### Create Migration (Production)
```bash
pnpm db:migrate
# OR
make db-migrate
```

### Seed Database (52 Products)
```bash
pnpm db:seed
```
Uses `prisma/seed-50.ts` by default.

### Reset Database (WARNING: Deletes Data)
```bash
pnpm db:reset
# OR
make db-reset
```

### Open Prisma Studio (GUI)
```bash
pnpm db:studio
# OR
make db-studio
```
Opens http://localhost:5555

---

## 🧪 TESTING & VALIDATION

### Run Smoke Tests
```bash
make smoke
```
Checks:
- Database has products
- API health endpoint (if server running)

### Type Check (No Emit)
```bash
pnpm type-check
# OR
make type-check
```

### Lint Code
```bash
pnpm lint
# OR
make lint
```

### Run Tests (When Added)
```bash
pnpm test
# OR
make test
```

---

## 🐳 DOCKER COMMANDS

### Start Services (Redis + PostgreSQL)
```bash
make docker-up
# OR
docker compose up -d
```

### Stop Services
```bash
make docker-down
# OR
docker compose down
```

### View Logs
```bash
make docker-logs
# OR
docker compose logs -f
```

---

## 🔧 UTILITY COMMANDS

### Clean Build Artifacts
```bash
pnpm clean
# OR
make clean
```
Removes `.next/` and `node_modules/.cache`

### Verify Installation
```bash
make verify
```
Checks:
- Node.js installed
- pnpm installed
- Docker installed (optional)
- Prisma schema exists
- package.json exists

### Backup Database
```bash
make backup-db
```
Creates timestamped backup: `prisma/dev.db.backup.YYYYMMDD_HHMMSS`

### Restore Latest Backup
```bash
make restore-db
```

---

## 🚀 DEPLOYMENT

### Deploy to Vercel (Production)
```bash
make deploy-vercel
# OR
vercel deploy --prod
```

### Deploy Preview
```bash
make deploy-preview
# OR
vercel deploy
```

---

## 🛠️ BACKGROUND WORKERS

### Start Job Workers (Requires Redis)
```bash
pnpm workers
# OR
make workers
```
Runs:
- Price update worker (hourly)
- Trend analysis worker (6h)
- Social post queue

---

## 🔍 INSPECTION COMMANDS

### View Product Count
```bash
pnpm tsx -e "
const {PrismaClient} = require('@prisma/client');
const p = new PrismaClient();
p.product.count().then(c => {
  console.log('Products:', c);
  p.\$disconnect();
});
"
```

### View Latest Deals
```bash
pnpm tsx -e "
const {PrismaClient} = require('@prisma/client');
const p = new PrismaClient();
p.deal.findMany({ take: 5, orderBy: { createdAt: 'desc' } }).then(d => {
  console.log(d.map(x => x.retailer + ': $' + x.price));
  p.\$disconnect();
});
"
```

### Check Database Size
```bash
ls -lh prisma/dev.db
```

### View Git Status
```bash
git status
git log --oneline -5
```

---

## 🐛 TROUBLESHOOTING

### Port 3000 Already in Use
```bash
# Find process
lsof -i :3000

# Kill it
kill -9 <PID>

# OR use different port
PORT=3001 pnpm dev
```

### Prisma Client Out of Sync
```bash
pnpm prisma generate
pnpm dev
```

### Database Locked (SQLite)
```bash
rm prisma/dev.db-journal
pnpm db:push
```

### Module Not Found
```bash
rm -rf node_modules
pnpm install
```

### Next.js Build Fails
```bash
# Use Webpack instead of Turbopack
pnpm build --no-turbo

# OR clean and rebuild
rm -rf .next
pnpm build
```

---

## 📊 ONE-LINERS

### Count Records
```bash
# Products
echo "SELECT COUNT(*) FROM Product;" | sqlite3 prisma/dev.db

# Deals
echo "SELECT COUNT(*) FROM Deal;" | sqlite3 prisma/dev.db

# Articles
echo "SELECT COUNT(*) FROM Article;" | sqlite3 prisma/dev.db
```

### View Product Titles
```bash
echo "SELECT title FROM Product LIMIT 10;" | sqlite3 prisma/dev.db
```

### Check Affiliate Links
```bash
echo "SELECT url FROM Deal WHERE retailer='amazon' LIMIT 5;" | sqlite3 prisma/dev.db
```

---

## 🎯 WORKFLOWS

### Morning Startup
```bash
git pull
pnpm install  # if package.json changed
make dev
```

### After Crash/Failure
```bash
make fresh
```

### Before Committing
```bash
pnpm type-check
pnpm lint
git status
git add -A
git commit -m "Your message"
```

### Production Deploy
```bash
make rc              # Build & test
git push origin main
make deploy-vercel
```

---

## 📚 HELP

### Show Makefile Targets
```bash
make help
```

### View Documentation
- **RECOVERY.md** → Crash recovery playbook
- **QA_RC_CHECKLIST.md** → 100+ test cases
- **ARCHITECTURE.md** → System design
- **PRD.md** → Product requirements

---

**Quick Reference Card:**
```
make dev          # Start server
make fresh        # Clean rebuild
make smoke        # Run tests
pnpm db:studio    # Open DB GUI
make help         # Show all targets
```
