/**
 * Integration tests for /admin/settings/storage routes.
 *
 * Uses `Elysia.handle(Request)` pattern — mirrors other admin-*-crud tests.
 * We mock `../db` with a minimal in-memory stub covering `admin` + `storageSetting`,
 * and stub the provider factory so the `/test` endpoint is deterministic.
 */

import { describe, test, expect, beforeAll, mock } from "bun:test";
import jsonwebtoken from "jsonwebtoken";

// ─── DB mock (admin + storageSetting) ──────────────────────────────────

type StorageRow = {
    id: string;
    provider: "MINIO" | "CLOUDFLARE_R2";
    config: Record<string, unknown>;
    updatedAt: Date;
    updatedBy: string | null;
};

type AdminRow = { id: string; username: string };

const dbState = {
    admins: new Map<string, AdminRow>(),
    storage: null as StorageRow | null,
};

// Seed the legitimate admin
dbState.admins.set("admin-storage-test", { id: "admin-storage-test", username: "admin" });

mock.module("../db", () => ({
    default: {
        admin: {
            findUnique: async ({ where }: { where: { id: string } }) =>
                dbState.admins.get(where.id) ?? null,
        },
        storageSetting: {
            findFirst: async () => dbState.storage,
            upsert: async ({
                create,
                update,
            }: {
                where: { id: string };
                create: Partial<StorageRow>;
                update: Partial<StorageRow>;
            }) => {
                const now = new Date();
                if (dbState.storage) {
                    dbState.storage = {
                        ...dbState.storage,
                        ...update,
                        updatedAt: now,
                    } as StorageRow;
                } else {
                    dbState.storage = {
                        id: "singleton",
                        provider: "MINIO",
                        config: {},
                        updatedAt: now,
                        updatedBy: null,
                        ...create,
                    } as StorageRow;
                }
                return dbState.storage;
            },
        },
    },
}));

// ─── Factory mock: controllable test() behavior ────────────────────────

type TestBehavior = "ok" | "throw";
const factoryState: { behavior: TestBehavior } = { behavior: "ok" };

mock.module("../storage/factory", () => ({
    getProviderByType: (_type: string, _config: unknown) => ({
        async ensureBucket() {
            if (factoryState.behavior === "throw") {
                throw new Error("boom");
            }
        },
    }),
    invalidateProviderCache: () => { },
}));

// ─── Imports (after mocks) ─────────────────────────────────────────────

type AdminApp = { handle: (req: Request) => Promise<Response> };
let app: AdminApp;

beforeAll(async () => {
    const mod = await import("../admin-storage");
    app = mod.adminStorageRoutes as unknown as AdminApp;
});

// ─── Helpers ───────────────────────────────────────────────────────────

function adminToken(id = "admin-storage-test"): string {
    const secret = process.env.JWT_SECRET || "test-secret";
    return jsonwebtoken.sign({ userId: id, email: "admin@test.local" }, secret);
}

function userToken(id = "not-an-admin"): string {
    const secret = process.env.JWT_SECRET || "test-secret";
    return jsonwebtoken.sign({ userId: id, email: "user@test.local" }, secret);
}

async function readJson(res: Response): Promise<Record<string, unknown> | null> {
    const text = await res.text();
    if (!text) return null;
    try {
        return JSON.parse(text) as Record<string, unknown>;
    } catch {
        return null;
    }
}

function authHeader(tok?: string): Record<string, string> {
    return tok ? { authorization: `Bearer ${tok}` } : {};
}

const VALID_MINIO_CONFIG = {
    endpoint: "minio",
    port: 9000,
    useSSL: false,
    accessKey: "AKIAABCDEFGHIJKLMNOP",
    secretKey: "SECRETABCDEFGHIJKLMNOP1234",
    bucket: "uploads",
};

const VALID_R2_CONFIG = {
    accountId: "acct-123",
    accessKeyId: "R2AKEYABCDEFGHIJKLMN",
    secretAccessKey: "R2SECRETABCDEFGHIJKLMN1234",
    bucket: "car2hand",
    publicUrl: "https://cdn.example.com",
};

// ─── GET /admin/settings/storage ───────────────────────────────────────

describe("GET /admin/settings/storage — auth", () => {
    test("401 without Bearer token", async () => {
        const res = await app.handle(new Request("http://localhost/admin/settings/storage"));
        expect(res.status).toBe(401);
    });

    test("401 with bogus Bearer token", async () => {
        const res = await app.handle(new Request("http://localhost/admin/settings/storage", {
            headers: { authorization: "Bearer not-a-real-jwt" },
        }));
        expect(res.status).toBe(401);
    });

    test("403 when token valid but user is not an admin", async () => {
        const res = await app.handle(new Request("http://localhost/admin/settings/storage", {
            headers: authHeader(userToken()),
        }));
        expect(res.status).toBe(403);
    });
});

