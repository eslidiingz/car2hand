/**
 * Admin global settings route tests — /admin/settings GET (all/one) + PUT.
 *
 * Mirrors the style of admin-listings-crud.test.ts: build an in-memory
 * Prisma stub, install via mock.module BEFORE importing the route module,
 * then drive the routes via Elysia's `.handle(new Request(...))` pattern.
 *
 * The shared _admin-test-utils stub doesn't model `adminSetting` — we
 * extend the stub here with a tiny in-memory map for that table.
 */

import { describe, test, expect, beforeAll, beforeEach } from "bun:test";
import {
    buildPrismaStub,
    installPrismaMock,
    makeAdminToken,
    authHeaders,
    readJson,
    type PrismaStub,
} from "./_admin-test-utils";

type AdminSettingRow = { key: string; value: unknown; updatedAt: Date; updatedBy: string | null };

type SettingsApp = { handle: (req: Request) => Promise<Response> };

// Extend the shared stub with an `adminSetting` model used by admin-settings.ts.
const baseStub: PrismaStub = buildPrismaStub();
const settingsTable = new Map<string, AdminSettingRow>();

const adminSetting = {
    findUnique: async ({ where }: { where: { key: string } }) => settingsTable.get(where.key) ?? null,
    findMany: async () => [...settingsTable.values()],
    upsert: async ({
        where,
        create,
        update,
    }: {
        where: { key: string };
        create: { key: string; value: unknown; updatedBy: string | null };
        update: { value: unknown; updatedBy: string | null };
    }) => {
        const existing = settingsTable.get(where.key);
        if (existing) {
            const next: AdminSettingRow = {
                ...existing,
                value: update.value,
                updatedBy: update.updatedBy,
                updatedAt: new Date(),
            };
            settingsTable.set(where.key, next);
            return next;
        }
        const next: AdminSettingRow = {
            key: create.key,
            value: create.value,
            updatedBy: create.updatedBy,
            updatedAt: new Date(),
        };
        settingsTable.set(where.key, next);
        return next;
    },
};

// Attach adminSetting to the base stub object so the production code sees it
// as `prisma.adminSetting.*`. The base stub's PrismaStub type doesn't list it,
// so we cast to a loose record for the assignment.
(baseStub as unknown as Record<string, unknown>).adminSetting = adminSetting;

installPrismaMock(baseStub);

let app: SettingsApp;
let token: string;

beforeAll(async () => {
    const mod = await import("../admin-settings");
    app = mod.adminSettingsRoutes as unknown as SettingsApp;
    token = makeAdminToken("admin-settings-test");
});

beforeEach(() => {
    settingsTable.clear();
    baseStub._store.auditLogs.length = 0;
});

// ─── Auth ───────────────────────────────────────────────────────────

describe("admin/settings — auth guard", () => {
    test("GET /admin/settings without Bearer → 401", async () => {
        const res = await app.handle(new Request("http://localhost/admin/settings"));
        expect(res.status).toBe(401);
        const body = await readJson(res);
        expect(body!.message).toBe("กรุณาเข้าสู่ระบบ Admin");
    });

    test("GET /admin/settings/:key without Bearer → 401", async () => {
        const res = await app.handle(new Request("http://localhost/admin/settings/basicListingRequiresApproval"));
        expect(res.status).toBe(401);
    });

    test("PUT /admin/settings/:key without Bearer → 401", async () => {
        const res = await app.handle(new Request("http://localhost/admin/settings/basicListingRequiresApproval", {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ value: false }),
        }));
        expect(res.status).toBe(401);
    });

    test("PUT /admin/settings/:key with bogus Bearer → 401", async () => {
        const res = await app.handle(new Request("http://localhost/admin/settings/basicListingRequiresApproval", {
            method: "PUT",
            headers: { "content-type": "application/json", authorization: "Bearer not-a-real-jwt" },
            body: JSON.stringify({ value: false }),
        }));
        expect(res.status).toBe(401);
    });
});

// ─── GET /admin/settings ────────────────────────────────────────────

describe("GET /admin/settings", () => {
    test("returns map with default basicListingRequiresApproval=true when DB row missing", async () => {
        const res = await app.handle(new Request("http://localhost/admin/settings", {
            headers: authHeaders(token),
        }));
        expect(res.status).toBe(200);
        const body = await readJson(res);
        expect(body!.settings).toBeDefined();
        const settings = body!.settings as Record<string, unknown>;
        expect(settings.basicListingRequiresApproval).toBe(true);
    });

    test("reflects stored DB value when present", async () => {
        settingsTable.set("basicListingRequiresApproval", {
            key: "basicListingRequiresApproval",
            value: false,
            updatedAt: new Date(),
            updatedBy: "admin-x",
        });
        const res = await app.handle(new Request("http://localhost/admin/settings", {
            headers: authHeaders(token),
        }));
        expect(res.status).toBe(200);
        const body = await readJson(res);
        const settings = body!.settings as Record<string, unknown>;
        expect(settings.basicListingRequiresApproval).toBe(false);
    });

    test("falls back to default when stored value has wrong type", async () => {
        settingsTable.set("basicListingRequiresApproval", {
            key: "basicListingRequiresApproval",
            value: "garbage-string",
            updatedAt: new Date(),
            updatedBy: null,
        });
        const res = await app.handle(new Request("http://localhost/admin/settings", {
            headers: authHeaders(token),
        }));
        const body = await readJson(res);
        const settings = body!.settings as Record<string, unknown>;
        expect(settings.basicListingRequiresApproval).toBe(true);
    });
});

