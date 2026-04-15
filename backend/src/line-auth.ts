/**
 * LINE Login OAuth Routes
 * User-facing LINE Login integration for account linking & direct login
 */

import { Elysia, t } from "elysia";
import prisma from "./db";
import { getLineSettings } from "./line";
import { authGuard, jwtPlugin, generateAccessToken } from "./jwt";

export const lineAuthRoutes = new Elysia({ prefix: "/auth/line" })
    // สร้าง LINE Login URL
    .get("/connect-url", async ({ query, set }) => {
        const { userId, redirectUri } = query;
        if (!userId || !redirectUri) { set.status = 400; return { message: "Missing userId or redirectUri" }; }

        const settings = await getLineSettings();
        if (!settings.loginChannelId) { set.status = 400; return { message: "LINE Login ยังไม่ได้ตั้งค่า" }; }

        const state = Buffer.from(JSON.stringify({ userId })).toString('base64url');
        const url = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${settings.loginChannelId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=profile%20openid`;

        return { url };
    })

    // OAuth callback — แลก code เป็น token แล้วดึง profile
    .post("/callback", async ({ body, set }) => {
        const { code, state, redirectUri } = body;

        // decode state to get userId
        let userId: string;
        try {
            const decoded = JSON.parse(Buffer.from(state, 'base64url').toString());
            userId = decoded.userId;
        } catch { set.status = 400; return { message: "Invalid state" }; }

        const settings = await getLineSettings();

        // Exchange code for access token
        const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
                client_id: settings.loginChannelId,
                client_secret: settings.loginChannelSecret,
            }),
        });

        if (!tokenRes.ok) { set.status = 400; return { message: "ไม่สามารถเชื่อมต่อ LINE ได้" }; }
        const tokenData = await tokenRes.json();

        // Get user profile
        const profileRes = await fetch('https://api.line.me/v2/profile', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        if (!profileRes.ok) { set.status = 400; return { message: "ไม่สามารถดึงข้อมูล LINE ได้" }; }
        const profile = await profileRes.json();

        // Save lineUserId to User
        await prisma.user.update({
            where: { id: userId },
            data: { lineUserId: profile.userId },
        });

        return { message: "เชื่อมต่อ LINE สำเร็จ", lineDisplayName: profile.displayName };
    }, {
        body: t.Object({
            code: t.String(),
            state: t.String(),
            redirectUri: t.String(),
        })
    })

    // ยกเลิกการเชื่อมต่อ (ต้อง login + ใช้ userId จาก token เท่านั้น)
    .group("/disconnect", (app) => authGuard(app)
        .onBeforeHandle(({ auth, set }: any) => {
            if (!auth || !auth.userId) {
                set.status = 401;
                return { error: 'Unauthorized', message: 'กรุณาเข้าสู่ระบบ' };
            }
        })
        .delete("/", async ({ auth, set }: any) => {
            await prisma.user.update({
                where: { id: auth.userId },
                data: { lineUserId: null },
            });

            return { message: "ยกเลิกการเชื่อมต่อ LINE สำเร็จ" };
        })
    )

    // สร้าง LINE Login URL สำหรับ login โดยตรง (ไม่ต้อง auth)
    .get("/login-url", async ({ query, set }) => {
        const { redirectUri } = query;
        if (!redirectUri) { set.status = 400; return { message: "Missing redirectUri" }; }

        const settings = await getLineSettings();
        if (!settings.loginChannelId) { set.status = 400; return { message: "LINE Login ยังไม่ได้ตั้งค่า" }; }

        const state = Buffer.from(JSON.stringify({ mode: "login" })).toString('base64url');
        const url = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${settings.loginChannelId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=profile%20openid`;

        return { url };
    })

    // LINE Login โดยตรง — แลก code เป็น token, หา/สร้าง user, return JWT
    .use(jwtPlugin())
    .post("/login", async ({ body, set, jwt }) => {
        const { code, state, redirectUri } = body;

        // validate state
        try {
            const decoded = JSON.parse(Buffer.from(state, 'base64url').toString());
            if (decoded.mode !== 'login') { set.status = 400; return { message: "Invalid state" }; }
        } catch { set.status = 400; return { message: "Invalid state" }; }

        const settings = await getLineSettings();
        if (!settings.loginChannelId || !settings.loginChannelSecret) {
            set.status = 400;
            return { message: "LINE Login ยังไม่ได้ตั้งค่า" };
        }

        // Exchange code for access token
        const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
                client_id: settings.loginChannelId,
                client_secret: settings.loginChannelSecret,
            }),
        });

        if (!tokenRes.ok) { set.status = 400; return { message: "ไม่สามารถเชื่อมต่อ LINE ได้" }; }
        const tokenData = await tokenRes.json();

        // Get user profile from LINE
        const profileRes = await fetch('https://api.line.me/v2/profile', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        if (!profileRes.ok) { set.status = 400; return { message: "ไม่สามารถดึงข้อมูล LINE ได้" }; }
        const profile = await profileRes.json();

        // Find existing user by lineUserId
        let user = await prisma.user.findFirst({
            where: { lineUserId: profile.userId },
        });

        let isNewUser = false;

        if (user) {
            // Existing user — check active
            if (!user.isActive) {
                set.status = 403;
                return { error: 'Account Suspended', message: "บัญชีนี้ถูกระงับการใช้งาน" };
            }
        } else {
            // Auto-create new user from LINE profile
            const randomPassword = crypto.randomUUID();
            const hashedPassword = await Bun.password.hash(randomPassword, {
                algorithm: 'argon2id',
                memoryCost: 65536,
                timeCost: 3,
            });

            user = await prisma.user.create({
                data: {
                    fullName: profile.displayName || 'LINE User',
                    email: `line_${profile.userId}@car2hand.placeholder`,
                    phoneNumber: '',
                    password: hashedPassword,
                    lineUserId: profile.userId,
                },
            });
            isNewUser = true;
        }

        // Generate JWT
        const accessToken = await generateAccessToken(jwt.sign, user.id, user.email);

        return {
            message: isNewUser ? "สร้างบัญชีและเข้าสู่ระบบสำเร็จ" : "เข้าสู่ระบบสำเร็จ",
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                isActive: user.isActive,
                createdAt: user.createdAt,
            },
            accessToken,
            isNewUser,
        };
    }, {
        body: t.Object({
            code: t.String(),
            state: t.String(),
            redirectUri: t.String(),
        })
    })

    // เช็คสถานะการเชื่อมต่อ
    .get("/status", async ({ query, set }) => {
        const { userId } = query;
        if (!userId) { set.status = 400; return { message: "Missing userId" }; }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { lineUserId: true },
        });

        return { connected: !!user?.lineUserId };
    });
