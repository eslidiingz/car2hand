# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project: Car2Hand

Thai used-car marketplace (รถมือสอง). Three surfaces share one backend:

- `backend/` — ElysiaJS API on Bun + Prisma + Postgres (port **8000**)
- `frontend/` — Next.js 16 App Router — public marketplace (port **3000**)
- `admin/` — Next.js 16 App Router — admin console (port **3001**)
- `docker-compose.yml` — MinIO object storage (ports 9000/9001, buckets `uploads`, `brands`)

User journeys: **buyers**, **sellers**, **gurus** (community). See `sitemap.md` and `appdir.md`.

## Commands

From repo root:

```bash
npm run dev              # runs backend + frontend + admin concurrently
npm run dev:backend      # bun dev (backend)
npm run dev:frontend     # pnpm dev (frontend, :3000)
npm run dev:admin        # pnpm dev (admin, :3001)
```

Backend (in `backend/`):
```bash
bun dev                  # watch mode
bun test                 # run tests (src/__tests__)
bunx prisma migrate dev  # apply schema changes
bunx prisma db seed      # seed data (seed.ts, seed-admin, seed-categories, seed-forum-categories, seed-master-data)
```

Package manager: **pnpm** for frontend/admin, **bun** for backend. Do not mix.

## Backend architecture

Entry: `backend/src/index.ts` — registers global security middleware (`requestLogger`, `securityHeaders`, `rateLimiter(100/min/IP)`), CORS (allowed origins from env `FRONTEND_URL`/`ADMIN_URL` + localhost 3000/3001), then groups all routes under `/api`.

Layered pattern (per `BACKEND_GUIDELINES.md`):
- **Routes** (`src/*.ts` — e.g. `auth.ts`, `listings.ts`, `admin.ts`): HTTP + Zod validation, delegate to services. No business logic.
- **Services**: business logic, orchestration.
- **DB**: Prisma client in `src/db.ts`; schema in `prisma/schema.prisma`; generated client output goes to `src/generated/client` (non-default location — import from there).

Cross-cutting:
- Auth: `@elysiajs/jwt` + `jsonwebtoken`, `Bun.password` for hashing. LINE Login integration in `line-auth.ts` / `line-webhook.ts` / `line.ts`.
- Storage: MinIO via `storage.ts` (see `docker-compose.yml` for local). Image processing via `sharp`.
- Real-time: SSE routes in `admin-sse.ts` (admin + user streams).
- Crons: `src/crons/` — started from `index.ts` (`startPackageExpiryCrons`).
- Error handling: global `.onError` in `index.ts` returns Thai-language error messages for `INTERNAL_SERVER_ERROR`, `NOT_FOUND`, `VALIDATION`.

Domain entities (Prisma): `User`, `SellerProfile`, `VehicleListing`, `Package`/`PackageTransaction`/`ListingRenewal`/`ListingBumpLog`, `Wishlist`, `GarageVehicle`, `InspectionBooking`, `ServiceInquiry`, `ForumPost`/`ForumComment`/`ForumVote`, `UserNotification`. Showroom types: `INDIVIDUAL`, `TENT`, `DEALER`.

## Frontend & admin architecture

Both are Next.js 16 App Router + React 19 + Tailwind 4 + TypeScript strict. Structure:

```
src/
├── app/         # routes (App Router)
├── components/  # ui/ primitives + feature components
├── contexts/    # React Contexts
├── hooks/       # custom hooks (admin only; frontend has lib/)
├── lib/         # utils, API clients, constants
└── middleware.ts
```

- **RSC by default**; add `"use client"` only for interactivity. Keep client components as leaves.
- **Server Actions** preferred for mutations.
- **Admin** uses Radix UI primitives + `class-variance-authority` + `cn` util from `lib/utils.ts` + `sonner` for toasts + `next-themes`.
- **Frontend** uses both `lucide-react` and `@phosphor-icons/react` (migration to Lucide in progress — prefer Lucide for new code).

### Design system (see `frontend/DESIGN.md` and `FRONTEND_GUIDELINES.md`)

Brand tokens: `primary #0F3460`, `accent #FF6B35`, `surface #F4F6F8`. Font: **IBM Plex Sans Thai**.

Rounding ladder — **bigger container = bigger radius**:
- `rounded-3xl` (24px) — cards, modals, major containers
- `rounded-2xl` (16px) — feature cards, dropdowns, logo containers
- `rounded-xl` (12px) — inputs, standard buttons
- `rounded-full` — pill badges, icon buttons

Shadows: `shadow-sm` default, `shadow-xl` on hover, `shadow-2xl` for modals. Card hover: `hover:shadow-xl hover:-translate-y-1 transition duration-300`.

Format prices with `toLocaleString('th-TH')`. Most copy is Thai — preserve Thai strings when editing.

Z-index ladder: cards `z-10`, navbar `z-50`, mobile menu `z-[60]`, modals `z-[100]`, toasts `z-[9999]`.

## Conventions

- **Type safety**: no `any`. Use Prisma-generated types + Zod for validation at API boundaries.
- **Naming**: descriptive, no abbreviations (`userRepository`, not `uRepo`).
- **Do not** commit `.env` — use `.env.example`.
- Mobile-first responsive (`sm:` 640, `md:` 768, `lg:` 1024).
- Use the `cn` utility when merging Tailwind classes conditionally.

## Repo-specific skills available

- `backend-security` — auth, validation, uploads, rate-limiting work on the Elysia API
- `frontend-security` — route protection, XSS, auth tokens, CSP for the Next.js apps
- `frontend-design` — UI/page/component work for `frontend` and `admin`

Invoke via the Skill tool when the task matches.
