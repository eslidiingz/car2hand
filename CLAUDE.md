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

## Navigation & menu — single source of truth

The frontend and admin both have **mobile and desktop menus that must stay in sync**. Never hardcode menu links in individual layouts or navbars — always import from the single source:

### Frontend profile menu (authenticated user)
**Source:** `frontend/src/lib/profileMenu.tsx` → exports `profileMenuItems: ProfileMenuItem[]`

Consumed by:
- `frontend/src/app/profile/layout.tsx` → passes to `<ProfileSidebar>` (desktop rail, `hidden lg:block`)
- `frontend/src/components/Navbar.tsx` → desktop account dropdown **and** mobile slide drawer

🚨 **When adding a new `/profile/*` page**, edit `profileMenuItems` in `lib/profileMenu.tsx` **only**. Do NOT add the `<Link>` in Navbar or anywhere else — all three menus will update automatically.

### Admin navigation
**Source:** `admin/src/components/Sidebar.tsx` → exports `navigation`

Consumed by:
- `Sidebar.tsx` itself (desktop vertical rail, `hidden md:flex` in `DashboardLayout`)
- `admin/src/components/MobileNav.tsx` (mobile drawer opened via hamburger in `Navbar.tsx`)

🚨 **When adding a new admin page**, add one entry to `navigation` in `Sidebar.tsx` **only**. The hamburger-triggered `MobileNav` imports the same array, so mobile and desktop stay identical.

### Public navbar menu (unauthenticated)
`Navbar.tsx` itself contains the public top-level links (ซื้อรถ / ลงขาย / ชุมชน / ความรู้). These appear in two places within the same file (desktop nav + mobile slide menu) — when adding a new top-level route, add it in both blocks inside Navbar.tsx.

### Admin UI: Tabs convention (mandatory)
Canonical reference: `admin/src/app/listings/page.tsx`. All admin list pages (kyc, contact, forum, reports, etc.) MUST follow this exact pattern.

Always use the Radix-based primitive — never custom button pills:
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
```

Two distinct tab levels exist, with different rules:

**1. Main section tabs** — top-level navigation between major sections of a page (e.g. `ประกาศขาย` / `คำขอต่ออายุ` in listings, `กระทู้` / `ความเห็น` in forum).
- ✅ HAS icon (`<Car size={14} className="mr-1.5" />`)
- ✅ May show urgency badge (`bg-amber-500` / `bg-red-500`)
- Use sparingly — only when the page has truly separate sub-pages

**2. Status filter tabs** — filter a single list by status (e.g. `ทั้งหมด` / `รอตรวจสอบ` / `อนุมัติ` / `ปฏิเสธ`).
- ❌ NO icon on any tab
- ✅ `ทั้งหมด` (ALL) is ALWAYS the FIRST tab
- ✅ Optional count badge on actionable statuses (e.g. `PENDING`, `NEW`, `OPEN`) — use `bg-amber-500` for moderate urgency, `bg-red-500` for high urgency
- Plain counts for non-actionable statuses use `<span className="ml-1.5 text-xs opacity-70">{count}</span>`

Example (status filter):
```tsx
<Tabs value={filter} onValueChange={setFilter}>
  <TabsList>
    <TabsTrigger value="ALL">ทั้งหมด</TabsTrigger>
    <TabsTrigger value="PENDING">
      รอตรวจสอบ
      {count > 0 && <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{count}</span>}
    </TabsTrigger>
    <TabsTrigger value="APPROVED">อนุมัติแล้ว</TabsTrigger>
    <TabsTrigger value="REJECTED">ปฏิเสธแล้ว</TabsTrigger>
  </TabsList>
</Tabs>
```

**Rule summary:**
| Aspect | Main tabs | Status filter tabs |
|---|---|---|
| Icon before label | ✅ yes | ❌ no |
| "ทั้งหมด" position | N/A | FIRST |
| Urgency badge | OK | only on actionable status (PENDING/NEW/OPEN) |
| `<Tabs>` wrapper spacing | `className="mb-6"` | `className="mb-6"` |

**Spacing rule:** The `<Tabs>` wrapper ALWAYS uses `className="mb-6"` (never `space-y-*`). This matches the listings page and gives consistent breathing room between the tab bar and the content below. `TabsContent` children may use `space-y-*` internally for multi-section content — that's fine.

✅ For filters with many options (province, category, etc.), use a plain `<select>` styled `h-9 px-3 rounded-lg border border-border bg-background text-sm` alongside the Tabs.

❌ Never build custom button-pill filters (`bg-primary text-primary-foreground` toggles). They look inconsistent.

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
