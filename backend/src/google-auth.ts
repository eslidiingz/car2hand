/**
 * Google OAuth Routes
 * User-facing Google Login integration for direct login/register
 */

import { Elysia, t } from "elysia";
import prisma from "./db";
import { jwtPlugin, generateAccessToken } from "./jwt";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

/**
 * Get Google OAuth settings from SystemSetting table
 */
async function getGoogleSettings() {
    const settings = await prisma.systemSetting.findMany({
        where: { key: { startsWith: "google." } },
    });

    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;

    return {
        clientId: map["google.clientId"] || "",
        clientSecret: map["google.clientSecret"] || "",
    };
}

export const googleAuthRoutes = new Elysia({ prefix: "/auth/google" })

    // สร้าง Google Login URL (ไม่ต้อง auth)
    .get("/login-url", async ({ query, set }) => {
        const { redirectUri } = query;
        if (!redirectUri) {
            set.status = 400;
            return { message: "Missing redirectUri" };
        }

        const settings = await getGoogleSettings();
        if (!settings.clientId) {
            set.status = 400;
            return { message: "Google Login ยังไม่ได้ตั้งค่า" };
        }

        const state = Buffer.from(JSON.stringify({ mode: "login" })).toString("base64url");

        const params = new URLSearchParams({
            response_type: "code",
            client_id: settings.clientId,
            redirect_uri: redirectUri,
            state,
            scope: "openid email profile",
            access_type: "offline",
            prompt: "select_account",
        });

        const url = `${GOOGLE_AUTH_URL}?${params.toString()}`;
        return { url };
    })

    // Google Login — แลก code เป็น token, หา/สร้าง user, return JWT
    .use(jwtPlugin())
    .post("/login", async ({ body, set, jwt }) => {
        const { code, state, redirectUri } = body;

        // validate state
        try {
            const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
            if (decoded.mode !== "login") {
                set.status = 400;
                return { message: "Invalid state" };
            }
        } catch {
            set.status = 400;
            return { message: "Invalid state" };
        }

        const settings = await getGoogleSettings();
        if (!settings.clientId || !settings.clientSecret) {
            set.status = 400;
            return { message: "Google Login ยังไม่ได้ตั้งค่า" };
        }

        // Exchange code for access token
        const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: redirectUri,
                client_id: settings.clientId,
                client_secret: settings.clientSecret,
            }),
        });

        if (!tokenRes.ok) {
            set.status = 400;
            return { message: "ไม่สามารถเชื่อมต่อ Google ได้" };
        }
        const tokenData = await tokenRes.json();

        // Get user profile from Google
        const profileRes = await fetch(GOOGLE_USERINFO_URL, {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        if (!profileRes.ok) {
            set.status = 400;
            return { message: "ไม่สามารถดึงข้อมูล Google ได้" };
        }
        const profile = await profileRes.json();
        // profile: { sub, name, email, email_verified, picture }

        // Find existing user by googleUserId
        let user = await prisma.user.findFirst({
            where: { googleUserId: profile.sub },
        });

        let isNewUser = false;

        if (user) {
            // Existing user — check active
            if (!user.isActive) {
                set.status = 403;
                return { error: "Account Suspended", message: "บัญชีนี้ถูกระงับการใช้งาน" };
            }
        } else {
            // Check if email already exists (user registered with phone+password but same email)
            const existingByEmail = profile.email
                ? await prisma.user.findFirst({ where: { email: profile.email } })
                : null;

            if (existingByEmail) {
                // Link Google to existing account
                user = await prisma.user.update({
                    where: { id: existingByEmail.id },
                    data: { googleUserId: profile.sub },
                });
            } else {
                // Auto-create new user from Google profile
                const randomPassword = crypto.randomUUID();
                const hashedPassword = await Bun.password.hash(randomPassword, {
                    algorithm: "argon2id",
                    memoryCost: 65536,
                    timeCost: 3,
                });

                user = await prisma.user.create({
                    data: {
                        fullName: profile.name || "Google User",
                        email: profile.email || `google_${profile.sub}@car2hand.placeholder`,
                        phoneNumber: "",
                        password: hashedPassword,
                        googleUserId: profile.sub,
                    },
                });
                isNewUser = true;
            }
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
        }),
    });
