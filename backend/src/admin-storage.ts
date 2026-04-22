/**
 * Admin Storage Settings Routes
 * Manage active object-storage provider (MinIO | Cloudflare R2).
 */

import { Elysia, t } from "elysia";
import { z } from "zod";
import prisma from "./db";
import { jwtPlugin } from "./jwt";
import { validateInput } from "./validation";
import { getProviderByType, invalidateProviderCache } from "./storage/factory";
import type { StorageProviderType } from "./storage/provider";

const minioConfigSchema = z.object({
    endpoint: z.string().min(1, "กรุณากรอก endpoint"),
    port: z.number().int().min(1).max(65535),
    useSSL: z.boolean(),
    // Secrets are optional on update — omitted = keep the existing DB value.
    // Backend merges from existing row before validating completeness.
    accessKey: z.string().min(1).optional(),
    secretKey: z.string().min(1).optional(),
    bucket: z.string().min(1, "กรุณากรอกชื่อ bucket"),
});

const cloudflareConfigSchema = z.object({
    // Either endpoint (full URL) or accountId (shortcut) must be supplied.
    // accountId → endpoint = https://{accountId}.r2.cloudflarestorage.com
    endpoint: z.string().url().optional(),
    accountId: z.string().min(1).optional(),
    // Secrets are optional on update — omitted = keep the existing DB value.
    accessKeyId: z.string().min(1).optional(),
    secretAccessKey: z.string().min(1).optional(),
    bucket: z.string().min(1, "กรุณากรอกชื่อ bucket"),
    publicUrl: z.string().url("public URL ต้องเป็น URL ที่ถูกต้อง"),
    // Optional prefix prepended to every object key in the bucket — useful when
    // sharing a bucket across environments. Empty/undefined = no prefix.
    directory: z.string()
        .max(200, "directory ยาวเกินไป")
        .regex(/^[A-Za-z0-9_\-./]*$/, "directory ใช้ได้เฉพาะตัวอักษร/ตัวเลข/_/-/./")
        .optional(),
}).refine(
    (c) => !!(c.endpoint || c.accountId),
    { message: "กรุณากรอก endpoint หรือ accountId", path: ["endpoint"] },
);

const providerTypeSchema = z.enum(["MINIO", "CLOUDFLARE_R2"]);

const updateBodySchema = z.discriminatedUnion("provider", [
    z.object({ provider: z.literal("MINIO"), config: minioConfigSchema }),
    z.object({ provider: z.literal("CLOUDFLARE_R2"), config: cloudflareConfigSchema }),
]);

const testBodySchema = z.discriminatedUnion("provider", [
    z.object({ provider: z.literal("MINIO"), config: minioConfigSchema }),
    z.object({ provider: z.literal("CLOUDFLARE_R2"), config: cloudflareConfigSchema }),
]);

/**
 * Merge omitted secret fields from the existing DB config.
 *
 * The frontend sends partial configs — secret fields are absent when the user
 * hasn't retyped them (they're shown as redacted placeholders like `****abcd`).
 * We preserve the existing secret in that case so the admin doesn't have to
 * re-enter credentials every time they update a non-secret field (bucket,
 * public URL, directory, etc.).
 *
 * Also strips obviously-redacted values so they never overwrite real secrets.
 */
function mergeSecrets(
    provider: StorageProviderType,
    incoming: Record<string, unknown>,
    existing: Record<string, unknown>,
): Record<string, unknown> {
    const secretKeys = provider === "MINIO"
        ? ["accessKey", "secretKey"]
        : ["accessKeyId", "secretAccessKey"];

    const result: Record<string, unknown> = { ...incoming };
    for (const key of secretKeys) {
        const inVal = incoming[key];
        const isMissing = inVal === undefined || inVal === null || inVal === "";
        const isRedacted = typeof inVal === "string" && /^\*{2,}/.test(inVal);
        if (isMissing || isRedacted) {
            if (existing[key] !== undefined) {
                result[key] = existing[key];
            } else {
                delete result[key];
            }
        }
    }
    return result;
}

