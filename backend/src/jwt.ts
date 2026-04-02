/**
 * JWT Authentication Module
 * Implements secure token-based authentication
 */

import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { cookie } from "@elysiajs/cookie";

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required. Set it in .env file.');
}
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days
const JWT_REFRESH_EXPIRES_IN = '30d'; // Refresh token expires in 30 days

// Token blacklist (use Redis for production)
const tokenBlacklist = new Set<string>();

export interface JWTPayload {
    userId: string;
    email: string;
    iat: number;
    exp: number;
}

/**
 * JWT Plugin Factory for Elysia
 */
export const jwtPlugin = () => new Elysia({ name: 'jwt' })
    .use(
        jwt({
            name: 'jwt',
            secret: JWT_SECRET,
            exp: JWT_EXPIRES_IN
        })
    )
    .use(cookie());

/**
 * Generate access token
 */
export const generateAccessToken = async (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jwtSign: (payload: any) => Promise<string>,
    userId: string,
    email: string
): Promise<string> => {
    return await jwtSign({
        userId,
        email,
        type: 'access'
    });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = async (
    jwtSign: (payload: Record<string, unknown>) => Promise<string>,
    userId: string
): Promise<string> => {
    return await jwtSign({
        userId,
        type: 'refresh',
        exp: JWT_REFRESH_EXPIRES_IN
    });
};

/**
 * Verify token is not blacklisted
 */
export const isTokenBlacklisted = (token: string): boolean => {
    return tokenBlacklist.has(token);
};

/**
 * Add token to blacklist (for logout)
 */
export const blacklistToken = (token: string): void => {
    tokenBlacklist.add(token);

    // Clean up expired tokens periodically (simple implementation)
    if (tokenBlacklist.size > 10000) {
        // In production, tokens should expire naturally
        // This is just a memory safeguard
        const iterator = tokenBlacklist.values();
        for (let i = 0; i < 1000; i++) {
            const token = iterator.next().value;
            if (token) tokenBlacklist.delete(token);
        }
    }
};

/**
 * Auth Guard Middleware
 * Protects routes that require authentication
 */
// Helper to extract and verify JWT from request
async function verifyAuthToken(
    jwtVerify: (token: string) => Promise<JWTPayload | false>,
    request: Request,
    cookie: any
): Promise<{ userId: string; email: string; token: string } | null> {
    let token: string | null = null;

    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    } else if (cookie?.accessToken) {
        token = String(cookie.accessToken.value);
    }

    if (!token || isTokenBlacklisted(token)) return null;

    try {
        const payload = await jwtVerify(token) as JWTPayload | false;
        if (!payload) return null;
        return { userId: payload.userId, email: payload.email, token };
    } catch {
        return null;
    }
}

export { verifyAuthToken };

// authGuard as a function that applies jwt + derive directly to the instance
// This works in Elysia 1.4 where plugin derive doesn't propagate
export function authGuard(app: Elysia<any, any, any, any, any, any, any, any>) {
    return app
        .use(jwtPlugin())
        .derive(async ({ jwt, request, cookie }: any) => {
            const auth = await verifyAuthToken(jwt.verify.bind(jwt), request, cookie);
            return { auth };
        });
}

// Keep plugin version for backward compatibility (used in admin.ts derive pattern)
export const authGuardPlugin = new Elysia({ name: 'auth-guard' })
    .use(jwtPlugin())
    .derive(async ({ jwt, request, set, cookie }) => {
        const auth = await verifyAuthToken(jwt.verify.bind(jwt), request, cookie);
        return { auth };
    });

/**
 * Optional Auth - doesn't block if not authenticated
 */
export const optionalAuth = new Elysia({ name: 'optional-auth' })
    .use(jwtPlugin())
    .derive(async ({ jwt, request, cookie }) => {
        let token: string | null = null;

        const authHeader = request.headers.get('Authorization');
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else if (cookie?.accessToken) {
            token = String(cookie.accessToken.value);
        }

        if (!token || isTokenBlacklisted(token)) {
            return { auth: null };
        }

        try {
            const payload = await jwt.verify(token) as JWTPayload | false;

            if (!payload) {
                return { auth: null };
            }

            return {
                auth: {
                    userId: payload.userId,
                    email: payload.email,
                    token
                }
            };
        } catch {
            return { auth: null };
        }
    });
