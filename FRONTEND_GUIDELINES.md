# Frontend Implementation Principles & Patterns

This document defines the architectural patterns, coding standards, and best practices for the **CAR2Hand** project (both `frontend` and `admin`). All AI agents and developers should adhere to these principles to ensure consistency, maintainability, and performance.

---

## 1. Core Principles

- **Server Components by Default**: Use React Server Components (RSC) for data fetching and static rendering. Only use `"use client"` when interactivity (state, effects, browser APIs) is required.
- **Type Safety Above All**: Use strict TypeScript for all components and utilities. Avoid `any`. Prefer interfaces for prop definitions.
- **Atomic & Modular Components**: Break UI into small, reusable pieces. Use the `components/ui` folder for primitive, design-system-level components.
- **DRY (Don't Repeat Yourself)**: Extract common logic into custom hooks (`src/hooks`) and shared utilities (`src/lib`).
- **Accessibility (a11y)**: Use semantic HTML and ARIA labels. Match the patterns found in Radix UI primitives (already used in `admin`).

---

## 2. Project Structure & Organization

Both projects follow the Next.js **App Router** structure:

```text
src/
├── app/            # Routes, layouts, and pages (App Router)
├── components/     # UI components
│   ├── ui/         # Base/Primitive components (e.g., Button, Input)
│   └── [feature]/  # Feature-specific components
├── contexts/       # React Contexts for global state
├── hooks/          # Custom React hooks
├── lib/            # Shared logic, API clients, and constants
└── types/          # Global TypeScript interfaces
```

---

## 3. UI Consistency & Design Tokens

To ensure a premium and harmonious feel across the application, we follow strict design tokens for spacing and rounding:

### A. Border Radius (Rounding)
All components must use consistent rounding based on their role:
- **Major Sections / Hero Cards**: `rounded-[40px]` or `rounded-3xl` (Use for page-level containers).
- **Standard Cards**: `rounded-3xl` (24px) - Use for `ListingCard`, `QuickCategories` container, and Feature cards.
- **Inputs & Inner Content**: `rounded-2xl` (16px) - Use for `input`, `select`, and nested grouping within cards.
- **Small Elements / Buttons**: `rounded-xl` (12px) - Use for small buttons, badges, and icon backgrounds.
- **Icon Buttons (Circular)**: `rounded-full`.

### B. Spacing & Padding
- **Card Padding**: Use `p-6` or `p-8` for outer cards to ensure breathable space.
- **Gap Scaling**: Use `gap-4` for standard grouping and `gap-6` for larger section spacing.

---

## 4. Styling Patterns (Tailwind CSS 4)

We use **Tailwind CSS 4** for styling.

- **Naming Convention**: Use standard Tailwind classes.
- **Utility for Class Merging**: Always use the `cn` utility (found in `admin/src/lib/utils.ts`) when merging classes or handling conditional styles.
  ```tsx
  import { cn } from "@/lib/utils";

  export function Button({ className, ...props }) {
    return <button className={cn("px-4 py-2 bg-blue-500", className)} {...props} />;
  }
  ```
- **Modern CSS Features**: Embrace CSS variables for theme-wide tokens (primary colors, spacing).

---

## 4. Component Patterns

### Client Components (`"use client"`)
- Use for: Forms, Modals, Interactivity, Browser-only APIs.
- Keep them as "leaves" in the component tree whenever possible.

### Server Components
- Use for: Data fetching, SEO-sensitive content, Layouts.
- Pass data down to Client Components as props.

### Modal & Dialog Pattern

**Destructive confirmations** (delete, cancel, remove, logout): use the shared `frontend/src/components/ConfirmDialog.tsx` — do NOT roll a new inline modal. See `CLAUDE.md → Frontend confirmation dialogs — single source of truth` for usage.

**Other modals** (login, register, multi-step flows, purchase sheets): follow the pattern in `LoginModal.tsx` — `fixed inset-0` + backdrop + `rounded-3xl` container + z-[100]. Manage open state via internal state or URL search params.

**Admin app** uses Radix Dialog (`admin/src/components/ui/dialog.tsx`) + the reusable `DeleteConfirmModal.tsx`. Don't cross-import between admin and frontend.

---

## 5. Data Fetching & API Interactivity

- **Server Actions**: Preferred for mutations (POST, PUT, DELETE).
- **Fetch API**: Use standard `fetch` with proper caching tags and revalidation.
- **Error Handling**: Use `try/catch` in Server Actions and `ErrorBoundary` for UI-level crashes.
- **Loading States**: Use `loading.tsx` and React `Suspense` with skeletons.

---

## 6. Iconography

- **Primary**: `lucide-react`.
- **Secondary**: `@phosphor-icons/react` (currently used in `frontend`).

---

## 7. Development Workflow

- **No Placeholders**: Use `generate_image` or actual assets.
- **Premium UI**: Focus on transitions, hover states, and consistent spacing.
- **Responsive Design**: Mobile-first approach using `sm:`, `md:`, `lg:` prefixes.

---

*Last Updated: 2026-03-14*
