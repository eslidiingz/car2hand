---
name: frontend-design
description: |
  Skill for designing, building, and improving frontend UI for the Car2Hand Next.js projects (both `frontend` and `admin`).
  Use this skill whenever the user wants to: create a new page or screen, build or refactor UI components,
  improve visual design or layout, ensure design consistency, work with the Car2Hand design system,
  add responsive styles, create forms or modals, or adjust spacing/colors/typography.
  Trigger on mentions of: "design", "UI", "component", "page", "layout", "style", "responsive",
  "Tailwind", "สร้างหน้า", "ออกแบบ", "ปรับ UI", "แก้ไข component", "เพิ่มหน้า",
  or any request involving visual frontend work on the Car2Hand project.
---

# Car2Hand Frontend Design

You are a frontend design specialist for the **Car2Hand** platform — a Thai used-car marketplace.
Your job is to design, build, and improve UI across two Next.js projects while maintaining visual consistency and premium quality.

## Architecture Overview

| Aspect | Frontend (`/frontend`) | Admin (`/admin`) |
|--------|----------------------|-----------------|
| Purpose | Public car marketplace (car2hand.com) | Internal admin dashboard |
| Next.js | 16.0.7 | 16.1.1 |
| React | 19.2.0 | 19.2.3 |
| UI Approach | Custom Tailwind components | Radix UI + CVA (shadcn pattern) |
| Icons | Phosphor Icons (primary) + Lucide | Lucide React |
| Theme | Inline CSS variables | oklch CSS variables + next-themes |
| Language | Thai (`lang="th"`) | Thai |
| Font | IBM Plex Sans Thai | IBM Plex Sans Thai |

## Before You Start

1. **Read `FRONTEND_GUIDELINES.md`** at the project root — it defines the canonical design tokens, component patterns, and coding standards for both projects.
2. **Identify which project** the work belongs to (frontend vs admin) and follow that project's patterns.
3. **Read existing components** in the target area before creating new ones — reuse and extend what exists.
4. **Check `globals.css`** for existing utility classes and design tokens before adding new styles.

## Design System

### Brand Colors

```
Primary:  #0F3460  (dark navy blue — buttons, links, branding)
Accent:   #FF6B35  (vibrant orange — CTAs, highlights, hover states)
Surface:  #F4F6F8  (light cool gray — page backgrounds)
Success:  #00C851  (green — success states, positive indicators)
```

Use Tailwind's semantic names: `bg-primary`, `text-accent`, `bg-surface`, `text-success`.
For grays, use Tailwind defaults: `gray-50` through `gray-800`.

### Border Radius Scale

Follow this hierarchy strictly — it creates the premium layered feel:

| Element Type | Class | Size |
|-------------|-------|------|
| Hero / Major sections | `rounded-[40px]` or `rounded-3xl` | 40px / 24px |
| Standard cards | `rounded-3xl` | 24px |
| Inputs, inner content | `rounded-2xl` | 16px |
| Small buttons, badges | `rounded-xl` | 12px |
| Icon buttons | `rounded-full` | circle |

### Spacing

- Card padding: `p-6` or `p-8`
- Standard gap: `gap-4`
- Section gap: `gap-6`
- Form input height: `h-12` (standard), `h-10` (modal/compact)

### Typography

- Font: IBM Plex Sans Thai (weights: 300–700)
- Body text: `text-gray-800`
- Secondary text: `text-gray-500`
- Numbers/prices: use `toLocaleString('th-TH')` for Thai formatting

## Frontend Project Patterns

Read `references/frontend-patterns.md` for detailed component examples and file structure.

Key points:
- All interactive components use `"use client"` directive
- No component library — build with raw Tailwind utility classes
- Use `globals.css` form classes: `.form-input`, `.form-select`, `.form-button`, etc.
- Icons from `@phosphor-icons/react` with weight variants (bold, fill, regular)
- State via React Context (`WishlistContext`, `ListingContext`) and `useState`
- API base: `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'`
- Auth token from `localStorage` user object

### Creating a New Page (Frontend)

```
src/app/[route-name]/page.tsx     — Main page component
src/components/[ComponentName].tsx — Extracted components if needed
```

1. Use Server Components by default; add `"use client"` only when interactivity is needed
2. Follow the existing layout pattern with `<Navbar />` (included via root layout)
3. Use responsive design: mobile-first with `sm:`, `md:`, `lg:` breakpoints
4. Add loading states with skeleton UI

### Creating a Component (Frontend)

```tsx
"use client";

import { useState } from "react";
import { IconName } from "@phosphor-icons/react";

interface MyComponentProps {
  title: string;
  // ... typed props
}

export default function MyComponent({ title }: MyComponentProps) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      {/* Content */}
    </div>
  );
}
```

## Admin Project Patterns

Read `references/admin-patterns.md` for detailed component examples and the shadcn-style setup.

Key points:
- Uses **Radix UI** primitives wrapped in `src/components/ui/` (button, card, dialog, select, table, tabs, etc.)
- **CVA** (class-variance-authority) for component variants
- **`cn()` utility** from `src/lib/utils.ts` for class merging — always use it
- **next-themes** for dark mode support
- **Sonner** for toast notifications
- oklch color space for CSS variables

### Creating a Component (Admin)

```tsx
import { cn } from "@/lib/utils";

interface MyComponentProps {
  className?: string;
  // ... typed props
}

export function MyComponent({ className, ...props }: MyComponentProps) {
  return (
    <div className={cn("rounded-3xl border bg-card p-6", className)} {...props}>
      {/* Content */}
    </div>
  );
}
```

### Using Existing UI Components (Admin)

Always check `src/components/ui/` first. Available primitives:
- `Button` — with variants (default, destructive, outline, secondary, ghost, link)
- `Card`, `CardHeader`, `CardContent`, `CardFooter`
- `Dialog`, `DialogTrigger`, `DialogContent`
- `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `Input`, `Textarea`, `Label`, `Checkbox`
- `DropdownMenu` with items

## Quality Checklist

Before finishing any UI work, verify:

- [ ] **Consistent rounding** — follows the border-radius scale
- [ ] **Proper spacing** — uses the defined padding/gap values
- [ ] **Brand colors** — uses design tokens, not arbitrary hex values
- [ ] **Responsive** — looks good on mobile (375px), tablet (768px), desktop (1280px+)
- [ ] **Thai text** — labels and UI text are in Thai, numbers use Thai locale formatting
- [ ] **Hover/active states** — interactive elements have visual feedback
- [ ] **Loading states** — async content has skeleton or spinner
- [ ] **Accessibility** — semantic HTML, proper ARIA labels, keyboard navigable
- [ ] **TypeScript** — all props are typed, no `any`
- [ ] **Existing patterns** — reuses components and utilities that already exist in the project

## Improving Existing UI

When asked to improve or refactor existing UI:

1. **Read the current code first** — understand what it does and why
2. **Screenshot the current state** via preview tool if available
3. **Identify inconsistencies** against the design system (wrong rounding, spacing, colors)
4. **Make targeted changes** — fix what's actually wrong, don't rewrite everything
5. **Verify visually** — screenshot the result and compare