// ─── GET /admin/settings/:key ───────────────────────────────────────

describe("GET /admin/settings/:key", () => {
    test("returns {key, value:true} default when row missing", async () => {
        const res = await app.handle(new Request("http://localhost/admin/settings/basicListingRequiresApproval", {
            headers: authHeaders(token),
        }));
        expect(res.status).toBe(200);
        const body = await readJson(res);
        expect(body!.key).toBe("basicListingRequiresApproval");
        expect(body!.value).toBe(true);
    });

    test("returns stored value when row present", async () => {
        settingsTable.set("basicListingRequiresApproval", {
            key: "basicListingRequiresApproval",
            value: false,
            updatedAt: new Date(),
            updatedBy: null,
        });
        const res = await app.handle(new Request("http://localhost/admin/settings/basicListingRequiresApproval", {
            headers: authHeaders(token),
        }));
        const body = await readJson(res);
        expect(body!.value).toBe(false);
    });

    test("404 with Thai message for unknown key", async () => {
        const res = await app.handle(new Request("http://localhost/admin/settings/unknownKey", {
            headers: authHeaders(token),
        }));
        expect(res.status).toBe(404);
        const body = await readJson(res);
        expect(body!.message).toBe("ไม่พบการตั้งค่า");
    });
});

// ─── PUT /admin/settings/:key ───────────────────────────────────────

describe("PUT /admin/settings/:key", () => {
    test("happy path — flips value, returns 200, persists, audit log written", async () => {
        const res = await app.handle(new Request("http://localhost/admin/settings/basicListingRequiresApproval", {
            method: "PUT",
            headers: { "content-type": "application/json", ...authHeaders(token) },
            body: JSON.stringify({ value: false }),
        }));
        expect(res.status).toBe(200);
        const body = await readJson(res);
        expect(body!.message).toBe("อัปเดตการตั้งค่าสำเร็จ");
        expect(body!.key).toBe("basicListingRequiresApproval");
        expect(body!.value).toBe(false);

        // GET reflects the new value.
        const getRes = await app.handle(new Request("http://localhost/admin/settings/basicListingRequiresApproval", {
            headers: authHeaders(token),
        }));
        const getBody = await readJson(getRes);
        expect(getBody!.value).toBe(false);

        // Audit log row written.
        const audit = baseStub._store.auditLogs.find((l) => l.action === "SETTING_UPDATE");
        expect(audit).toBeDefined();
        expect(audit!.adminId).toBe("admin-settings-test");
        expect(audit!.targetType).toBe("SETTING");
        expect(audit!.targetId).toBe("basicListingRequiresApproval");
        const meta = audit!.metadata as { changes: Record<string, { before: unknown; after: unknown }> };
        expect(meta.changes).toBeDefined();
        expect(meta.changes.value).toBeDefined();
        expect(meta.changes.value.before).toBe(true); // default before any row existed
        expect(meta.changes.value.after).toBe(false);
    });

    test("400 with Thai validation message when value type is wrong", async () => {
        const res = await app.handle(new Request("http://localhost/admin/settings/basicListingRequiresApproval", {
            method: "PUT",
            headers: { "content-type": "application/json", ...authHeaders(token) },
            body: JSON.stringify({ value: "yes" }),
        }));
        expect(res.status).toBe(400);
        const body = await readJson(res);
        expect(body!.message).toBe("ค่าไม่ถูกต้อง ต้องเป็นชนิด boolean");

        // No persistence and no audit row on validation failure.
        expect(settingsTable.has("basicListingRequiresApproval")).toBe(false);
        expect(baseStub._store.auditLogs.find((l) => l.action === "SETTING_UPDATE")).toBeUndefined();
    });

    test("404 with Thai message when key is unknown", async () => {
        const res = await app.handle(new Request("http://localhost/admin/settings/unknownKey", {
            method: "PUT",
            headers: { "content-type": "application/json", ...authHeaders(token) },
            body: JSON.stringify({ value: true }),
        }));
        expect(res.status).toBe(404);
        const body = await readJson(res);
        expect(body!.message).toBe("ไม่พบการตั้งค่า");
        expect(baseStub._store.auditLogs.find((l) => l.action === "SETTING_UPDATE")).toBeUndefined();
    });
});
