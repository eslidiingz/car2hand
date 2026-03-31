---
name: vercel-react-best-practices
description: |
  Best practices for Vercel deployment and React patterns for the Car2Hand Next.js projects (frontend and admin).
  Use this skill when the user wants to: optimize performance, fix deployment issues on Vercel, configure environment
  variables, improve React rendering behavior, fix hydration errors, set up caching, use next/image correctly,
  optimize bundle size, or follow App Router conventions.
  Trigger on mentions of: "Vercel", "deploy", "build", "performance", "bundle", "cache", "hydration", "server component",
  "client component", "environment variable", "next/image", "optimization", "ปรับ performance", "deploy ขึ้น Vercel",
  "ตั้งค่า env", "build ไม่ผ่าน", or any request involving deployment or React optimization on Car2Hand.
---

# Car2Hand — Vercel & React Best Practices

You are a deployment and performance specialist for **Car2Hand**, a Thai used-car marketplace.
Both projects (`/frontend` and `/admin`) are Next.js App Router apps deployed to Vercel.

## Project Overview

| Project | Purpose | Port (dev) | Next.js |
|---------|---------|-----------|---------|
| `frontend/` | Public marketplace (car2hand.com) | 3000 | 15.x |
| `admin/` | Internal admin dashboard | 3001 | 15.x |
| `backend/` | ElysiaJS API (Bun runtime) | 8000 | — |

---

## Environment Variables

### Naming Rules
- `NEXT_PUBLIC_*` — exposed to the browser bundle. Use **only** for non-secret, client-side config.
- Non-prefixed vars — server-only (never reaches the client).

### Car2Hand Standard Vars

**frontend (`frontend/.env.local`):**
```
NEXT_PUBLIC_API_URL=https://api.car2hand.com/api   # base API URL
NEXT_PUBLIC_SITE_URL=https://car2hand.com
```

**admin (`admin/.env.local`):**
```
NEXT_PUBLIC_API_URL=https://api.car2hand.com/api
NEXT_PUBLIC_ADMIN_URL=https://admin.car2hand.com
```

### Rules
- Never hardcode `http://localhost:8000` — always use `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'` as fallback.
- Set all `NEXT_PUBLIC_*` vars in Vercel project settings under **Environment Variables** for Production/Preview/Development separately.
- Secrets (JWT secret, DB connection string) go in backend `.env`, never in Next.js projects.

---

## Server Components vs Client Components

### Default: Server Component
Every file in `app/` is a Server Component by default. Prefer this when:
- Data fetching with `fetch()` or Prisma
- No interactivity / no browser APIs
- SEO-critical content

### When to add `"use client"`
Add it at the **lowest possible level** — not at the page level if only a small part needs interactivity.

```tsx
// BAD: entire page is a client component just for one button
"use client";
export default function ListingsPage() { ... }

// GOOD: extract only the interactive part
// ListingsPage (Server Component) — fetches data
// DeleteButton.tsx (Client Component) — handles click
```

### Car2Hand Reality
Both projects currently use `"use client"` at page level for most pages because they rely on `localStorage` for auth tokens. This is acceptable given the architecture, but **new pages that don't need auth or interactivity should be Server Components**.

---

## Data Fetching Patterns

### Server Component (preferred for public pages)
```tsx
// app/cars/[id]/page.tsx — Server Component
export default async function CarDetailPage({ params }: { params: { id: string } }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${params.id}`, {
    next: { revalidate: 60 }, // ISR — revalidate every 60s
  });
  const listing = await res.json();
  return <CarDetailView listing={listing} />;
}
```

### Client Component (current Car2Hand pattern — auth required pages)
```tsx
"use client";
const [data, setData] = useState(null);

useEffect(() => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return;
  fetch(`${API_URL}/endpoint`, {
    headers: { Authorization: `Bearer ${user.token}` }
  }).then(r => r.json()).then(setData);
}, []);
```

### API Route Handlers (avoid for Car2Hand — use backend directly)
Car2Hand calls the ElysiaJS backend directly. Do **not** create Next.js API routes (`app/api/`) as a proxy — this adds latency and duplicates logic.

---

## Image Optimization

### Use `next/image` for Static/Known Images
```tsx
import Image from 'next/image';

