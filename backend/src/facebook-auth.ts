/**
 * Facebook OAuth Routes
 * User-facing Facebook Login integration for direct login/register
 */

import { Elysia, t } from "elysia";
import prisma from "./db";
import { jwtPlugin, generateAccessToken } from "./jwt";

const FACEBOOK_AUTH_URL = "https://www.facebook.com/v18.0/dialog/oauth";
const FACEBOOK_TOKEN_URL = "https://graph.facebook.com/v18.0/oauth/access_token";
const FACEBOOK_USERINFO_URL = "https://graph.facebook.com/me";

/**
 * Get Facebook OAuth settings from SystemSetting table
 */
async function getFacebookSettings() {
    const settings = await prisma.systemSetting.findMany({
        where: { key: { startsWith: "facebook." } },
    });

    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;

    return {
        appId: map["facebook.appId"] || "",
        appSecret: map["facebook.appSecret"] || "",
    };
}

export const facebookAuthRoutes = new Elysia({ prefix: "/auth/facebook" })

    // สร้าง Facebook Login URL (ไม่ต้อง auth)
    .get("/login-url", async ({ query, set }) => {
        const { redirectUri } = query;
        if (!redirectUri) {
            set.status = 400;
            return { message: "Missing redirectUri" };
        }

        const settings = await getFacebookSettings();
        if (!settings.appId) {
            set.status = 400;
            return { message: "Facebook Login ยังไม่ได้ตั้งค่า" };
        }

        const state = Buffer.from(JSON.stringify({ mode: "login" })).toString("base64url");

        const params = new URLSearchParams({
            response_type: "code",
            client_id: settings.appId,
            redirect_uri: redirectUri,
            state,
            scope: "email,public_profile",
        });

        const url = `${FACEBOOK_AUTH_URL}?${params.toString()}`;
        return { url };
    })

    // Facebook Login — แลก code เป็น token, หา/สร้าง user, return JWT
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

        const settings = await getFacebookSettings();
        if (!settings.appId || !settings.appSecret) {
            set.status = 400;
            return { message: "Facebook Login ยังไม่ได้ตั้งค่า" };
        }

        // Exchange code for access token (Facebook uses GET for token endpoint)
        const tokenParams = new URLSearchParams({
            client_id: settings.appId,
            client_secret: settings.appSecret,
            redirect_uri: redirectUri,
            code,
        });
        const tokenRes = await fetch(`${FACEBOOK_TOKEN_URL}?${tokenParams.toString()}`);

        if (!tokenRes.ok) {
            set.status = 400;
            return { message: "ไม่สามารถเชื่อมต่อ Facebook ได้" };
        }
        const tokenData = await tokenRes.json();

        // Get user profile from Facebook Graph API (request id, name, email)
        const profileParams = new URLSearchParams({
            fields: "id,name,email",
            access_token: tokenData.access_token,
        });
        const profileRes = await fetch(`${FACEBOOK_USERINFO_URL}?${profileParams.toString()}`);

        if (!profileRes.ok) {
            set.status = 400;
            return { message: "ไม่สามารถดึงข้อมูล Facebook ได้" };
        }
        const profile = await profileRes.json();
        // profile: { id, name, email? }  (email may be missing if user didn't grant permission)

        // Find existing user by facebookUserId
        let user = await prisma.user.findFirst({
            where: { facebookUserId: profile.id },
        });

        let isNewUser = false;

        if (user) {
            // Existing user — check active
            if (!user.isActive) {
                set.status = 403;
                return { error: "Account Suspended", message: "บัญชีนี้ถูกระงับการใช้งาน" };
            }
        } else {
            // Check if email already exists (link to existing account)
            const existingByEmail = profile.email
                ? await prisma.user.findFirst({ where: { email: profile.email } })
                : null;

            if (existingByEmail) {
                user = await prisma.user.update({
                    where: { id: existingByEmail.id },
                    data: { facebookUserId: profile.id },
                });
            } else {
                // Auto-create new user from Facebook profile
                const randomPassword = crypto.randomUUID();
                const hashedPassword = await Bun.password.hash(randomPassword, {
                    algorithm: "argon2id",
                    memoryCost: 65536,
                    timeCost: 3,
                });

                user = await prisma.user.create({
                    data: {
                        fullName: profile.name || "Facebook User",
                        email: profile.email || `facebook_${profile.id}@car2hand.placeholder`,
                        phoneNumber: "",
                        password: hashedPassword,
                        facebookUserId: profile.id,
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
