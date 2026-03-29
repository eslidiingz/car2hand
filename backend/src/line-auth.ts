/**
 * LINE Login OAuth Routes
 * User-facing LINE Login integration for account linking
 */

import { Elysia, t } from "elysia";
import prisma from "./db";
import { getLineSettings } from "./line";

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

    // ยกเลิกการเชื่อมต่อ
    .delete("/disconnect", async ({ query, set }) => {
        const { userId } = query;
        if (!userId) { set.status = 400; return { message: "Missing userId" }; }

        await prisma.user.update({
            where: { id: userId },
            data: { lineUserId: null },
        });

        return { message: "ยกเลิกการเชื่อมต่อ LINE สำเร็จ" };
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
