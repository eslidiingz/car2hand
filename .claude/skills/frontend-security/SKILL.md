---
name: frontend-security
description: |
  Skill for security-related frontend work on the Car2Hand Next.js projects (both frontend and admin).
  Use this skill whenever the user wants to: add route protection, fix XSS vulnerabilities, manage auth tokens,
  configure CSP headers, sanitize user input, add middleware for auth, secure API calls, handle token expiry,
  protect against CSRF, audit frontend security, or improve auth state management.
  Trigger on mentions of: "XSS", "sanitize", "token", "auth", "protected route", "middleware",
  "CSP", "Content Security Policy", "localStorage", "cookie", "input sanitize", "DOMPurify",
  "route guard", "ป้องกัน XSS", "เส้นทางที่ต้องล็อกอิน", "ป้องกันการโจมตี", "ความปลอดภัยหน้าเว็บ",
  "token หมดอายุ", "ล็อกอิน", "ออกจากระบบ", or any request involving frontend/admin security.
---

# Car2Hand Frontend Security

You are a frontend security specialist for the **Car2Hand** platform — a Thai used-car marketplace with two Next.js 16 App Router projects: a public frontend and an admin dashboard.

## Architecture Overview

| Aspect | Frontend (`/frontend`) | Admin (`/admin`) |
|--------|----------------------|-----------------|
| Token storage | `localStorage` / `sessionStorage` key `user` (full user object + token) | `localStorage` keys `admin_token` + `admin_user` |
| API client | Scattered `fetch()` across contexts | Centralized `apiFetch()` in `admin/src/lib/api.ts` |
| Route protection | Client-side check in `ProfileLayout` | Client-side in `AuthContext` redirect |
| middleware.ts | **None** | **None** |
| CSP headers | **None** | **None** |
| XSS sanitization | **None** (relies on React auto-escaping) | **None** |
| dangerouslySetInnerHTML | Not used | Not used |

## Before You Start

1. **Identify the target project** — frontend vs admin have different auth patterns
2. **Read the existing auth flow** before modifying — changes can break login/logout across the app
3. **Never store sensitive data in localStorage** without understanding XSS implications
4. **Always sanitize user-generated content** before rendering as HTML
5. **Backend validation is the real defense** — client-side validation is UX, not security

## Auth Flow — Frontend

### Login / Token Storage

`frontend/src/components/LoginModal.tsx` handles login:

```typescript
// After successful login API call:
const userData = { id, fullName, email, phoneNumber, accessToken };

if (rememberMe) {
    localStorage.setItem('user', JSON.stringify(userData));
} else {
    sessionStorage.setItem('user', JSON.stringify(userData));
}

// Dispatch event for other components
window.dispatchEvent(new Event('userLogin'));
```

### Reading Auth State

The pattern used across 20+ files to get the current user:

```typescript
const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
const user = stored ? JSON.parse(stored) : null;
const token = user?.accessToken;
```

### Making Authenticated API Calls

Frontend scatters fetch calls across contexts (`WishlistContext`, `ListingContext`, page components):

```typescript
const response = await fetch(`${API_URL}/endpoint`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
});
```

### Logout

`frontend/src/components/Navbar.tsx`:

```typescript
localStorage.removeItem('user');
sessionStorage.removeItem('user');
window.dispatchEvent(new Event('userLogout'));
```

### Route Protection — ProfileLayout

`frontend/src/app/profile/layout.tsx` checks auth on mount:

```typescript
useEffect(() => {
    const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!stored) {
        router.push('/');
        return;
    }
    // Set user state...
}, []);
```

**Limitation:** Client-side only — the page briefly renders before redirect. No server-side protection.

## Auth Flow — Admin

### Login / Token Storage

`admin/src/contexts/AuthContext.tsx`:

```typescript
// After successful login:
localStorage.setItem('admin_token', data.accessToken);
localStorage.setItem('admin_user', JSON.stringify(data.admin));
```

### Centralized API Client

`admin/src/lib/api.ts` provides `apiFetch()` — auto-attaches Bearer token:

