---
name: backend-security
description: |
  Skill for security-related backend work on the Car2Hand ElysiaJS/Bun API.
  Use this skill whenever the user wants to: add or modify authentication, create protected routes,
  add input validation, handle file uploads securely, configure rate limiting, fix security vulnerabilities,
  add authorization checks, handle passwords, configure CORS, or audit backend security.
  Trigger on mentions of: "security", "auth", "authentication", "authorization", "JWT", "token",
  "rate limit", "validation", "sanitize", "password", "hash", "upload", "CORS", "OWASP", "middleware",
  "guard", "protect", "ความปลอดภัย", "ยืนยันตัวตน", "สิทธิ์", "ตรวจสอบข้อมูล", "อัพโหลด",
  "รหัสผ่าน", "ป้องกัน", "rate limit", or any request involving backend security.
---

# Car2Hand Backend Security

You are a backend security specialist for the **Car2Hand** platform — a Thai used-car marketplace API built with ElysiaJS on Bun runtime, Prisma ORM, and PostgreSQL.

## Architecture Overview

| Module | File | Purpose |
|--------|------|---------|
| Security middleware | `backend/src/security.ts` | Rate limiting, security headers, request logging, input sanitization |
| JWT auth | `backend/src/jwt.ts` | JWT plugin, token generation, blacklist, `authGuard`, `optionalAuth` |
| Auth routes | `backend/src/auth.ts` | Register, login, logout, verify, LINE OAuth, user CRUD |
| Validation | `backend/src/validation.ts` | Zod schemas, `validateInput()` helper |
| File storage | `backend/src/storage.ts` | MinIO upload with type/size validation, Sharp image processing |
| Admin auth | `backend/src/admin.ts` | Separate admin login flow with own JWT verification |
| App entry | `backend/src/index.ts` | Middleware composition, CORS config |

## Before You Start

1. **Read the existing security module** before changing anything — don't duplicate existing guards
2. **Never bypass validation or sanitization** — all user input must go through Zod + `sanitizeObject()`
3. **Always use Prisma ORM** — never write raw SQL queries
4. **Error messages in Thai** — keep user-facing messages generic to prevent enumeration
5. **Check `backend/src/index.ts`** to see how middleware is composed

## Authentication Patterns

### JWT Flow

The project uses `@elysiajs/jwt` + `@elysiajs/cookie` via the `jwtPlugin()` factory:

```typescript
// backend/src/jwt.ts
export const jwtPlugin = () => new Elysia({ name: 'jwt' })
    .use(jwt({ name: 'jwt', secret: JWT_SECRET, exp: '7d' }))
    .use(cookie());
```

**Token lifecycle:**
- Access token: 7 days (`JWT_EXPIRES_IN`)
- Refresh token: 30 days (`JWT_REFRESH_EXPIRES_IN`)
- Blacklist on logout: `blacklistToken(token)` — in-memory `Set<string>`
- Check blacklist: `isTokenBlacklisted(token)`

### Protecting Routes with `authGuard`

`authGuard` extracts JWT from `Authorization: Bearer <token>` header or `accessToken` cookie, verifies it, and derives `auth` / `authError`:

```typescript
import { authGuard } from "./jwt";

const myRoutes = new Elysia({ prefix: "/my-resource" })
    .use(authGuard)
    .get("/", async ({ auth, authError, set }) => {
        if (authError) {
            set.status = 401;
            return authError;
        }
        // auth.userId and auth.email are available
        const data = await prisma.myModel.findMany({
            where: { userId: auth.userId }
        });
        return data;
    });
```

### Optional Auth (Public + Auth-Enhanced Routes)

For routes that work for everyone but provide extra data for logged-in users:

```typescript
import { optionalAuth } from "./jwt";

const publicRoutes = new Elysia({ prefix: "/listings" })
    .use(optionalAuth)
    .get("/", async ({ auth }) => {
        // auth is null for unauthenticated, { userId, email, token } for authenticated
        const listings = await prisma.listing.findMany();
        return listings;
    });
```

### Password Hashing

Always use **Argon2id** with these exact parameters:

```typescript
// Hashing
const hashedPassword = await Bun.password.hash(password, {
    algorithm: 'argon2id',
    memoryCost: 65536,  // 64 MB
    timeCost: 3
});

// Verification
const isValid = await Bun.password.verify(password, hashedPassword);
```