/**
 * Final completeness check on the merged config. Returns a Thai error message
 * naming the missing secret so the admin knows they need to enter it the first
 * time they configure this provider.
 */
function validateCompleteConfig(
    provider: StorageProviderType,
    config: Record<string, unknown>,
): { ok: true } | { ok: false; message: string } {
    if (provider === "MINIO") {
        if (!config.accessKey) return { ok: false, message: "กรุณากรอก access key" };
        if (!config.secretKey) return { ok: false, message: "กรุณากรอก secret key" };
    } else {
        if (!config.accessKeyId) return { ok: false, message: "กรุณากรอก access key ID" };
        if (!config.secretAccessKey) return { ok: false, message: "กรุณากรอก secret access key" };
    }
    return { ok: true };
}

function maskSecret(value: string | undefined | null): string {
    if (!value) return "";
    if (value.length <= 4) return "****";
    return `****${value.slice(-4)}`;
}

function redactConfig(provider: StorageProviderType, config: Record<string, unknown>): Record<string, unknown> {
    if (provider === "MINIO") {
        return {
            endpoint: config.endpoint ?? "",
            port: config.port ?? 9000,
            useSSL: config.useSSL ?? false,
            accessKey: maskSecret(config.accessKey as string | undefined),
            secretKey: maskSecret(config.secretKey as string | undefined),
            bucket: config.bucket ?? "",
        };
    }
    return {
        endpoint: config.endpoint ?? "",
        accessKeyId: maskSecret(config.accessKeyId as string | undefined),
        secretAccessKey: maskSecret(config.secretAccessKey as string | undefined),
        bucket: config.bucket ?? "",
        publicUrl: config.publicUrl ?? "",
        directory: config.directory ?? "",
    };
}

async function verifyAdmin(jwtInstance: { verify: (token: string) => Promise<unknown> }, headers: Record<string, string | undefined>, set: { status?: number }) {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) {
        set.status = 401;
        return { adminId: null as string | null };
    }
    const token = authHeader.slice(7).trim();
    const payload = await jwtInstance.verify(token);
    if (!payload || typeof payload !== "object") {
        set.status = 401;
        return { adminId: null as string | null };
    }
    const userId = (payload as { userId?: string }).userId;
    if (!userId) {
        set.status = 401;
        return { adminId: null as string | null };
    }
    const admin = await prisma.admin.findUnique({ where: { id: userId } });
    if (!admin) {
        set.status = 403;
        return { adminId: null as string | null };
    }
    return { adminId: userId };
}

