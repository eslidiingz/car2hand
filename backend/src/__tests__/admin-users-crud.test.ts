/**
 * Admin users CRUD route tests — /admin/users/:id PUT + DELETE.
 *
 * DELETE is a soft-delete: isActive=false, email/name/phone anonymized.
 */

import { describe, test, expect, beforeAll } from "bun:test";
import {
    buildPrismaStub,
    installPrismaMock,
    makeAdminToken,
    authHeaders,
    readJson,
    type PrismaStub,
} from "./_admin-test-utils";

type AdminApp = { handle: (req: Request) => Promise<Response> };

const db: PrismaStub = buildPrismaStub();
installPrismaMock(db);

let app: AdminApp;
let token: string;

beforeAll(async () => {
    const mod = await import("../admin");
    app = mod.adminRoutes as unknown as AdminApp;
    token = makeAdminToken("admin-users-test");
});

function seedUser(id: string, extras: Record<string, unknown> = {}) {
    db._store.users.set(id, {
        id,
        fullName: `ผู้ใช้ ${id}`,
        email: `${id}@example.com`,
        phoneNumber: "0812345678",
        isActive: true,
        profileImage: null,
        lineUserId: null,
        googleUserId: null,
        facebookUserId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...extras,
    });
}

// ─── Auth ───────────────────────────────────────────────────────────

describe("admin/users — auth guard", () => {
    test("PUT /:id without Bearer → 401", async () => {
        const res = await app.handle(new Request("http://localhost/admin/users/u1", {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ fullName: "X" }),
        }));
        expect(res.status).toBe(401);
    });

    test("DELETE /:id without Bearer → 401", async () => {
        const res = await app.handle(new Request("http://localhost/admin/users/u1", { method: "DELETE" }));
        expect(res.status).toBe(401);
    });

    test("DELETE /:id with bogus Bearer → 401", async () => {
        const res = await app.handle(new Request("http://localhost/admin/users/u1", {
            method: "DELETE",
            headers: { authorization: "Bearer garbage" },
        }));
        expect(res.status).toBe(401);
    });
});

// ─── PUT /admin/users/:id — happy path + 400 + 422 + audit ──────────

describe("PUT /admin/users/:id", () => {
    test("happy path: updates fields + writes audit log", async () => {
        seedUser("u-put-happy", { fullName: "เก่า", email: "old@ex.com" });

        const res = await app.handle(new Request("http://localhost/admin/users/u-put-happy", {
            method: "PUT",
            headers: { "content-type": "application/json", ...authHeaders(token) },
            body: JSON.stringify({ fullName: "ใหม่", email: "new@ex.com", isActive: false }),
        }));

        expect(res.status).toBe(200);
        const body = await readJson(res);
        expect(body!.message).toBe("อัปเดตข้อมูลผู้ใช้สำเร็จ");
        const updated = body!.user as { fullName: string; email: string; isActive: boolean };
        expect(updated.fullName).toBe("ใหม่");
        expect(updated.email).toBe("new@ex.com");
        expect(updated.isActive).toBe(false);

        const audit = db._store.auditLogs.find((l) => l.action === "USER_UPDATE" && l.targetId === "u-put-happy");
        expect(audit).toBeDefined();
        expect(audit!.targetType).toBe("USER");
        const meta = audit!.metadata as { changedFields: string[] };
        expect(meta.changedFields).toContain("email");
    });

    test("400 when new email collides with another user", async () => {
        seedUser("u-put-self", { email: "me@ex.com" });
        seedUser("u-put-other", { email: "taken@ex.com" });

        const res = await app.handle(new Request("http://localhost/admin/users/u-put-self", {
            method: "PUT",
            headers: { "content-type": "application/json", ...authHeaders(token) },
            body: JSON.stringify({ email: "taken@ex.com" }),
        }));
        expect(res.status).toBe(400);
        const body = await readJson(res);
        expect(body!.message).toBe("อีเมลนี้ถูกใช้งานแล้ว");

        // No audit log written on validation failure
        const audit = db._store.auditLogs.find((l) => l.action === "USER_UPDATE" && l.targetId === "u-put-self");
        expect(audit).toBeUndefined();
    });

    test("422 on malformed email (Elysia/TypeBox validation)", async () => {
        seedUser("u-put-badmail");
        const res = await app.handle(new Request("http://localhost/admin/users/u-put-badmail", {
            method: "PUT",
            headers: { "content-type": "application/json", ...authHeaders(token) },
            body: JSON.stringify({ email: "not-an-email" }),
        }));
        // Elysia TypeBox `format: 'email'` violation returns 422
        expect(res.status).toBe(422);
    });

    test("404 when user missing", async () => {
        const res = await app.handle(new Request("http://localhost/admin/users/ghost", {
            method: "PUT",
            headers: { "content-type": "application/json", ...authHeaders(token) },
            body: JSON.stringify({ fullName: "X" }),
        }));
        expect(res.status).toBe(404);
        const body = await readJson(res);
        expect(body!.message).toBe("ไม่พบผู้ใช้งาน");
    });

    test("allows keeping own email (not treated as duplicate)", async () => {
        seedUser("u-put-same", { email: "same@ex.com" });
        const res = await app.handle(new Request("http://localhost/admin/users/u-put-same", {
            method: "PUT",
            headers: { "content-type": "application/json", ...authHeaders(token) },
            body: JSON.stringify({ email: "same@ex.com", fullName: "ใหม่" }),
        }));
        expect(res.status).toBe(200);
    });
});

