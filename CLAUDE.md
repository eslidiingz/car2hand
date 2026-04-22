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

### Database migration — drift warning 🚨

As of 2026-04-22 the local schema has drift: **`SellerProfile` model exists in `schema.prisma` but has no corresponding migration file** (it was added via `prisma db push` at some point instead of `migrate dev`). This means:

- `bunx prisma migrate deploy` on a **fresh** target DB (e.g. a new Supabase project) **will FAIL** on the last migration `20260421120000_simplify_kyc_to_2_types` with `relation "seller_profiles" does not exist`.
- Local dev DB still works because `db push` synced it ad-hoc.
- The Supabase `car2hand` project was bootstrapped via `prisma db push --accept-data-loss` (not migrate deploy) — so it has the full 42-table schema but **no `_prisma_migrations` history**. Running `migrate deploy` there now will also fail (try to re-apply all migrations that already exist).

**When you need to fix this**, do one of the following — don't just "try migrate deploy and see":

1. **Create a catch-up migration** for `SellerProfile` + any other drifted models:
   - `bunx prisma migrate dev --create-only --name add_seller_profile_baseline`
   - Inspect the generated SQL, keep only the missing `CREATE TABLE seller_profiles` / related enums
   - Commit it **before** `20260421120000_simplify_kyc_to_2_types`
2. **Then** reconcile deployed environments with `prisma migrate resolve --applied <name>` for each migration already in their DB.

For a **brand-new environment** (new Supabase project, fresh CI test DB), the current quick path is:
```bash
bunx prisma db push --accept-data-loss     # sync schema without migration history
bunx prisma generate
bun run prisma/seed.ts                      # + seed-master-data, seed-categories, seed-forum-categories, seed-admin
```

**Never commit** new migrations without first resolving the drift above — otherwise you'll stack a broken chain on top of a broken chain.

### Supabase deployment

- Connection strings live in `backend/.env` as `DATABASE_URL` (pooler, port 6543, pgbouncer=true) and `DIRECT_URL` (direct, port 5432).
- Runtime (Elysia app) uses the pooler URL for connection reuse.
- **Migrations require the DIRECT URL** — pgbouncer transaction mode drops the advisory lock Prisma uses to serialize migrations. When running `prisma db push` / `migrate deploy` against Supabase, set `DATABASE_URL` to the **DIRECT** URL for the duration of the command, e.g.:
  ```bash
  DATABASE_URL="$DIRECT_URL" bunx prisma db push
  ```
- `bun run prisma/seed-master-data.ts` against Supabase takes ~5 minutes (~1800 rows across brands/models/sub-models through the pooler). The seed script is idempotent (upserts), so rerunning is safe.

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

### Frontend confirmation dialogs — single source of truth

**Canonical component**: `frontend/src/components/ConfirmDialog.tsx`

🚨 **For any "are you sure?" destructive-action prompt** (delete, cancel, remove, logout, etc.) on the public frontend, use `<ConfirmDialog>`. Do NOT write a new inline `fixed inset-0` modal — visual consistency matters more than the 20 lines you save.

```tsx
import ConfirmDialog from '@/components/ConfirmDialog';
import { Trash } from 'lucide-react';

<ConfirmDialog
  open={!!target}
  onClose={() => setTarget(null)}
  onConfirm={async () => { await doIt(); setTarget(null); }}
  icon={<Trash size={28} />}         // defaults to AlertTriangle
  title="ลบประกาศ"
  description="แน่ใจหรือไม่ว่าต้องการลบ?"
  confirmLabel="ลบประกาศ"              // defaults to "ยืนยัน"
  cancelLabel="ยกเลิก"                 // defaults to "ยกเลิก"
  variant="danger"                    // "danger" (red) | "warning" (amber)
  loading={deleting}                   // disables buttons + shows spinner
/>
```

Consumers today (must stay in sync — do not divergent re-roll):
- `components/verify/VerifyContent.tsx` — cancel pending KYC submission
- `app/profile/wishlist/page.tsx` — remove one / clear all wishlist
- `app/profile/listings/page.tsx` — delete listing
- `app/profile/garage/page.tsx` — delete vehicle / service / reminder
- `app/buy/compare/page.tsx` — clear compare list
- `components/Navbar.tsx` + `app/profile/layout.tsx` — logout confirmation

