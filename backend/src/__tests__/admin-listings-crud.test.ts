/**
 * Admin listings CRUD route tests — /admin/listings/:id GET/PUT/DELETE.
 *
 * Targets the `listings` group inside `adminRoutes` (admin.ts). That group
 * uses its own local JWT-only derive (no prisma.admin lookup), so a signed
 * JWT with matching JWT_SECRET verifies fine via @elysiajs/jwt.
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
    token = makeAdminToken("admin-listings-test");
});

function seedListing(id: string, extras: Record<string, unknown> = {}) {
    db._store.listings.set(id, {
        id,
        userId: "seller-1",
        title: "Toyota Camry 2020",
        description: "สภาพนางฟ้า",
        price: 550000,
        mileage: 45000,
        province: "กรุงเทพ",
        district: "บางนา",
        color: "ขาว",
        condition: "EXCELLENT",
        status: "ACTIVE",
        isFeatured: false,
        isPremium: false,
        // relations that GET /:id's include would pull — stubbed lightly
        user: null,
        images: [],
        bumpLogs: [],
        renewals: [],
        ...extras,
    });
}

// ─── Auth ───────────────────────────────────────────────────────────

describe("admin/listings — auth guard", () => {
    test("GET /:id without Bearer → 401", async () => {
        const res = await app.handle(new Request("http://localhost/admin/listings/l1"));
        expect(res.status).toBe(401);
    });

    test("PUT /:id without Bearer → 401", async () => {
        const res = await app.handle(new Request("http://localhost/admin/listings/l1", {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ title: "X" }),
        }));
        expect(res.status).toBe(401);
    });

    test("DELETE /:id with bogus Bearer → 401", async () => {
        const res = await app.handle(new Request("http://localhost/admin/listings/l1", {
            method: "DELETE",
            headers: { authorization: "Bearer not-a-real-jwt" },
        }));
        expect(res.status).toBe(401);
    });
});

// ─── GET /admin/listings/:id ────────────────────────────────────────

describe("GET /admin/listings/:id", () => {
    test("returns listing shape on happy path", async () => {
        seedListing("lst-get-1");
        const res = await app.handle(new Request("http://localhost/admin/listings/lst-get-1", {
            headers: authHeaders(token),
        }));
        expect(res.status).toBe(200);
        const body = await readJson(res);
        expect(body!.listing).toBeDefined();
        expect((body!.listing as { id: string }).id).toBe("lst-get-1");
    });

    test("404 when listing missing", async () => {
        const res = await app.handle(new Request("http://localhost/admin/listings/not-here", {
            headers: authHeaders(token),
        }));
        expect(res.status).toBe(404);
        const body = await readJson(res);
        expect(body!.message).toBe("ไม่พบประกาศนี้");
    });
});

// ─── PUT /admin/listings/:id ────────────────────────────────────────

describe("PUT /admin/listings/:id", () => {
    test("updates accepted fields and writes audit log + returns {message, listing}", async () => {
        seedListing("lst-put-1", { title: "เก่า" });

        const res = await app.handle(new Request("http://localhost/admin/listings/lst-put-1", {
            method: "PUT",
            headers: { "content-type": "application/json", ...authHeaders(token) },
            body: JSON.stringify({ title: "ใหม่", price: 499000, isFeatured: true }),
        }));

        expect(res.status).toBe(200);
        const body = await readJson(res);
        expect(body!.message).toBe("อัปเดตประกาศสำเร็จ");
        const listing = body!.listing as { title: string; price: number; isFeatured: boolean };
        expect(listing.title).toBe("ใหม่");
        expect(listing.price).toBe(499000);
        expect(listing.isFeatured).toBe(true);

        const audit = db._store.auditLogs.find((l) => l.action === "LISTING_UPDATE" && l.targetId === "lst-put-1");
        expect(audit).toBeDefined();
        expect(audit!.adminId).toBe("admin-listings-test");
        expect(audit!.targetType).toBe("LISTING");
        const meta = audit!.metadata as { changedFields: string[] };
        expect(meta.changedFields).toContain("title");
        expect(meta.changedFields).toContain("price");
        expect(meta.changedFields).toContain("isFeatured");
    });

    test("404 when listing missing", async () => {
        const res = await app.handle(new Request("http://localhost/admin/listings/ghost", {
            method: "PUT",
            headers: { "content-type": "application/json", ...authHeaders(token) },
            body: JSON.stringify({ title: "X" }),
        }));
        expect(res.status).toBe(404);
    });
});

// ─── DELETE /admin/listings/:id ─────────────────────────────────────

describe("DELETE /admin/listings/:id", () => {
    test("hard-deletes and writes audit log", async () => {
        seedListing("lst-del-1", { title: "to-be-deleted" });
        const res = await app.handle(new Request("http://localhost/admin/listings/lst-del-1", {
            method: "DELETE",
            headers: authHeaders(token),
        }));
        expect(res.status).toBe(200);
        const body = await readJson(res);
        expect(body!.message).toBe("ลบประกาศเรียบร้อย");
        expect(db._store.listings.has("lst-del-1")).toBe(false);

        const audit = db._store.auditLogs.find((l) => l.action === "LISTING_DELETE" && l.targetId === "lst-del-1");
        expect(audit).toBeDefined();
        const meta = audit!.metadata as { ownerId: string; title: string };
        expect(meta.ownerId).toBe("seller-1");
        expect(meta.title).toBe("to-be-deleted");
    });

    test("404 when listing missing", async () => {
        const res = await app.handle(new Request("http://localhost/admin/listings/ghost", {
            method: "DELETE",
            headers: authHeaders(token),
        }));
        expect(res.status).toBe(404);
    });
});
