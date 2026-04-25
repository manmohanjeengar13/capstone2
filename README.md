# 🧬 DNA Analyzer

Production-grade GitHub repository health analyzer built with Next.js 14, shadcn/ui, Prisma, Bull, Redis, and Better Auth.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| UI Components | **shadcn/ui** (Radix UI primitives) |
| Forms | React Hook Form + Zod |
| State | Zustand |
| HTTP Client | Axios |
| Package Manager | **pnpm** |
| Auth | Better Auth (GitHub + Google OAuth) |
| ORM | Prisma (PostgreSQL) |
| Queue | Bull + Redis |
| Cache | ioredis |
| Logger | Winston |
| API Docs | Swagger/OpenAPI at /api-docs |

## Quick Start

```bash
# Install with pnpm
pnpm install

# Setup env
cp .env.local .env.local  # fill in values

# Setup database
pnpm prisma:migrate
pnpm prisma:generate

# Run dev (terminal 1)
pnpm dev

# Run worker (terminal 2)
pnpm worker
```

## Environment Variables

```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
BETTER_AUTH_SECRET=min-32-chars
NEXT_PUBLIC_APP_URL=http://localhost:3000
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
ENCRYPTION_KEY=32-hex-chars  # node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

## API Documentation

Visit `/api-docs` for the full Swagger UI, or `/api/docs` for the raw OpenAPI JSON.

## Deployment

- **Next.js app** → Vercel (`pnpm build` command: `prisma generate && next build`)  
- **Worker** → Railway (`pnpm worker`)  
- **Database** → Neon DB (PostgreSQL)  
- **Redis** → Upstash  
