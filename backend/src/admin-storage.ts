/**
 * Admin Storage Settings Routes
 * Manage active object-storage provider (MinIO | Cloudflare R2).
 */

import { Elysia, t } from "elysia";
import { z } from "zod";
import prisma from "./db";
import { jwtPlugin } from "./jwt";
import { validateInput } from "./validation";
import { getProviderByType, invalidateActiveProvider } from "./storage/factory";
import type { StorageProviderType } from "./storage/provider";

const minioConfigSchema = z.object({
    endpoint: z.string().min(1, "กรุณากรอก endpoint"),
    port: z.number().int().min(1).max(65535),
    useSSL: z.boolean(),
    accessKey: z.string().min(1, "กรุณากรอก access key"),
    secretKey: z.string().min(1, "กรุณากรอก secret key"),
    bucket: z.string().min(1, "กรุณากรอกชื่อ bucket"),
});

const cloudflareConfigSchema = z.object({
    endpoint: z.string().url("endpoint ต้องเป็น URL ที่ถูกต้อง"),
    accessKeyId: z.string().min(1, "กรุณากรอก access key ID"),
    secretAccessKey: z.string().min(1, "กรุณากรอก secret access key"),
    bucket: z.string().min(1, "กรุณากรอกชื่อ bucket"),
    publicUrl: z.string().url("public URL ต้องเป็น URL ที่ถูกต้อง"),
});

const providerTypeSchema = z.enum(["MINIO", "CLOUDFLARE_R2"]);

const updateBodySchema = z.discriminatedUnion("provider", [
    z.object({ provider: z.literal("MINIO"), config: minioConfigSchema }),
    z.object({ provider: z.literal("CLOUDFLARE_R2"), config: cloudflareConfigSchema }),
]);

const testBodySchema = z.discriminatedUnion("provider", [
    z.object({ provider: z.literal("MINIO"), config: minioConfigSchema }),
    z.object({ provider: z.literal("CLOUDFLARE_R2"), config: cloudflareConfigSchema }),
]);

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

            const updated = existing
                ? await prisma.storageSetting.update({
                    where: { id: existing.id },
                    data: {
                        provider: parsed.provider,
                        config: parsed.config as unknown as object,
                        updatedBy: adminId,
                    },
                })
                : await prisma.storageSetting.create({
                    data: {
                        provider: parsed.provider,
                        config: parsed.config as unknown as object,
                        updatedBy: adminId,
                    },
                });

            invalidateActiveProvider();

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
            const provider = getProviderByType(
                parsed.provider,
                parsed.config as unknown as Record<string, unknown>
            );

            // Try listing — succeeds for existing buckets with read perms.
            // Fall back to ensureBucket + tiny upload + delete if list fails.
            let listOk = false;
            try {
                await provider.list("");
                listOk = true;
            } catch {
                listOk = false;
            }

            if (!listOk) {
                await provider.ensureBucket();
                const testKey = `__healthcheck/${Date.now()}.txt`;
                const testBuffer = Buffer.from("car2hand-storage-test");
                await provider.upload(testKey, testBuffer, "text/plain");
                try {
                    await provider.delete(testKey);
                } catch {
                    // best-effort cleanup
                }
            }

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
