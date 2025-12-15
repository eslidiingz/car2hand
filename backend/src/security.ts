/**
 * Security Middleware for OWASP Compliance
 * Implements: Rate Limiting, Security Headers, Request Logging
 */

import { Elysia } from "elysia";

// Rate limiting store (in-memory - use Redis for production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Security configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // max requests per window
const AUTH_RATE_LIMIT_MAX = 10; // stricter limit for auth endpoints

// Clean up expired entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
        if (value.resetAt < now) {
            rateLimitStore.delete(key);
        }
    }
}, 60000);

/**
 * Get client IP address
 */
const getClientIP = (request: Request): string => {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }
    return 'unknown';
};

/**
 * Rate Limiter
 */
export const rateLimiter = (maxRequests: number = RATE_LIMIT_MAX_REQUESTS) => {
    return new Elysia({ name: 'rate-limiter' })
        .derive(({ request, set }) => {
            const ip = getClientIP(request);
            const key = `${ip}:${new URL(request.url).pathname}`;
            const now = Date.now();

            let record = rateLimitStore.get(key);

            if (!record || record.resetAt < now) {
                record = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
                rateLimitStore.set(key, record);
            } else {
                record.count++;
            }

            // Add rate limit headers
            set.headers['X-RateLimit-Limit'] = maxRequests.toString();
            set.headers['X-RateLimit-Remaining'] = Math.max(0, maxRequests - record.count).toString();
            set.headers['X-RateLimit-Reset'] = Math.ceil(record.resetAt / 1000).toString();

            if (record.count > maxRequests) {
                set.status = 429;
                return {
                    error: 'Too Many Requests',
                    message: 'คุณส่งคำขอมากเกินไป กรุณารอสักครู่',
                    retryAfter: Math.ceil((record.resetAt - now) / 1000)
                };
            }

            return {};
        });
};

/**
 * Security Headers (OWASP recommended)
 */
export const securityHeaders = new Elysia({ name: 'security-headers' })
    .onBeforeHandle(({ set }) => {
        // Prevent XSS attacks
        set.headers['X-Content-Type-Options'] = 'nosniff';
        set.headers['X-XSS-Protection'] = '1; mode=block';

        // Prevent clickjacking
        set.headers['X-Frame-Options'] = 'DENY';

        // HTTP Strict Transport Security (for production with HTTPS)
        // set.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';

        // Content Security Policy
        set.headers['Content-Security-Policy'] = "default-src 'self'";

        // Referrer Policy
        set.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';

        // Permissions Policy
        set.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()';
    });

/**
 * Request Logger
 */
export const requestLogger = new Elysia({ name: 'request-logger' })
    .onRequest(({ request }) => {
        const timestamp = new Date().toISOString();
        const method = request.method;
        const url = request.url;
        const ip = getClientIP(request);
        const userAgent = request.headers.get('user-agent') || 'unknown';

        console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - UA: ${userAgent.substring(0, 50)}`);
    })
    .onError(({ error, request }) => {
        const timestamp = new Date().toISOString();
        const method = request.method;
        const url = request.url;
        const ip = getClientIP(request);
        const errorMessage = 'message' in error ? error.message : String(error);

        console.error(`[${timestamp}] ERROR ${method} ${url} - IP: ${ip} - Error: ${errorMessage}`);
    });

/**
 * Auth Rate Limiter (stricter for login/register)
 */
export const authRateLimiter = rateLimiter(AUTH_RATE_LIMIT_MAX);

/**
 * Input Sanitizer - Remove potential XSS
 */
export const sanitizeInput = (input: string): string => {
    if (typeof input !== 'string') return input;

    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .trim();
};

/**
 * Validate and sanitize object fields
 */
export const sanitizeObject = <T extends Record<string, unknown>>(obj: T): T => {
    const sanitized = {} as T;

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            (sanitized as Record<string, unknown>)[key] = sanitizeInput(value);
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            (sanitized as Record<string, unknown>)[key] = sanitizeObject(value as Record<string, unknown>);
        } else {
            (sanitized as Record<string, unknown>)[key] = value;
        }
    }

    return sanitized;
};