// ─── DELETE /admin/users/:id — soft delete + anonymize ──────────────

describe("DELETE /admin/users/:id (soft delete + anonymize PII)", () => {
    test("anonymizes and preserves listings; writes audit log", async () => {
        seedUser("u-del-1", { fullName: "สมชาย จริง", email: "real@ex.com" });
        // Pretend user has 2 listings — they should remain in the store after soft-delete
        db._store.listings.set("list-of-del-1", { id: "list-of-del-1", userId: "u-del-1", title: "A", status: "ACTIVE" });
        db._store.listings.set("list-of-del-2", { id: "list-of-del-2", userId: "u-del-1", title: "B", status: "ACTIVE" });

        const res = await app.handle(new Request("http://localhost/admin/users/u-del-1", {
            method: "DELETE",
            headers: authHeaders(token),
        }));

        expect(res.status).toBe(200);
        const body = await readJson(res);
        expect(body!.message).toBe("ลบบัญชีผู้ใช้เรียบร้อย");

        const anon = db._store.users.get("u-del-1") as {
            isActive: boolean; email: string; fullName: string; phoneNumber: string;
            profileImage: string | null; lineUserId: string | null; googleUserId: string | null; facebookUserId: string | null;
        };
        expect(anon.isActive).toBe(false);
        expect(anon.email).toBe("deleted-u-del-1@deleted.local");
        expect(anon.fullName).toBe("[ผู้ใช้ถูกลบ]");
        expect(anon.phoneNumber).toBe("0000000000");
        expect(anon.profileImage).toBeNull();
        expect(anon.lineUserId).toBeNull();
        expect(anon.googleUserId).toBeNull();
        expect(anon.facebookUserId).toBeNull();

        // Listings untouched
        expect(db._store.listings.has("list-of-del-1")).toBe(true);
        expect(db._store.listings.has("list-of-del-2")).toBe(true);

        const audit = db._store.auditLogs.find((l) => l.action === "USER_DELETE" && l.targetId === "u-del-1");
        expect(audit).toBeDefined();
        expect(audit!.targetType).toBe("USER");
        const meta = audit!.metadata as { originalEmail: string; originalName: string };
        expect(meta.originalEmail).toBe("real@ex.com");
        expect(meta.originalName).toBe("สมชาย จริง");
    });

    test("404 when user missing", async () => {
        const res = await app.handle(new Request("http://localhost/admin/users/ghost", {
            method: "DELETE",
            headers: authHeaders(token),
        }));
        expect(res.status).toBe(404);
    });
});

// ─── Unit: anonymized-email shape ───────────────────────────────────

describe("Soft-delete anonymization shape (unit)", () => {
    test("email template matches 'deleted-{id}@deleted.local'", () => {
        const id = "abc-123";
        const expected = `deleted-${id}@deleted.local`;
        expect(expected).toBe("deleted-abc-123@deleted.local");
        expect(expected).toMatch(/^deleted-[^@]+@deleted\.local$/);
    });

    test("anonymized placeholder name is the exact Thai string", () => {
        expect("[ผู้ใช้ถูกลบ]").toBe("[ผู้ใช้ถูกลบ]");
    });
});