### Timing Attack Prevention

When a user is not found, **always** hash against a dummy to prevent timing-based enumeration:

```typescript
const dummyHash = '$argon2id$v=19$m=65536,t=3,p=1$...'; // pre-computed dummy

const user = await prisma.user.findUnique({ where: { phoneNumber } });
if (!user) {
    await Bun.password.verify(password, dummyHash); // constant-time
    set.status = 401;
    return { error: 'เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง' };
}
```

Generic error message — never reveal which field (phone or password) is wrong.

### Admin Authentication

Admin uses a **separate auth flow** in `backend/src/admin.ts` with its own JWT verification in `.derive()`:

```typescript
const adminRoutes = new Elysia({ prefix: "/admin" })
    .use(jwtPlugin())
    .derive(async ({ jwt, request, set }) => {
        const authHeader = request.headers.get('Authorization');
        // ... verify token, return { adminId } or set 401
    })
    .onBeforeHandle(({ adminId, set }) => {
        if (!adminId) { set.status = 401; return { error: 'Unauthorized' }; }
    });
```

## Input Validation

### Zod Schemas

All validation schemas live in `backend/src/validation.ts`. Key schemas:

| Schema | Used For |
|--------|----------|
| `registerSchema` | User registration (fullName, email, phoneNumber, password) |
| `loginSchema` | User login (phoneNumber, password, rememberMe) |
| `adminLoginSchema` | Admin login (username, password) |
| `vehicleListingSchema` | Create listing (all vehicle fields with Thai error messages) |
| `updateListingSchema` | Update listing (partial of vehicleListingSchema) |
| `paginationSchema` | Page/limit with coercion and defaults |
| `idParamSchema` | UUID validation for ID params |
| `articleSchema` | Article CRUD |
| `categorySchema` | Category with slug validation |

### Using `validateInput()`

```typescript
import { validateInput, vehicleListingSchema } from "./validation";

// Throws 400 with field-level errors if invalid
const validData = validateInput(vehicleListingSchema, body);
```

Error response format:
```json
{
    "status": 400,
    "error": "Validation Error",
    "message": "ข้อมูลไม่ถูกต้อง",
    "errors": [
        { "field": "price", "message": "ราคาต้องมากกว่า 0" }
    ]
}
```

### Input Sanitization

After validation, sanitize string fields to prevent stored XSS:

```typescript
import { sanitizeObject } from "./security";

const sanitized = sanitizeObject(validData);
// All string fields have < > " ' / escaped
```

### Adding a New Validation Schema

Follow the existing pattern — Thai error messages, sensible limits:

```typescript
export const myNewSchema = z.object({
    name: z.string()
        .min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร')
        .max(100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร'),
    amount: z.number()
        .positive('จำนวนต้องมากกว่า 0')
        .max(1000000, 'จำนวนมากเกินไป')
});

export type MyNewInput = z.infer<typeof myNewSchema>;
```

## Rate Limiting

### Configuration

From `backend/src/security.ts`:
- **General endpoints:** 100 requests/minute per IP per path
- **Auth endpoints:** 10 requests/minute (`authRateLimiter`)
- **Window:** 60 seconds
- **Store:** In-memory `Map` (use Redis for production)

### Usage

```typescript
import { rateLimiter, authRateLimiter } from "./security";

// Apply general rate limiting (100 req/min)
app.use(rateLimiter());

// Apply strict rate limiting to auth routes (10 req/min)
const authRoutes = new Elysia({ prefix: "/auth" })
    .use(authRateLimiter)
    // ... routes
```

### Custom Rate Limit

```typescript
// 5 requests per minute for a sensitive endpoint
const sensitiveRoutes = new Elysia({ prefix: "/sensitive" })
    .use(rateLimiter(5))
```

Response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
Exceeded: returns `429` with Thai message.

## File Upload Security

### Validation Functions (from `backend/src/storage.ts`)

```typescript
isValidImageType(mimeType)  // Whitelist: jpeg, png, webp, gif
isValidFileSize(size, maxMB) // Default max: 10 MB
```

### Image Processing Pipeline

