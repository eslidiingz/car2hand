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
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, validateInput } from "./validation";
import { sanitizeObject, authRateLimiter, rateLimiter, checkRateLimit } from "./security";
import { sendEmail, renderPasswordResetEmail, renderDeleteAccountEmail } from "./email";
import { uploadAvatar, deleteAvatarFiles, deleteUserFiles, isValidImageType, isValidFileSize } from "./storage";

/**
 * Mask email for display: "j****n@example.com"
 */
function maskEmail(email: string): string {
    const [local, domain] = email.split("@");
    if (!local || !domain) return email;
    if (local.length <= 2) return `${local[0]}*@${domain}`;
    return `${local[0]}${"*".repeat(Math.max(local.length - 2, 1))}${local.slice(-1)}@${domain}`;
}

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
    .post("/login", async ({ body, set, jwt, request }) => {
        // Inline rate limit check for auth endpoints
        const rateLimitResult = checkRateLimit(request, 10);
        if (rateLimitResult) {
            set.status = rateLimitResult.status;
            return rateLimitResult.body;
        }

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

    // Forgot Password — request a reset token by phone number
    // Always returns success message to prevent user enumeration
    .post("/forgot-password", async ({ body, set, request }) => {
        // Rate-limit: max 5 requests per 10 min per IP
        const rateLimitResult = checkRateLimit(request, 5);
        if (rateLimitResult) {
            set.status = rateLimitResult.status;
            return rateLimitResult.body;
        }

        try {
            const { phoneNumber } = validateInput(forgotPasswordSchema, body);

            const user = await prisma.user.findFirst({ where: { phoneNumber } });

            // Generic response shape regardless of whether user exists
            const successResponse = {
                message: "หากเบอร์โทรศัพท์นี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปให้แล้ว",
            };

            if (!user || !user.isActive) {
                return successResponse;
            }

            // Generate cryptographically random token
            const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
            const expiryMinutes = 60;
            const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    passwordResetToken: token,
                    passwordResetExpiresAt: expiresAt,
                },
            });

            // Build reset URL
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
            const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;

            // Send email — fire-and-await but don't expose failures to the client
            // (still return generic message to avoid user enumeration)
            const { html, text } = renderPasswordResetEmail({
                fullName: user.fullName,
                resetUrl,
                expiryMinutes,
            });

            const emailResult = await sendEmail({
                to: user.email,
                subject: "รีเซ็ตรหัสผ่าน Car2Hand",
                html,
                text,
            });

            if (!emailResult.sent) {
                // Log so dev/admin can still recover the link if SMTP is broken
                console.log(`[FORGOT-PASSWORD] Reset link for ${user.email} (${phoneNumber}): ${resetUrl}`);
            }

            // In development mode, return the URL so the frontend can show it
            const isDev = process.env.NODE_ENV !== "production";
            return {
                ...successResponse,
                ...(isDev ? { devResetUrl: resetUrl, emailSent: emailResult.sent } : {}),
            };
        } catch (error: unknown) {
            if (typeof error === "object" && error !== null && "status" in error && (error as { status: number }).status === 400) {
                set.status = 400;
                return error;
            }
            console.error("Forgot password error:", error);
            set.status = 500;
            return { error: "Server Error", message: "เกิดข้อผิดพลาดในระบบ" };
        }
    }, {
        body: t.Object({
            phoneNumber: t.String(),
        }),
    })

    // Reset Password — verify token and set new password
    .post("/reset-password", async ({ body, set, request }) => {
        const rateLimitResult = checkRateLimit(request, 10);
        if (rateLimitResult) {
            set.status = rateLimitResult.status;
            return rateLimitResult.body;
        }

        try {
            const { token, password } = validateInput(resetPasswordSchema, body);

            const user = await prisma.user.findUnique({
                where: { passwordResetToken: token },
            });

            if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
                set.status = 400;
                return {
                    error: "Invalid Token",
                    message: "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว กรุณาขอลิงก์ใหม่",
                };
            }

            if (!user.isActive) {
                set.status = 403;
                return {
                    error: "Account Suspended",
                    message: "บัญชีนี้ถูกระงับการใช้งาน",
                };
            }

            const hashedPassword = await Bun.password.hash(password, {
                algorithm: "argon2id",
                memoryCost: 65536,
                timeCost: 3,
            });

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    passwordResetToken: null,
                    passwordResetExpiresAt: null,
                },
            });

            return {
                message: "ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว สามารถเข้าสู่ระบบได้ทันที",
            };
        } catch (error: unknown) {
            if (typeof error === "object" && error !== null && "status" in error && (error as { status: number }).status === 400) {
                set.status = 400;
                return error;
            }
            console.error("Reset password error:", error);
            set.status = 500;
            return { error: "Server Error", message: "เกิดข้อผิดพลาดในระบบ" };
        }
    }, {
        body: t.Object({
            token: t.String(),
            password: t.String(),
        }),
    })

    // Verify reset token (used by reset page to check validity before showing form)
    .get("/reset-password/verify", async ({ query, set }) => {
        const { token } = query;
        if (!token || typeof token !== "string") {
            set.status = 400;
            return { valid: false, message: "ไม่พบ token" };
        }

        const user = await prisma.user.findUnique({
            where: { passwordResetToken: token },
        });

        if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
            set.status = 400;
            return {
                valid: false,
                message: "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว",
            };
        }

        return { valid: true };
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

        // Validate ID format (cuid or uuid)
        const idRegex = /^[a-z0-9]{20,30}$|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!idRegex.test(id)) {
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
                profileImage: true,
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
        const { fullName, phoneNumber, email } = body as any;

        try {
            // If updating email, check uniqueness (skip placeholder emails)
            if (email) {
                const existingEmail = await prisma.user.findFirst({
                    where: { email, id: { not: userId } },
                });
                if (existingEmail) {
                    set.status = 400;
                    return { error: 'อีเมลนี้ถูกใช้งานแล้ว' };
                }
            }

            // If updating phone, check uniqueness
            if (phoneNumber) {
                const existingPhone = await prisma.user.findFirst({
                    where: { phoneNumber, id: { not: userId } },
                });
                if (existingPhone) {
                    set.status = 400;
                    return { error: 'เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว' };
                }
            }

            const updated = await prisma.user.update({
                where: { id: userId },
                data: {
                    ...(fullName && { fullName }),
                    ...(phoneNumber && { phoneNumber }),
                    ...(email && { email }),
                },
                select: { id: true, fullName: true, email: true, phoneNumber: true }
            });
            return { message: 'อัปเดตโปรไฟล์สำเร็จ', user: updated };
        } catch {
            set.status = 500;
            return { error: 'ไม่สามารถอัปเดตได้' };
        }
    })

    // Upload profile image (avatar) — multipart/form-data with field "file"
    .post("/me/avatar", async ({ auth, body, set }) => {
        if (!auth || !auth.userId) {
            set.status = 401;
            return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" };
        }
        const userId = auth.userId;

        const file = (body as { file?: File })?.file;
        if (!file || !(file instanceof File)) {
            set.status = 400;
            return { error: "Bad Request", message: "กรุณาเลือกไฟล์รูปภาพ" };
        }

        if (!isValidImageType(file.type)) {
            set.status = 400;
            return { error: "Invalid Type", message: "รองรับเฉพาะไฟล์ JPG, PNG, WebP, GIF" };
        }

        // Limit to 5MB for avatars
        if (!isValidFileSize(file.size, 5)) {
            set.status = 400;
            return { error: "File Too Large", message: "ขนาดไฟล์ต้องไม่เกิน 5MB" };
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const url = await uploadAvatar(userId, {
                buffer,
                originalname: file.name || "avatar.jpg",
                mimetype: file.type,
            });

            const updated = await prisma.user.update({
                where: { id: userId },
                data: { profileImage: url },
                select: { id: true, profileImage: true },
            });

            return {
                message: "อัปโหลดรูปโปรไฟล์สำเร็จ",
                profileImage: updated.profileImage,
            };
        } catch (err) {
            console.error("Avatar upload error:", err);
            set.status = 500;
            return { error: "Server Error", message: "ไม่สามารถอัปโหลดรูปได้" };
        }
    })

    // Remove profile image
    .delete("/me/avatar", async ({ auth, set }) => {
        if (!auth || !auth.userId) {
            set.status = 401;
            return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" };
        }
        const userId = auth.userId;

        try {
            await deleteAvatarFiles(userId);
            await prisma.user.update({
                where: { id: userId },
                data: { profileImage: null },
            });
            return { message: "ลบรูปโปรไฟล์สำเร็จ", profileImage: null };
        } catch (err) {
            console.error("Avatar delete error:", err);
            set.status = 500;
            return { error: "Server Error", message: "ไม่สามารถลบรูปได้" };
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
    })

    // Request a 6-digit verification code to delete the account.
    // Sends the code by email; expires in 15 minutes.
    .post("/me/delete-account/request", async ({ auth, set, request }) => {
        const rateLimitResult = checkRateLimit(request, 3);
        if (rateLimitResult) {
            set.status = rateLimitResult.status;
            return rateLimitResult.body;
        }

        if (!auth || !auth.userId) {
            set.status = 401;
            return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" };
        }
        const userId = auth.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, fullName: true, isActive: true },
        });
        if (!user) {
            set.status = 404;
            return { error: "Not Found", message: "ไม่พบบัญชีนี้" };
        }
        if (!user.isActive) {
            set.status = 403;
            return { error: "Account Suspended", message: "บัญชีนี้ถูกระงับการใช้งาน" };
        }

        // Generate 6-digit code (zero-padded)
        const code = (Math.floor(Math.random() * 1_000_000)).toString().padStart(6, "0");
        // Hash so that DB leaks never expose codes
        const codeHash = await Bun.password.hash(code, { algorithm: "argon2id" });
        const expiryMinutes = 15;
        const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

        await prisma.user.update({
            where: { id: userId },
            data: {
                deleteAccountCode: codeHash,
                deleteAccountCodeExpiresAt: expiresAt,
            },
        });

        const { html, text } = renderDeleteAccountEmail({
            fullName: user.fullName,
            code,
            expiryMinutes,
        });

        const result = await sendEmail({
            to: user.email,
            subject: "ยืนยันการลบบัญชี Car2Hand",
            html,
            text,
        });

        if (!result.sent) {
            console.log(`[DELETE-ACCOUNT] code for ${user.email}: ${code}`);
        }

        const isDev = process.env.NODE_ENV !== "production";
        return {
            message: "ส่งรหัสยืนยันไปยังอีเมลของคุณแล้ว",
            email: maskEmail(user.email),
            expiresInMinutes: expiryMinutes,
            ...(isDev && !result.sent ? { devCode: code } : {}),
        };
    })

    // Confirm and delete the account. Requires the 6-digit code from email.
    // Cascades remove related rows; MinIO files are wiped explicitly.
    .delete("/me", async ({ auth, body, set, request }) => {
        // Stricter rate limit on destructive op
        const rateLimitResult = checkRateLimit(request, 5);
        if (rateLimitResult) {
            set.status = rateLimitResult.status;
            return rateLimitResult.body;
        }

        if (!auth || !auth.userId) {
            set.status = 401;
            return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" };
        }
        const userId = auth.userId;

        const { code } = (body ?? {}) as { code?: string };
        if (!code || typeof code !== "string" || !/^\d{6}$/.test(code.trim())) {
            set.status = 400;
            return { error: "Bad Request", message: "กรุณากรอกรหัสยืนยัน 6 หลัก" };
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                deleteAccountCode: true,
                deleteAccountCodeExpiresAt: true,
            },
        });
        if (!user) {
            set.status = 404;
            return { error: "Not Found", message: "ไม่พบบัญชีนี้" };
        }

        if (
            !user.deleteAccountCode ||
            !user.deleteAccountCodeExpiresAt ||
            user.deleteAccountCodeExpiresAt < new Date()
        ) {
            set.status = 400;
            return {
                error: "Code Expired",
                message: "รหัสหมดอายุหรือยังไม่ได้ขอรหัส กรุณาขอรหัสใหม่",
            };
        }

        const isValid = await Bun.password.verify(code.trim(), user.deleteAccountCode);
        if (!isValid) {
            set.status = 400;
            return {
                error: "Invalid Code",
                message: "รหัสยืนยันไม่ถูกต้อง",
            };
        }

        try {
            try {
                await deleteUserFiles(userId);
            } catch (err) {
                console.error(`[DELETE-ACCOUNT] storage cleanup failed for ${userId}:`, err);
            }

            await prisma.user.delete({ where: { id: userId } });
            console.log(`[DELETE-ACCOUNT] Account ${userId} (${user.email}) deleted.`);

            return { message: "ลบบัญชีของคุณเรียบร้อยแล้ว" };
        } catch (err) {
            console.error("Delete account error:", err);
            set.status = 500;
            return { error: "Server Error", message: "ไม่สามารถลบบัญชีได้ กรุณาลองใหม่" };
        }
    }, {
        body: t.Object({
            code: t.String(),
        }),
    });

// Combined users routes export
export const usersRoutes = new Elysia()
    .use(usersPublicRoutes)
    .use(usersProtectedRoutes);
