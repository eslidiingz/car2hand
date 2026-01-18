/**
 * Authentication Routes with OWASP Security
 * - JWT token-based authentication
 * - Input validation with Zod
 * - Rate limiting for auth endpoints
 * - Secure password hashing
 */

import { Elysia, t } from "elysia";
import prisma from "./db";
import { jwtPlugin, generateAccessToken, blacklistToken } from "./jwt";
import { registerSchema, loginSchema, validateInput } from "./validation";
import { sanitizeObject, authRateLimiter } from "./security";

export const authRoutes = new Elysia({ prefix: "/auth" })
    .use(jwtPlugin())
    .use(authRateLimiter)

    // Register
    .post("/register", async ({ body, set, jwt }) => {
        try {
            // Validate and sanitize input
            const validatedData = validateInput(registerSchema, body);
            const sanitizedData = sanitizeObject(validatedData);

            const { fullName, email, phoneNumber, password } = sanitizedData;

            // Check if user exists by email
            const existingEmail = await prisma.user.findUnique({
                where: { email }
            });

            if (existingEmail) {
                set.status = 400;
                return {
                    error: 'Registration Failed',
                    message: "อีเมลนี้ถูกใช้งานแล้ว"
                };
            }

            // Check if phone number exists
            const existingPhone = await prisma.user.findFirst({
                where: { phoneNumber }
            });

            if (existingPhone) {
                set.status = 400;
                return {
                    error: 'Registration Failed',
                    message: "เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว"
                };
            }

            // Hash password with secure settings
            const hashedPassword = await Bun.password.hash(password, {
                algorithm: 'argon2id', // Most secure algorithm
                memoryCost: 65536, // 64 MB
                timeCost: 3
            });

            // Create user
            const user = await prisma.user.create({
                data: {
                    fullName,
                    email,
                    phoneNumber,
                    password: hashedPassword,
                }
            });

            // Generate JWT token
            const accessToken = await generateAccessToken(jwt.sign, user.id, user.email);

            return {
                message: "สมัครสมาชิกสำเร็จ",
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    phoneNumber: user.phoneNumber,
                    isActive: user.isActive,
                    createdAt: user.createdAt
                },
                accessToken
            };
        } catch (error: unknown) {
            // Handle validation errors
            if (typeof error === 'object' && error !== null && 'status' in error && (error as { status: number }).status === 400) {
                set.status = 400;
                return error;
            }

            console.error('Registration error:', error);
            set.status = 500;
            return {
                error: 'Server Error',
                message: "เกิดข้อผิดพลาดในระบบ"
            };
        }
    }, {
        body: t.Object({
            fullName: t.String(),
            email: t.String(),
            phoneNumber: t.String(),
            password: t.String()
        })
    })

    // Login
    .post("/login", async ({ body, set, jwt }) => {
        try {
            // Validate input
            const validatedData = validateInput(loginSchema, body);
            const { phoneNumber, password, rememberMe } = validatedData;

            // Find user by phone number
            const user = await prisma.user.findFirst({
                where: { phoneNumber }
            });

            // Use constant-time comparison to prevent timing attacks
            // Even if user doesn't exist, we still "verify" a dummy password
            const dummyHash = await Bun.password.hash('dummy-password-for-timing');
            const passwordToVerify = user?.password || dummyHash;

            const isPasswordValid = await Bun.password.verify(password, passwordToVerify);

            if (!user || !isPasswordValid) {
                // Generic error message to prevent user enumeration
                set.status = 401;
                return {
                    error: 'Authentication Failed',
                    message: "เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง"
                };
            }

            // Check if user is active
            if (!user.isActive) {
                set.status = 403;
                return {
                    error: 'Account Suspended',
                    message: "บัญชีนี้ถูกระงับการใช้งาน"
                };
            }

            // Generate JWT token
            const accessToken = await generateAccessToken(jwt.sign, user.id, user.email);

            return {
                message: "เข้าสู่ระบบสำเร็จ",
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    phoneNumber: user.phoneNumber,
                    isActive: user.isActive,
                    createdAt: user.createdAt
                },
                accessToken,
                expiresIn: rememberMe ? '30d' : '7d'
            };
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'status' in error && (error as { status: number }).status === 400) {
                set.status = 400;
                return error;
            }

            console.error('Login error:', error);
            set.status = 500;
            return {
                error: 'Server Error',
                message: "เกิดข้อผิดพลาดในระบบ"
            };
        }
    }, {
        body: t.Object({
            phoneNumber: t.String(),
            password: t.String(),
            rememberMe: t.Optional(t.Boolean())
        })
    })

    // Logout (blacklist token)
    .post("/logout", async ({ request, set }) => {
        const authHeader = request.headers.get('Authorization');

        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            blacklistToken(token);
        }

        return {
            message: "ออกจากระบบสำเร็จ"
        };
    })

    // Verify token
    .get("/verify", async ({ request, jwt, set }) => {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader?.startsWith('Bearer ')) {
            set.status = 401;
            return {
                valid: false,
                message: "ไม่พบ token"
            };
        }

        const token = authHeader.substring(7);

        try {
            const payload = await jwt.verify(token);

            if (!payload) {
                set.status = 401;
                return {
                    valid: false,
                    message: "token หมดอายุ"
                };
            }

            return {
                valid: true,
                userId: (payload as { userId: string }).userId
            };
        } catch {
            set.status = 401;
            return {
                valid: false,
                message: "token ไม่ถูกต้อง"
            };
        }
    });

// Users routes
export const usersRoutes = new Elysia({ prefix: "/users" })
    .get("/:id", async ({ params, set }) => {
        const { id } = params;

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            set.status = 400;
            return {
                error: 'Invalid ID',
                message: "รูปแบบ ID ไม่ถูกต้อง"
            };
        }

        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            set.status = 404;
            return {
                error: 'Not Found',
                message: "ไม่พบผู้ใช้"
            };
        }

        // Don't expose sensitive data
        return {
            user: {
                id: user.id,
                fullName: user.fullName,
                // email: user.email, // Don't expose email publicly
                isActive: user.isActive,
                createdAt: user.createdAt
            }
        };
    });
