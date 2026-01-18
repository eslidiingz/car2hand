/**
 * JWT Authentication Module
 * Implements secure token-based authentication
 */

import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { cookie } from "@elysiajs/cookie";

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
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
export const authGuard = new Elysia({ name: 'auth-guard' })
    .use(jwtPlugin())
    .derive(async ({ jwt, request, set, cookie }) => {
        // Try to get token from Authorization header or cookie
        let token: string | null = null;

        const authHeader = request.headers.get('Authorization');
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else if (cookie?.accessToken) {
            token = String(cookie.accessToken.value);
        }

        if (!token) {
            set.status = 401;
            return {
                auth: null,
                authError: {
                    error: 'Unauthorized',
                    message: 'กรุณาเข้าสู่ระบบ'
                }
            };
        }

        // Check if token is blacklisted
        if (isTokenBlacklisted(token)) {
            set.status = 401;
            return {
                auth: null,
                authError: {
                    error: 'Unauthorized',
                    message: 'Token ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่'
                }
            };
        }

        try {
            const payload = await jwt.verify(token) as JWTPayload | false;

            if (!payload) {
                set.status = 401;
                return {
                    auth: null,
                    authError: {
                        error: 'Unauthorized',
                        message: 'Token หมดอายุ กรุณาเข้าสู่ระบบใหม่'
                    }
                };
            }

            return {
                auth: {
                    userId: payload.userId,
                    email: payload.email,
                    token
                },
                authError: null
            };
        } catch {
            set.status = 401;
            return {
                auth: null,
                authError: {
                    error: 'Unauthorized',
                    message: 'Token ไม่ถูกต้อง'
                }
            };
        }
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
