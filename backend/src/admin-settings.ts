/**
 * Admin global settings — flexible runtime feature flags.
 *
 * - Typed registry of known setting keys (no arbitrary strings).
 * - `getSetting<K>(key)` reads from DB with default fallback.
 * - `setSetting(key, value, adminId)` upserts with type validation.
 * - `adminSettingsRoutes` exposes /admin/settings (GET all, GET one, PUT one).
 *
 * Auth pattern matches admin-seller-profiles.ts / admin-kyc.ts.
 */

import { Elysia, t } from "elysia";
import prisma from "./db";
import { jwtPlugin } from "./jwt";
import { logAdminAction, diffFields } from "./admin-p1";

/* ─── Registry ───────────────────────────────────────────────────
 * Add new settings here. Each entry pins the key, the JS type, and
 * the default value returned when the DB row is missing.
 */
type SettingType = "boolean" | "string" | "number";

interface SettingDef<T> {
    key: string;
    type: SettingType;
    default: T;
}

export const SETTINGS = {
    BASIC_LISTING_REQUIRES_APPROVAL: {
        key: "basicListingRequiresApproval",
        type: "boolean",
        default: true,
    } as SettingDef<boolean>,
} as const;

export type SettingKey = keyof typeof SETTINGS;

// Map every registered key string → its definition (for runtime lookup by string key).
const SETTINGS_BY_KEY: Record<string, SettingDef<unknown>> = Object.fromEntries(
    Object.values(SETTINGS).map((def) => [def.key, def as SettingDef<unknown>])
);

/* ─── Helpers ───────────────────────────────────────────────── */

function isValidValueForType(type: SettingType, value: unknown): boolean {
    if (type === "boolean") return typeof value === "boolean";
    if (type === "string") return typeof value === "string";
    if (type === "number") return typeof value === "number" && Number.isFinite(value);
    return false;
}

/** Read a setting value from DB, falling back to registry default if the row is missing. */
export async function getSetting<K extends SettingKey>(
    key: K
): Promise<typeof SETTINGS[K]["default"]> {
    const def = SETTINGS[key];
    const row = await prisma.adminSetting.findUnique({ where: { key: def.key } });
    if (!row) return def.default;
    if (!isValidValueForType(def.type, row.value)) return def.default;
    return row.value as typeof SETTINGS[K]["default"];
}

/** Upsert a setting value. Caller is responsible for validating against the registry type. */
export async function setSetting<K extends SettingKey>(
    key: K,
    value: typeof SETTINGS[K]["default"],
    adminId: string
): Promise<void> {
    const def = SETTINGS[key];
    if (!isValidValueForType(def.type, value)) {
        throw new Error(`Invalid value type for setting "${def.key}": expected ${def.type}`);
    }
    await prisma.adminSetting.upsert({
        where: { key: def.key },
        create: { key: def.key, value: value as never, updatedBy: adminId },
        update: { value: value as never, updatedBy: adminId },
    });
}

/* ─── Routes ─────────────────────────────────────────────────── */

export const adminSettingsRoutes = new Elysia({ prefix: "/admin/settings" })
    .use(jwtPlugin())
    .derive(async ({ jwt, headers, set }) => {
        const authHeader = headers["authorization"];
        if (!authHeader?.startsWith("Bearer ")) {
            set.status = 401;
            return { authError: "Unauthorized" as const, adminId: null as string | null };
        }
        const token = authHeader.slice(7).trim();
        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = 401;
            return { authError: "Invalid Token" as const, adminId: null as string | null };
        }
        return { authError: null as string | null, adminId: (payload as { userId: string }).userId };
    })
    .onBeforeHandle(({ authError, set }) => {
        if (authError) {
            set.status = 401;
            return { error: 'Unauthorized', message: 'กรุณาเข้าสู่ระบบ Admin' };
        }
    })

    // GET /admin/settings — return ALL registered settings as { [key]: value }
    // with defaults filled in for missing rows.
    .get("/", async () => {
        const rows = await prisma.adminSetting.findMany();
        const byKey = new Map(rows.map((r) => [r.key, r.value]));

        const settings: Record<string, unknown> = {};
        for (const def of Object.values(SETTINGS)) {
            const stored = byKey.get(def.key);
            if (stored !== undefined && isValidValueForType(def.type, stored)) {
                settings[def.key] = stored;
            } else {
                settings[def.key] = def.default;
            }
        }
        return { settings };
    })

    // GET /admin/settings/:key — single setting (404 if key not in registry)
    .get("/:key", async ({ params, set }) => {
        const def = SETTINGS_BY_KEY[params.key];
        if (!def) {
            set.status = 404;
            return { error: 'Not Found', message: 'ไม่พบการตั้งค่า' };
        }
        const row = await prisma.adminSetting.findUnique({ where: { key: def.key } });
        const value = row && isValidValueForType(def.type, row.value) ? row.value : def.default;
        return { key: def.key, value };
    })

    // PUT /admin/settings/:key — update a single setting; emits audit log.
    .put("/:key", async ({ params, body, adminId, set }) => {
        const def = SETTINGS_BY_KEY[params.key];
        if (!def) {
            set.status = 404;
            return { error: 'Not Found', message: 'ไม่พบการตั้งค่า' };
        }

        const b = body as { value: unknown };
        if (!isValidValueForType(def.type, b.value)) {
            set.status = 400;
            return {
                error: 'Validation',
                message: `ค่าไม่ถูกต้อง ต้องเป็นชนิด ${def.type}`,
            };
        }

        try {
            const existing = await prisma.adminSetting.findUnique({ where: { key: def.key } });
            const beforeValue = existing && isValidValueForType(def.type, existing.value)
                ? existing.value
                : def.default;

            const updated = await prisma.adminSetting.upsert({
                where: { key: def.key },
                create: { key: def.key, value: b.value as never, updatedBy: adminId ?? null },
                update: { value: b.value as never, updatedBy: adminId ?? null },
            });

            if (adminId) {
                await logAdminAction({
                    adminId,
                    action: 'SETTING_UPDATE',
                    targetType: 'SETTING',
                    targetId: def.key,
                    note: `แก้ไขการตั้งค่า "${def.key}"`,
                    metadata: {
                        changes: diffFields(
                            { value: beforeValue },
                            { value: b.value }
                        ),
                    },
                });
            }

            return {
                message: 'อัปเดตการตั้งค่าสำเร็จ',
                key: def.key,
                value: updated.value,
            };
        } catch (error) {
            console.error('Update admin setting error:', error);
            set.status = 500;
            return { error: 'Server Error', message: 'ไม่สามารถอัปเดตการตั้งค่าได้' };
        }
    }, {
        body: t.Object({
            value: t.Any(),
        }),
    });
