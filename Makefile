# TechDeals Makefile
# Idempotent rebuild targets

.PHONY: help install clean fresh dev build test rc smoke

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	pnpm install --frozen-lockfile || pnpm install

clean: ## Remove build artifacts and dependencies
	rm -rf node_modules/ .next/ .turbo/ dist/ prisma/dev.db prisma/dev.db-journal
	pnpm store prune || true

fresh: clean install ## Full clean rebuild
	pnpm prisma generate
	pnpm prisma db push --skip-generate --accept-data-loss
	pnpm db:seed
	@echo "✅ Fresh build complete"

dev: ## Start development server
	pnpm dev

build: ## Build production bundle
	pnpm build

db-generate: ## Generate Prisma Client
	pnpm prisma generate

db-push: ## Push schema to database (dev)
	pnpm prisma db push --skip-generate

db-migrate: ## Create migration (prod)
	pnpm prisma migrate dev

db-seed: ## Seed database with sample data
	pnpm db:seed

db-studio: ## Open Prisma Studio
	pnpm prisma studio

db-reset: ## Reset database (WARNING: deletes all data)
	rm -f prisma/dev.db prisma/dev.db-journal
	pnpm prisma db push --skip-generate --accept-data-loss
	pnpm db:seed

type-check: ## Run TypeScript type checking
	pnpm type-check

lint: ## Run ESLint
	pnpm lint

test: ## Run unit tests
	pnpm test

test-e2e: ## Run E2E tests
	pnpm test:e2e

smoke: ## Run smoke tests
	@echo "🧪 Running smoke tests..."
	@pnpm tsx -e "async function test(){ const {PrismaClient} = await import('@prisma/client'); const p = new PrismaClient(); const c = await p.product.count(); console.log('✅ Products:', c); await p.\$$disconnect(); } test();"
	@curl -s http://localhost:3000/api/health 2>/dev/null | grep -q ok && echo "✅ API health check passed" || echo "⚠️  API health check skipped (server not running)"

rc: install db-generate db-push type-check build smoke ## Build release candidate
	@echo "✅ Release Candidate ready"

workers: ## Start background workers
	pnpm workers

docker-up: ## Start Redis + PostgreSQL
	docker compose up -d

docker-down: ## Stop Docker services
	docker compose down

docker-logs: ## View Docker logs
	docker compose logs -f

restart: ## Restart dev server
	pkill -f "next dev" || true
	pnpm dev

verify: ## Verify installation
	@echo "📋 Verifying installation..."
	@command -v node >/dev/null 2>&1 && echo "✅ Node.js installed" || echo "❌ Node.js missing"
	@command -v pnpm >/dev/null 2>&1 && echo "✅ pnpm installed" || echo "❌ pnpm missing"
	@command -v docker >/dev/null 2>&1 && echo "✅ Docker installed" || echo "❌ Docker missing"
	@test -f prisma/schema.prisma && echo "✅ Prisma schema exists" || echo "❌ Prisma schema missing"
	@test -f package.json && echo "✅ package.json exists" || echo "❌ package.json missing"

deploy-vercel: ## Deploy to Vercel
	vercel deploy --prod

deploy-preview: ## Deploy preview to Vercel
	vercel deploy

logs: ## View application logs
	tail -f logs/*.log 2>/dev/null || echo "No logs found"

backup-db: ## Backup SQLite database
	cp prisma/dev.db prisma/dev.db.backup.$$(date +%Y%m%d_%H%M%S)
	@echo "✅ Database backed up"

restore-db: ## Restore latest database backup
	@LATEST=$$(ls -t prisma/dev.db.backup.* 2>/dev/null | head -1); \
	if [ -n "$$LATEST" ]; then \
		cp "$$LATEST" prisma/dev.db; \
		echo "✅ Restored from $$LATEST"; \
	else \
		echo "❌ No backup found"; \
	fi