export const adminStorageRoutes = new Elysia({ prefix: "/admin/settings/storage" })
    .use(jwtPlugin())
    .derive(async ({ jwt, headers, set }) => verifyAdmin(jwt, headers, set))
    .onBeforeHandle(({ adminId, set }) => {
        if (!adminId) {
            if (set.status !== 403) set.status = 401;
            return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ Admin" };
        }
    })

    // ดึงการตั้งค่าปัจจุบัน (ซ่อนความลับ)
    .get("/", async () => {
        const setting = await prisma.storageSetting.findFirst({
            orderBy: { updatedAt: "desc" },
        });

        if (!setting) {
            return {
                provider: "MINIO" as StorageProviderType,
                config: redactConfig("MINIO", {}),
                updatedAt: null,
                updatedBy: null,
            };
        }

        const rawConfig = (setting.config as Record<string, unknown> | null) ?? {};
        return {
            provider: setting.provider as StorageProviderType,
            config: redactConfig(setting.provider as StorageProviderType, rawConfig),
            updatedAt: setting.updatedAt,
            updatedBy: setting.updatedBy,
        };
    })

    // อัพเดทผู้ให้บริการและ config
    .put("/", async ({ body, adminId, set }) => {
        try {
            const parsed = validateInput(updateBodySchema, body);

            const existing = await prisma.storageSetting.findFirst({
                orderBy: { updatedAt: "desc" },
            });
            const id = existing?.id ?? "singleton";

            // Merge omitted secrets from the existing row — the frontend leaves
            // secret fields undefined when the user hasn't retyped them, which
            // means "keep current value". Only applies when provider is unchanged.
            const existingConfig = (existing?.config as Record<string, unknown> | null) ?? {};
            const sameProvider = existing?.provider === parsed.provider;
            const mergedConfig = mergeSecrets(
                parsed.provider,
                parsed.config as Record<string, unknown>,
                sameProvider ? existingConfig : {},
            );

            // Final completeness check — secrets are required in storage, just
            // not required to come from this request.
            const completeness = validateCompleteConfig(parsed.provider, mergedConfig);
            if (!completeness.ok) {
                set.status = 400;
                return { error: "Validation", message: completeness.message };
            }

            const updated = await prisma.storageSetting.upsert({
                where: { id },
                update: {
                    provider: parsed.provider,
                    config: mergedConfig as unknown as object,
                    updatedBy: adminId,
                },
                create: {
                    id,
                    provider: parsed.provider,
                    config: mergedConfig as unknown as object,
                    updatedBy: adminId,
                },
            });

            invalidateProviderCache();

            const rawConfig = (updated.config as Record<string, unknown> | null) ?? {};
            return {
                message: "บันทึกการตั้งค่าที่จัดเก็บไฟล์สำเร็จ",
                provider: updated.provider as StorageProviderType,
                config: redactConfig(updated.provider as StorageProviderType, rawConfig),
                updatedAt: updated.updatedAt,
                updatedBy: updated.updatedBy,
            };
        } catch (error: unknown) {
            if (typeof error === "object" && error !== null && "status" in error && (error as { status: number }).status === 400) {
                set.status = 400;
                return error;
            }
            console.error("Update storage setting error:", error);
            set.status = 500;
            return { error: "Server Error", message: "ไม่สามารถบันทึกการตั้งค่าได้" };
        }
    }, {
        body: t.Object({
            provider: t.Union([t.Literal("MINIO"), t.Literal("CLOUDFLARE_R2")]),
            config: t.Record(t.String(), t.Any()),
        }),
    })

    // ทดสอบการเชื่อมต่อ (ไม่บันทึกลงฐานข้อมูล)
    .post("/test", async ({ body, set }) => {
        const start = Date.now();
        try {
            const parsed = validateInput(testBodySchema, body);

            // Same merge rule as PUT — omitted secrets fall back to the saved
            // config so admin can click "Test" without retyping credentials.
            const existing = await prisma.storageSetting.findFirst({
                orderBy: { updatedAt: "desc" },
            });
            const existingConfig = (existing?.config as Record<string, unknown> | null) ?? {};
            const sameProvider = existing?.provider === parsed.provider;
            const mergedConfig = mergeSecrets(
                parsed.provider,
                parsed.config as Record<string, unknown>,
                sameProvider ? existingConfig : {},
            );

            const completeness = validateCompleteConfig(parsed.provider, mergedConfig);
            if (!completeness.ok) {
                set.status = 400;
                return { ok: false, message: completeness.message, latencyMs: Date.now() - start };
            }

            const provider = getProviderByType(
                parsed.provider,
                mergedConfig
            );

            // Ping the provider via ensureBucket — the lightest connectivity check
            // that works for both MinIO and R2 without mutating storage beyond
            // bucket creation (idempotent).
            await provider.ensureBucket();

            return {
                ok: true,
                message: "เชื่อมต่อสำเร็จ",
                latencyMs: Date.now() - start,
            };
        } catch (error: unknown) {
            if (typeof error === "object" && error !== null && "status" in error && (error as { status: number }).status === 400) {
                set.status = 400;
                return error;
            }
            const message = error instanceof Error ? error.message : String(error);
            console.error("Storage test connection error:", error);
            return {
                ok: false,
                message: `เชื่อมต่อไม่สำเร็จ: ${message}`,
                latencyMs: Date.now() - start,
            };
        }
    }, {
        body: t.Object({
            provider: t.Union([t.Literal("MINIO"), t.Literal("CLOUDFLARE_R2")]),
            config: t.Record(t.String(), t.Any()),
        }),
    });