// For car listing photos (dynamic URLs from backend):
<Image
  src={photo.url}
  alt={listing.title}
  width={800}
  height={600}
  className="object-cover"
  priority={isFirstImage} // add priority for above-the-fold images
/>
```

### `next.config.js` — Allow External Image Domains
```js
// frontend/next.config.js or admin/next.config.js
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.car2hand.com', // Cloudflare R2 / S3 bucket
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
      },
    ],
  },
};
```

### Aspect Ratio for Car Images
Always enforce 4:3 ratio on listing card images:
```tsx
<div className="aspect-[4/3] relative overflow-hidden">
  <Image src={url} alt={alt} fill className="object-cover" />
</div>
```

---

## Caching Strategy

### Static Pages (no auth)
```tsx
// Force static generation
export const dynamic = 'force-static';
export const revalidate = 3600; // 1 hour
```

### Dynamic Pages (auth required — most Car2Hand pages)
```tsx
// Opt out of caching entirely
export const dynamic = 'force-dynamic';
```

### Fetch Cache Options
```tsx
// Revalidate every N seconds (ISR)
fetch(url, { next: { revalidate: 60 } });

// No cache (always fresh)
fetch(url, { cache: 'no-store' });

// Cache indefinitely until manually revalidated
fetch(url, { cache: 'force-cache' });
```

---

## Performance Patterns

### Avoid Waterfalls — Fetch in Parallel
```tsx
// BAD: sequential
const user = await fetchUser(id);
const listings = await fetchListings(user.id);

// GOOD: parallel
const [user, listings] = await Promise.all([
  fetchUser(id),
  fetchListings(id),
]);
```

### Memoize Expensive Callbacks
```tsx
// Only in Client Components — wrap callbacks passed to child components
const handleDelete = useCallback(async (id: string) => {
  await apiFetch(`/listings/${id}`, { method: 'DELETE' });
  setListings(prev => prev.filter(l => l.id !== id));
}, []); // add deps if needed
```

### Avoid Unnecessary Re-renders
```tsx
// BAD: creates new object on every render
<Component config={{ key: 'value' }} />

// GOOD: define outside component or useMemo
const config = useMemo(() => ({ key: 'value' }), []);
<Component config={config} />
```

---

## Vercel Deployment Checklist

Before pushing to production:

- [ ] All `NEXT_PUBLIC_*` env vars are set in Vercel project settings
- [ ] `next.config.js` `images.remotePatterns` includes the production storage domain
- [ ] No `console.log` with sensitive data (tokens, passwords)
- [ ] `dynamic = 'force-dynamic'` on pages that read from `localStorage` or use request headers
- [ ] Large images use `next/image` with `priority` on above-the-fold
- [ ] No hardcoded `localhost` URLs — always env var with fallback
- [ ] `pnpm build` passes locally before pushing

### Build Command (Vercel)
```
# frontend
cd frontend && pnpm build

# admin
cd admin && pnpm build
```

### Output Directory
- frontend: `frontend/.next`
- admin: `admin/.next`

---

## Common Issues & Fixes

### Hydration Mismatch
**Cause:** Server renders different HTML than client (e.g., reading `localStorage` during render).

**Fix:** Use `useEffect` or dynamic import with `ssr: false`:
```tsx
import dynamic from 'next/dynamic';
const ClientOnlyComponent = dynamic(() => import('./MyComponent'), { ssr: false });
```

### `localStorage is not defined` on Server
**Fix:** Always guard `localStorage` access:
```tsx
const user = typeof window !== 'undefined'
  ? JSON.parse(localStorage.getItem('user') || 'null')
  : null;
```
Or better — put it inside `useEffect`.

### Large Bundle Size
**Fix:** Use dynamic imports for heavy components:
```tsx
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <div className="animate-pulse h-48 bg-slate-100 rounded-2xl" />,
});
```

### API CORS Errors on Vercel
**Fix:** In ElysiaJS backend, allow the Vercel preview URL pattern:
```typescript
app.use(cors({
  origin: [
    'https://car2hand.com',
    'https://admin.car2hand.com',
    /\.vercel\.app$/, // allow all Vercel preview deployments
  ],
}));
```