describe("GET /admin/settings/storage — happy path", () => {
    test("200 returns provider + config with secrets redacted", async () => {
        dbState.storage = {
            id: "singleton",
            provider: "MINIO",
            config: { ...VALID_MINIO_CONFIG },
            updatedAt: new Date(),
            updatedBy: "admin-storage-test",
        };

        const res = await app.handle(new Request("http://localhost/admin/settings/storage", {
            headers: authHeader(adminToken()),
        }));
        expect(res.status).toBe(200);
        const body = await readJson(res);
        expect(body).not.toBeNull();
        expect(body!.provider).toBe("MINIO");

        const cfg = body!.config as Record<string, unknown>;
        // public fields are preserved
        expect(cfg.bucket).toBe("uploads");
        expect(cfg.endpoint).toBe("minio");
        // secrets redacted to ****xxxx (last 4 chars)
        expect(typeof cfg.accessKey).toBe("string");
        expect(cfg.accessKey as string).toMatch(/^\*\*\*\*.{4}$/);
        expect(cfg.secretKey as string).toMatch(/^\*\*\*\*.{4}$/);
        // last 4 of the real value preserved
        expect((cfg.accessKey as string).slice(-4)).toBe(VALID_MINIO_CONFIG.accessKey.slice(-4));
        expect((cfg.secretKey as string).slice(-4)).toBe(VALID_MINIO_CONFIG.secretKey.slice(-4));
    });

    test("200 returns R2 secrets redacted using R2 field names", async () => {
        dbState.storage = {
            id: "singleton",
            provider: "CLOUDFLARE_R2",
            config: { ...VALID_R2_CONFIG },
            updatedAt: new Date(),
            updatedBy: "admin-storage-test",
        };
        const res = await app.handle(new Request("http://localhost/admin/settings/storage", {
            headers: authHeader(adminToken()),
        }));
        expect(res.status).toBe(200);
        const body = await readJson(res);
        const cfg = body!.config as Record<string, unknown>;
        expect(cfg.bucket).toBe("car2hand");
        expect(cfg.publicUrl).toBe("https://cdn.example.com");
        expect(cfg.accessKeyId as string).toMatch(/^\*\*\*\*.{4}$/);
        expect(cfg.secretAccessKey as string).toMatch(/^\*\*\*\*.{4}$/);
    });
});

// ─── PUT /admin/settings/storage ───────────────────────────────────────

describe("PUT /admin/settings/storage — auth", () => {
    test("401 without Bearer token", async () => {
        const res = await app.handle(new Request("http://localhost/admin/settings/storage", {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ provider: "MINIO", config: VALID_MINIO_CONFIG }),
        }));
        expect(res.status).toBe(401);
    });

    test("403 for non-admin", async () => {
        const res = await app.handle(new Request("http://localhost/admin/settings/storage", {
            method: "PUT",
            headers: { "content-type": "application/json", ...authHeader(userToken()) },
            body: JSON.stringify({ provider: "MINIO", config: VALID_MINIO_CONFIG }),
        }));
        expect(res.status).toBe(403);
    });
});

describe("PUT /admin/settings/storage — validation", () => {
    test("400 on MinIO config without bucket", async () => {
        const res = await app.handle(new Request("http://localhost/admin/settings/storage", {
            method: "PUT",
            headers: { "content-type": "application/json", ...authHeader(adminToken()) },
            body: JSON.stringify({
                provider: "MINIO",
                config: { endpoint: "x", port: 9000, useSSL: false, accessKey: "a", secretKey: "s" },
            }),
        }));
        expect(res.status).toBe(400);
    });

    test("400 on R2 config missing publicUrl", async () => {
        const res = await app.handle(new Request("http://localhost/admin/settings/storage", {
            method: "PUT",
            headers: { "content-type": "application/json", ...authHeader(adminToken()) },
            body: JSON.stringify({
                provider: "CLOUDFLARE_R2",
                config: { accountId: "a", accessKeyId: "k", secretAccessKey: "s", bucket: "b" },
            }),
        }));
        expect(res.status).toBe(400);
    });
});