**Exception — the admin app** has its own `admin/src/components/DeleteConfirmModal.tsx` built on Radix Dialog. Use that one inside admin; use `ConfirmDialog` inside frontend. Do not cross-import.

**Non-trivial confirms stay custom**: multi-step flows (e.g. the settings page "delete account" email-code confirmation) do not fit the simple dialog API and keep their inline JSX.

### Frontend tabs — URL-driven state convention

Every top-level tab on the **public frontend** (not modal-internal tabs) must sync with `?tab=xxx` on the URL. This gives us shareable deep-links (e.g. "ยืนยัน KYC" banner → `/profile/settings?tab=verify`), honest browser back-button behaviour, and bookmarkable state.

**Pattern** — URL is the source of truth, state is derived:

```tsx
"use client";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const VALID_TABS = new Set(['profile', 'security', 'notifications', 'verify', 'shop']);
const DEFAULT_TAB = 'profile';

export default function SettingsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const tabFromUrl = searchParams.get('tab');
    const activeTab = tabFromUrl && VALID_TABS.has(tabFromUrl) ? tabFromUrl : DEFAULT_TAB;

    const setActiveTab = useCallback((tab: string) => {
        if (!VALID_TABS.has(tab)) return;
        const params = new URLSearchParams(searchParams.toString());
        if (tab === DEFAULT_TAB) {
            params.delete('tab');               // keep the default URL clean
        } else {
            params.set('tab', tab);
        }
        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, [pathname, router, searchParams]);

    // ...use activeTab/setActiveTab exactly as before
}
```

**Rules:**
- Use `router.replace` (not `push`) so tab switches don't pollute history — use Back button to leave the page, not to undo tab clicks.
- Always include `{ scroll: false }` — stop the browser from jumping to top on tab change.
- Strip `tab=<DEFAULT_TAB>` from the URL so `/profile/settings` and `/profile/settings?tab=profile` don't both appear in history.
- Validate values from `searchParams` against an allow-list before using — never trust raw URL input.
- Do NOT use `useState` for the active tab. Deriving from URL every render is cheap and keeps state in one place.

**Where applied today** (keep consistent — same pattern, not a duplicate recipe):
- `app/profile/settings/page.tsx` — profile / security / notifications / verify / shop
- `app/community/page.tsx` — trending / latest / unanswered

**Skip URL sync** for:
- Modal-internal tabs (e.g. garage vehicle detail drawer's "ประวัติซ่อม / แจ้งเตือน") — their parent context is transient.
- Admin pages — use the existing Radix `<Tabs>` pattern (tabs convention section below). URL sync is fine to add there too, but not required yet.

### Admin approve / reject buttons — CTA convention

Any admin screen where the operator approves or rejects something (KYC / listings / renewals / packages / contact requests / reports) MUST follow this button pair pattern:

```tsx
// Approve — primary CTA, filled green
<Button
  className="flex-1 font-medium bg-emerald-600 hover:bg-emerald-700 text-white"
  onClick={handleApprove}
>
  <Check size={16} /> อนุมัติ
</Button>

// Reject — destructive filled red (shadcn variant)
<Button
  variant="destructive"
  className="flex-1 font-medium"
  onClick={handleReject}
>
  <XCircle size={16} /> ปฏิเสธ
</Button>
```

- **Approve = green** (`bg-emerald-600 hover:bg-emerald-700 text-white`) — the happy-path primary action.
- **Reject = red destructive** (`variant="destructive"`) — visually destructive, never a neutral outline.
- **Order**: follow the screen's existing convention. Card-level action rows conventionally go approve → reject; sticky bottom bars on a detail drawer often go reject → approve. Don't flip existing screens just to match sibling pages — consistency WITHIN a page matters more than across pages.
- Icons: `Check` / `CheckCircle` for approve, `XCircle` / `X` for reject.
- Never use `variant="outline"` or default black primary for these — approve/reject must be visually distinct from neutral actions.

Canonical references: `admin/src/app/listings/page.tsx` (PENDING action row + confirm modal), `admin/src/app/kyc/page.tsx` (sticky bottom bar), `admin/src/app/packages/page.tsx` (transactions + slot-purchases). If you see a plain outline "ปฏิเสธ" or a default-black "อนุมัติ" anywhere, fix it.

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
