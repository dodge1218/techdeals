# 🔧 TechDeals Crash Recovery Playbook

**Version:** 1.0  
**Last Updated:** 2025-10-26

---

## 🚨 EMERGENCY RECOVERY (Run This First)

```bash
cd /home/uba/techdeals

# 1. Verify Git integrity
git status
git fsck --full
git reflog --date=iso | head -20
git stash list

# 2. Clean broken state
rm -rf node_modules/ .next/ .turbo/ dist/
pnpm store prune || npm cache clean --force

# 3. Reinstall dependencies
pnpm install --frozen-lockfile || pnpm install

# 4. Rebuild database
pnpm prisma generate
pnpm prisma db push --skip-generate
pnpm db:seed

# 5. Start dev server
pnpm dev
```

**Expected Output:**
```
✓ Prisma schema loaded from prisma/schema.prisma
✓ Generated Prisma Client (3 ms)
✓ Database synchronized
✓ Seeded 50 products, 150 offers, 10 articles
▲ Next.js 16.0.0
- Local:        http://localhost:3000
```

---

## 📂 ARTIFACT LOCATOR (Find Lost Work)

### Documentation
```bash
ls -la docs/*.md
# PRD.md, ARCHITECTURE.md, DATA_MODELS.md, ROADMAP.md, TEST_STRATEGY.md
```

### Source Code
```bash
tree -L 3 -I node_modules
# app/          → Next.js pages
# lib/          → Core libraries
# components/   → React components
# prisma/       → Database schema + migrations
# scripts/      → Seed scripts
```

### Git History Recovery
```bash
# Find lost commits
git reflog --date=iso

# Restore lost file from reflog
git show <reflog-hash>:path/to/file.ts > file.ts

# Restore entire directory
git checkout <reflog-hash> -- app/
```

### Database State
```bash
# Inspect current schema
pnpm prisma studio
# → Opens http://localhost:5555

# Export data
pnpm prisma db execute --stdin < backup.sql
```

---

## 🛠️ IDEMPOTENT REBUILD COMMANDS

### Full Clean Rebuild
```bash
make fresh
# OR manually:
rm -rf node_modules/ .next/ prisma/dev.db
pnpm install
pnpm prisma generate && pnpm prisma db push
pnpm db:seed
pnpm build
```

### Release Candidate Build
```bash
make rc
# Runs: typecheck → test → build → smoke tests
```

### Development Mode
```bash
make dev
# Starts: web (3000), workers (background), Redis (6379)
```

---

## 📋 SMOKE TESTS (Verify Recovery)

### 1. Database Connection
```bash
pnpm prisma db execute --stdin <<< "SELECT COUNT(*) FROM Product;"
# Expected: 50
```

### 2. Web Server Health
```bash
curl http://localhost:3000/api/health
# Expected: {"status":"ok","db":true,"redis":true}
```

### 3. Product Pages Render
```bash
curl -s http://localhost:3000 | grep -o "<title>.*</title>"
# Expected: <title>TechDeals - Best Tech Deals</title>
```

### 4. Affiliate Links Valid
```bash
pnpm tsx -e "
import { buildAmazonLink } from './lib/affiliate';
console.log(buildAmazonLink('B09XYZ123', 'techdeals-20', 'crypto-miners'));
"
# Expected: https://amazon.com/...?tag=techdeals-20&utm_source=techdeals...
```

### 5. Prisma Client Works
```bash
pnpm tsx -e "
import { prisma } from './lib/db';
const count = await prisma.product.count();
console.log('Products:', count);
await prisma.\$disconnect();
"
# Expected: Products: 50
```

---

## 🔐 SECRETS MANAGEMENT

### .env.sample → .env
```bash
cp .env.sample .env
# Edit .env with real keys (or leave mocks)
```

### Required Variables (Mocks Work)
- `DATABASE_URL` → SQLite by default
- `REDIS_URL` → Optional (jobs disabled if missing)
- All API keys → Adapters fall back to mocks

### Never Commit
```bash
# Already in .gitignore:
.env
.env.local
.env.*.local
*.db
*.db-journal
```

---

## 🚦 COMMON FAILURE MODES

### Issue: `prisma generate` fails
```bash
# Fix: Clear cache
rm -rf node_modules/.prisma
pnpm prisma generate --force
```

### Issue: Port 3000 already in use
```bash
# Find process
lsof -i :3000
# Kill it
kill -9 <PID>
# OR use different port
PORT=3001 pnpm dev
```

### Issue: Redis connection failed
```bash
# Start Redis in Docker
docker run -d --name redis -p 6379:6379 redis:alpine
# OR disable jobs
export ENABLE_JOBS=false
pnpm dev
```

### Issue: Next.js build fails (Turbopack)
```bash
# Workaround: Use Webpack
pnpm build --no-turbo
# OR deploy to Vercel (handles automatically)
```

### Issue: Database locked (SQLite)
```bash
# Kill all connections
rm prisma/dev.db-journal
# Restart
pnpm prisma db push
```

---

## 📊 STATE VERIFICATION CHECKLIST

- [ ] `git status` shows clean working tree (or known changes)
- [ ] `pnpm install` completes without errors
- [ ] `pnpm prisma generate` succeeds
- [ ] `prisma/dev.db` exists and has 10+ tables
- [ ] `SELECT COUNT(*) FROM Product` returns 50+
- [ ] `pnpm dev` starts without crashes
- [ ] `curl http://localhost:3000` returns HTML
- [ ] `curl http://localhost:3000/api/health` returns `{"status":"ok"}`
- [ ] No TypeScript errors: `pnpm type-check`
- [ ] No ESLint errors: `pnpm lint`

---

## 🔄 REBUILD FROM SCRATCH (Nuclear Option)

```bash
# 1. Save custom changes
git stash

# 2. Reset to last known good commit
git reset --hard HEAD~1  # or specific commit

# 3. Full rebuild
make fresh

# 4. Restore changes
git stash pop

# 5. Verify
make smoke
```

---

## 📞 EMERGENCY CONTACTS (Documentation)

- **PRD:** Product requirements → `PRD.md`
- **Architecture:** System design → `ARCHITECTURE.md`
- **Data Models:** Schema reference → `DATA_MODELS.md`
- **Roadmap:** Sprint plan → `ROADMAP.md`
- **Tests:** Strategy → `TEST_STRATEGY.md`
- **Delivery:** Status → `DELIVERY_SUMMARY.md`

---

## 🎯 ONE-COMMAND REBUILD

```bash
# Clone + Setup + Run
git clone <repo> techdeals
cd techdeals
make fresh && make dev
```

---

**Recovery Time Objective (RTO):** 5 minutes  
**Recovery Point Objective (RPO):** Last git commit + stash