```typescript
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined'
        ? localStorage.getItem('admin_token') : null;

    const headers: Record<string, string> = {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        // ... content-type handling
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Something went wrong');
    }
    return response.json();
}
```

### Route Protection — AuthContext

`admin/src/contexts/AuthContext.tsx` redirects unauthenticated users:

```typescript
useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token && pathname !== '/login') {
        router.push('/login');
    }
}, [pathname]);
```

## XSS Prevention

### Current Protections

- React auto-escapes text content in JSX (`{variable}` is safe)
- No `dangerouslySetInnerHTML` usage found (good baseline)
- Backend applies `sanitizeObject()` to stored data

### Rules

1. **Never use `dangerouslySetInnerHTML`** without sanitization
2. If rendering HTML content becomes necessary, use `isomorphic-dompurify`:

```typescript
import DOMPurify from 'isomorphic-dompurify';

function SafeHTML({ html }: { html: string }) {
    return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />;
}
```

3. **Never interpolate user content** into `href`, `src`, or event handlers without validation
4. **URL validation** — always check protocol before rendering user-provided URLs:

```typescript
function isSafeUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
        return false;
    }
}
```

5. **react-markdown** (used for articles) — ensure no HTML passthrough without sanitization

## API Call Security Patterns

### Recommended: Centralized API Client for Frontend

The admin project has `apiFetch` — frontend should replicate this pattern:

```typescript
// frontend/src/lib/api.ts (recommended — does not exist yet)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function apiFetch<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
    const token = stored ? JSON.parse(stored).accessToken : null;

    const isFormData = options.body instanceof FormData;
    const headers: Record<string, string> = {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: { ...headers, ...Object.fromEntries(
            Object.entries(options.headers || {}).map(([k, v]) => [k, String(v)])
        )},
    });

    if (response.status === 401) {
        // Token expired — clear storage, redirect to login
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        window.dispatchEvent(new Event('userLogout'));
        throw new Error('กรุณาเข้าสู่ระบบใหม่');
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'เกิดข้อผิดพลาด');
    }

    return response.json();
}
```

### API Call Rules

- **Never send tokens in URL query parameters** — use `Authorization` header only
- **Never log tokens** to console in production
- **Handle 401 responses** — auto-clear auth state and redirect
- **Always use HTTPS** in production (env variable `NEXT_PUBLIC_API_URL`)

## Token Security

### Current State

Tokens stored in `localStorage` are vulnerable to XSS:
- Any JavaScript on the page can read `localStorage.getItem('user')`
- Token persists indefinitely (no client-side expiry enforcement)
- Full user object stored alongside token

### Improvement Path

**Level 1 — Minimal (recommended first step):**
- Separate token from user data in storage
- Add client-side expiry check based on JWT `exp` claim
- Auto-clear on expiry

**Level 2 — Better:**
- Use `httpOnly` cookies for token storage (requires backend changes)
- Set `SameSite=Strict` and `Secure` flags
- Backend sets cookie on login response instead of sending token in body

**Level 3 — Best:**
- `httpOnly` cookies + CSRF token
- Server-side session management
- Short-lived access tokens + refresh token rotation

### JWT Expiry Check

```typescript
function isTokenExpired(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
}
```

## Route Protection — Adding Next.js Middleware

### The Problem

Both projects use client-side-only auth checks. This means:
- Protected pages briefly flash before redirect
- Direct URL access shows page content before JavaScript runs
- No server-side enforcement

### Practical Solution

Since tokens are in `localStorage` (not cookies), Next.js middleware cannot access them directly. Two approaches:

**Approach A — Lightweight cookie flag** (recommended):
Set a non-sensitive cookie on login that middleware can check:

```typescript
// On login success:
document.cookie = 'has_session=1; path=/; SameSite=Strict; max-age=604800';

// On logout:
document.cookie = 'has_session=; path=/; max-age=0';
```

```typescript
// frontend/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/profile', '/sell/create', '/sell/edit'];

export function middleware(request: NextRequest) {
    const hasSession = request.cookies.get('has_session');
    const isProtected = PROTECTED_PATHS.some(p =>
        request.nextUrl.pathname.startsWith(p)
    );

    if (isProtected && !hasSession) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/profile/:path*', '/sell/:path*']
};
```