describe("PUT /admin/settings/storage — happy path", () => {
    test("200 updates DB row and reflects updatedBy", async () => {
        dbState.storage = null;
        const res = await app.handle(new Request("http://localhost/admin/settings/storage", {
            method: "PUT",
            headers: { "content-type": "application/json", ...authHeader(adminToken()) },
            body: JSON.stringify({ provider: "MINIO", config: VALID_MINIO_CONFIG }),
        }));
        expect(res.status).toBe(200);
        expect(dbState.storage).not.toBeNull();
        expect(dbState.storage!.provider).toBe("MINIO");
        expect((dbState.storage!.config as { bucket: string }).bucket).toBe("uploads");
        expect(dbState.storage!.updatedBy).toBe("admin-storage-test");
    });

    test("200 switches provider to CLOUDFLARE_R2", async () => {
        dbState.storage = null;
        const res = await app.handle(new Request("http://localhost/admin/settings/storage", {
            method: "PUT",
            headers: { "content-type": "application/json", ...authHeader(adminToken()) },
            body: JSON.stringify({ provider: "CLOUDFLARE_R2", config: VALID_R2_CONFIG }),
        }));
        expect(res.status).toBe(200);
        expect(dbState.storage!.provider).toBe("CLOUDFLARE_R2");
        expect((dbState.storage!.config as { bucket: string }).bucket).toBe("car2hand");
    });

    test("response body has secrets redacted even on successful update", async () => {
        dbState.storage = null;
        const res = await app.handle(new Request("http://localhost/admin/settings/storage", {
            method: "PUT",
            headers: { "content-type": "application/json", ...authHeader(adminToken()) },
            body: JSON.stringify({ provider: "MINIO", config: VALID_MINIO_CONFIG }),
        }));
        const body = await readJson(res);
        const cfg = body!.config as Record<string, unknown>;
        expect(cfg.secretKey as string).toMatch(/^\*\*\*\*.{4}$/);
    });
});

// ─── POST /admin/settings/storage/test ─────────────────────────────────

describe("POST /admin/settings/storage/test — auth", () => {
    test("401 without Bearer", async () => {
        const res = await app.handle(new Request("http://localhost/admin/settings/storage/test", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ provider: "MINIO", config: VALID_MINIO_CONFIG }),
        }));
        expect(res.status).toBe(401);
    });

    test("403 for non-admin user", async () => {
        const res = await app.handle(new Request("http://localhost/admin/settings/storage/test", {
            method: "POST",
            headers: { "content-type": "application/json", ...authHeader(userToken()) },
            body: JSON.stringify({ provider: "MINIO", config: VALID_MINIO_CONFIG }),
        }));
        expect(res.status).toBe(403);
    });
});

describe("POST /admin/settings/storage/test — behavior", () => {
    test("happy path → { ok: true, latencyMs: number }", async () => {
        factoryState.behavior = "ok";
        const res = await app.handle(new Request("http://localhost/admin/settings/storage/test", {
            method: "POST",
            headers: { "content-type": "application/json", ...authHeader(adminToken()) },
            body: JSON.stringify({ provider: "MINIO", config: VALID_MINIO_CONFIG }),
        }));
        expect(res.status).toBe(200);
        const body = await readJson(res);
        expect(body!.ok).toBe(true);
        expect(typeof body!.latencyMs).toBe("number");
    });

    test("provider throws → { ok: false, message: string }", async () => {
        factoryState.behavior = "throw";
        const res = await app.handle(new Request("http://localhost/admin/settings/storage/test", {
            method: "POST",
            headers: { "content-type": "application/json", ...authHeader(adminToken()) },
            body: JSON.stringify({ provider: "MINIO", config: VALID_MINIO_CONFIG }),
        }));
        expect(res.status).toBe(200);
        const body = await readJson(res);
        expect(body!.ok).toBe(false);
        expect(typeof body!.message).toBe("string");
    });

    test("test endpoint does NOT persist to DB (setting unchanged before/after)", async () => {
        // Seed a known state
        dbState.storage = {
            id: "singleton",
            provider: "MINIO",
            config: { ...VALID_MINIO_CONFIG },
            updatedAt: new Date("2026-01-01"),
            updatedBy: "someone-else",
        };
        const before = JSON.stringify(dbState.storage);

        factoryState.behavior = "ok";
        await app.handle(new Request("http://localhost/admin/settings/storage/test", {
            method: "POST",
            headers: { "content-type": "application/json", ...authHeader(adminToken()) },
            body: JSON.stringify({ provider: "CLOUDFLARE_R2", config: VALID_R2_CONFIG }),
        }));

        factoryState.behavior = "throw";
        await app.handle(new Request("http://localhost/admin/settings/storage/test", {
            method: "POST",
            headers: { "content-type": "application/json", ...authHeader(adminToken()) },
            body: JSON.stringify({ provider: "CLOUDFLARE_R2", config: VALID_R2_CONFIG }),
        }));

        const after = JSON.stringify(dbState.storage);
        expect(after).toBe(before);
    });
});