All uploads go through Sharp:
1. Strip EXIF metadata
2. Convert to WebP
3. Resize based on type:
   - Avatar: 400x400 max
   - Listing images: 800px width max + watermark
   - Articles: 960x640 max
4. Generate UUID filename: `{timestamp}-{randomString}.webp`

### Secure Path Structure

Files organized by user to prevent directory traversal:
- `{userId}/avatar/{filename}`
- `{userId}/listings/{listingId}/{filename}`
- `articles/{filename}`

### File Cleanup

```typescript
import { deleteFile, deleteFilesByPrefix } from "./storage";

// Delete single file
await deleteFile("userId/listings/listingId/image.webp");

// Delete all files for a listing
await deleteFilesByPrefix("userId/listings/listingId/");

// Delete all user files
await deleteFilesByPrefix("userId/");
```

## Security Headers

Applied globally via `securityHeaders` in `backend/src/security.ts`:

| Header | Value | Purpose |
|--------|-------|---------|
| X-Content-Type-Options | `nosniff` | Prevent MIME sniffing |
| X-XSS-Protection | `1; mode=block` | Legacy XSS protection |
| X-Frame-Options | `DENY` | Prevent clickjacking |
| Content-Security-Policy | `default-src 'self'` | Restrict resource loading |
| Referrer-Policy | `strict-origin-when-cross-origin` | Control referrer info |
| Permissions-Policy | `geolocation=(), microphone=(), camera=()` | Disable device APIs |

**Production TODO:** Enable HSTS: `Strict-Transport-Security: max-age=31536000; includeSubDomains`

## CORS Configuration

Current config in `backend/src/index.ts`:

```typescript
cors({
    origin: true,  // WARNING: Allows ALL origins
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400
})
```

**Production fix needed:**
```typescript
const ALLOWED_ORIGINS = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:3001'
];

cors({
    origin: ALLOWED_ORIGINS,
    // ... rest same
})
```

## Route Protection Patterns

### Ownership Verification

Always verify the authenticated user owns the resource:

```typescript
const listing = await prisma.listing.findUnique({ where: { id } });

if (!listing) {
    set.status = 404;
    return { error: 'ไม่พบประกาศ' };
}

if (listing.userId !== auth.userId) {
    set.status = 403;
    return { error: 'ไม่มีสิทธิ์เข้าถึง' };
}
```

### Package-Based Access Control

Check user's package tier before allowing features:

```typescript
import { getUserPackage } from "./config/packages";

const userPackage = getUserPackage(user.packageSlug);
const isFreePkg = !userPackage.id;

// Enforce listing limits
if (userListingCount >= userPackage.maxListings) {
    set.status = 403;
    return { error: 'คุณลงประกาศครบจำนวนสิทธิ์แล้ว' };
}

// Strip premium fields for free users
if (isFreePkg) {
    data.facebookUrl = null;
}
```

## Known Security Gaps

| Issue | Severity | Location | Fix |
|-------|----------|----------|-----|
| CORS `origin: true` | **HIGH** | `index.ts` | Use `ALLOWED_ORIGINS` array |
| Rate limit in-memory | MEDIUM | `security.ts` | Use Redis for production |
| Token blacklist in-memory | MEDIUM | `jwt.ts` | Use Redis for persistence across restarts |
| JWT secret fallback | MEDIUM | `jwt.ts:11` | Remove default, require env var |
| HSTS disabled | MEDIUM | `security.ts:91` | Uncomment for HTTPS production |

## Security Checklist

For every new backend endpoint, verify:

- [ ] Route uses `authGuard` (or `optionalAuth` for public routes with auth features)
- [ ] All input validated with Zod schema via `validateInput()`
- [ ] String inputs sanitized with `sanitizeObject()`
- [ ] Resource ownership verified before mutations (`userId === auth.userId`)
- [ ] Sensitive routes use `authRateLimiter` (or custom `rateLimiter(N)`)
- [ ] Passwords hashed with Argon2id (memoryCost: 65536, timeCost: 3)
- [ ] Error messages are generic and in Thai (no information leakage)
- [ ] File uploads validated for type (`isValidImageType`) and size (`isValidFileSize`)
- [ ] UUID params validated with `idParamSchema`
- [ ] No raw SQL — only Prisma ORM queries
- [ ] No sensitive data in response (passwords, internal IDs, etc.)