**Approach B — Robust client-side wrapper:**
Centralize the auth check into a reusable component:

```typescript
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function AuthRequired({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (!stored) {
            router.replace('/');
            return;
        }
        const user = JSON.parse(stored);
        if (isTokenExpired(user.accessToken)) {
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
            router.replace('/');
            return;
        }
        setAuthenticated(true);
    }, []);

    if (!authenticated) return null; // or loading spinner
    return <>{children}</>;
}
```

## CSP Headers

### Adding Security Headers via next.config.ts

Neither frontend nor admin configures security headers. Add them:

```typescript
// next.config.ts
const nextConfig = {
    async headers() {
        return [{
            source: '/(.*)',
            headers: [
                { key: 'X-Content-Type-Options', value: 'nosniff' },
                { key: 'X-Frame-Options', value: 'DENY' },
                { key: 'X-XSS-Protection', value: '1; mode=block' },
                { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                {
                    key: 'Content-Security-Policy',
                    value: [
                        "default-src 'self'",
                        "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js needs these
                        `img-src 'self' data: blob: ${process.env.NEXT_PUBLIC_MINIO_URL || 'http://localhost:9000'}`,
                        `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}`,
                        "style-src 'self' 'unsafe-inline'", // Tailwind needs this
                        "font-src 'self' fonts.googleapis.com fonts.gstatic.com",
                    ].join('; ')
                },
                { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
            ],
        }];
    },
};
```

## Input Validation — Client Side

### Share Validation with Backend

Reuse the same Zod schemas for client-side validation. The backend schemas in `backend/src/validation.ts` can be imported or duplicated:

```typescript
// frontend/src/lib/validation.ts
import { z } from 'zod';

// Match backend registerSchema
export const registerSchema = z.object({
    fullName: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
    email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
    phoneNumber: z.string().regex(/^0[0-9]{9}$/, 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก'),
    password: z.string()
        .min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
        .regex(/[A-Z]/, 'ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว')
        .regex(/[a-z]/, 'ต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว')
        .regex(/[0-9]/, 'ต้องมีตัวเลขอย่างน้อย 1 ตัว')
});
```

### File Upload Validation

Validate files before sending to backend:

```typescript
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function validateImageFile(file: File): string | null {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return 'รองรับเฉพาะไฟล์ JPEG, PNG, WebP และ GIF';
    }
    if (file.size > MAX_FILE_SIZE) {
        return 'ขนาดไฟล์ต้องไม่เกิน 10 MB';
    }
    return null; // valid
}
```

## Known Security Gaps

| Issue | Severity | Project | Details |
|-------|----------|---------|---------|
| No `middleware.ts` | **HIGH** | Both | All route protection is client-side only |
| No CSP headers | **HIGH** | Both | `next.config.ts` has no security headers |
| No centralized API client | MEDIUM | Frontend | 20+ files with scattered fetch + auth token logic |
| Token in localStorage | MEDIUM | Both | Accessible to any XSS; no expiry enforcement |
| No auto-logout on 401 | MEDIUM | Both | Expired tokens cause silent API failures |
| No token refresh | MEDIUM | Both | Users must re-login after token expires (7 days) |
| No DOMPurify | LOW | Both | Not needed currently (no HTML rendering), but needed before adding any |

## Security Checklist

For every frontend security change, verify:

- [ ] User-generated content sanitized before rendering (DOMPurify if HTML)
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] Auth tokens not exposed in URLs, logs, or error messages
- [ ] Protected routes have auth checks (at minimum client-side `AuthRequired` wrapper)
- [ ] API calls include `Authorization` header via centralized client
- [ ] 401 responses trigger re-authentication flow (clear storage + redirect)
- [ ] Forms validate input before submission (matching backend Zod schemas)
- [ ] File uploads validated for type and size before sending
- [ ] External URLs validated for safe protocols before rendering in `href`/`src`
- [ ] No sensitive data in `console.log` statements
- [ ] Environment variables: only `NEXT_PUBLIC_*` vars exposed to browser
