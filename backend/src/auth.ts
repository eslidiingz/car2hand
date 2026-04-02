/**
 * Authentication Routes with OWASP Security
 * - JWT token-based authentication
 * - Input validation with Zod
 * - Rate limiting for auth endpoints
 * - Secure password hashing
 */

import { Elysia, t } from "elysia";
import prisma from "./db";
import { jwtPlugin, generateAccessToken, blacklistToken, authGuard } from "./jwt";
import { registerSchema, loginSchema, validateInput } from "./validation";
import { sanitizeObject, authRateLimiter, rateLimiter } from "./security";

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
                    message: "อีเมลหรือเบอร์โทรศัพท์นี้ถูกใช้งานแล้ว"
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
                    message: "อีเมลหรือเบอร์โทรศัพท์นี้ถูกใช้งานแล้ว"
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

// Users routes - public endpoints (no auth required)
const usersPublicRoutes = new Elysia({ prefix: "/users" })

    // Get user by ID (public, limited data)
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

// Users routes - protected endpoints (auth required)
const usersProtectedRoutes = new Elysia({ prefix: "/users" })
    .use(authGuard)

    // Get own profile
    .get("/me", async ({ auth, set }) => {

        if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                isActive: true,
                lineUserId: true,
                createdAt: true,
                currentPackage: { select: { name: true, slug: true } },
                packageExpiresAt: true,
            }
        });

        if (!user) {
            set.status = 404;
            return { error: 'Not Found' };
        }
        return { user };
    })

    // Update own profile
    .put("/me", async ({ auth, body, set }) => {

        if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;
        const { fullName, phoneNumber } = body as any;

        try {
            const updated = await prisma.user.update({
                where: { id: userId },
                data: {
                    ...(fullName && { fullName }),
                    ...(phoneNumber && { phoneNumber }),
                },
                select: { id: true, fullName: true, email: true, phoneNumber: true }
            });
            return { message: 'อัปเดตโปรไฟล์สำเร็จ', user: updated };
        } catch {
            set.status = 500;
            return { error: 'ไม่สามารถอัปเดตได้' };
        }
    })

    // Change password (with stricter rate limiting)
    .use(rateLimiter(5))
    .put("/me/password", async ({ auth, body, set }) => {

        if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;
        const { currentPassword, newPassword } = body as any;
        if (!currentPassword || !newPassword) {
            set.status = 400;
            return { error: 'กรุณากรอกข้อมูลให้ครบ' };
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            set.status = 404;
            return { error: 'ไม่พบผู้ใช้' };
        }

        // Verify current password using Bun.password (same as login)
        const isValid = await Bun.password.verify(currentPassword, user.password);
        if (!isValid) {
            set.status = 400;
            return { error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' };
        }

        // Hash new password with same settings as registration
        const hashed = await Bun.password.hash(newPassword, {
            algorithm: 'argon2id',
            memoryCost: 65536,
            timeCost: 3
        });

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashed }
        });

        return { message: 'เปลี่ยนรหัสผ่านสำเร็จ' };
    });

// Combined users routes export
export const usersRoutes = new Elysia()
    .use(usersPublicRoutes)
    .use(usersProtectedRoutes);
