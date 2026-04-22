/**
 * Admin seller-profile CRUD route tests.
 *
 * Covers list/detail/update, manual verify + unverify, including the default
 * verificationLevel fallback ("current=NONE → defaults to INDIVIDUAL").
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
    const mod = await import("../admin-seller-profiles");
    app = mod.adminSellerProfileRoutes as unknown as AdminApp;
    token = makeAdminToken("admin-seller-test");
});

function seedSeller(id: string, extras: Record<string, unknown> = {}) {
    db._store.sellerProfiles.set(id, {
        id,
        userId: `user-${id}`,
        shopName: `ร้าน-${id}`,
        showroomType: "INDIVIDUAL",
        verificationLevel: "NONE",
        isVerified: false,
        verifiedAt: null,
        totalSoldCount: 0,
        createdAt: new Date(),
        ...extras,
    });
}

// ─── Auth ───────────────────────────────────────────────────────────

describe("admin/seller-profiles — auth guard", () => {
    test("list without auth → 401", async () => {
        const res = await app.handle(new Request("http://localhost/admin/seller-profiles"));
        expect(res.status).toBe(401);
        const body = await readJson(res);
        expect(body!.message).toBe("กรุณาเข้าสู่ระบบ Admin");
    });

    test("detail without auth → 401", async () => {
        const res = await app.handle(new Request("http://localhost/admin/seller-profiles/s1"));
        expect(res.status).toBe(401);
    });

    test("verify without auth → 401", async () => {
        const res = await app.handle(new Request("http://localhost/admin/seller-profiles/s1/verify", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: "{}",
        }));
        expect(res.status).toBe(401);
    });
});

// ─── GET / (list, pagination, filters) ──────────────────────────────

describe("GET /admin/seller-profiles (list)", () => {
    test("returns pagination shape", async () => {
        seedSeller("pg-1");
        seedSeller("pg-2");
        seedSeller("pg-3");

        const res = await app.handle(new Request("http://localhost/admin/seller-profiles?page=1&limit=2", {
            headers: authHeaders(token),
        }));
        expect(res.status).toBe(200);
        const body = await readJson(res);
        expect(body!.sellers).toBeDefined();
        const pag = body!.pagination as { total: number; page: number; limit: number; totalPages: number };
        expect(pag.page).toBe(1);
        expect(pag.limit).toBe(2);
        expect(typeof pag.total).toBe("number");
        expect(pag.totalPages).toBeGreaterThanOrEqual(1);
    });

    test("filters by verificationLevel", async () => {
        // Existing pg-1/2/3 are NONE; seed INDIVIDUAL + CORPORATE
        seedSeller("vl-ind", { verificationLevel: "INDIVIDUAL" });
        seedSeller("vl-corp", { verificationLevel: "CORPORATE" });

        const res = await app.handle(new Request("http://localhost/admin/seller-profiles?verificationLevel=CORPORATE", {
            headers: authHeaders(token),
        }));
        const body = await readJson(res);
        const sellers = body!.sellers as Array<{ verificationLevel: string }>;
        expect(sellers.length).toBeGreaterThan(0);
        expect(sellers.every((s) => s.verificationLevel === "CORPORATE")).toBe(true);
    });

    test("filters by showroomType=CORPORATE", async () => {
        seedSeller("st-corp", { showroomType: "CORPORATE" });
        const res = await app.handle(new Request("http://localhost/admin/seller-profiles?showroomType=CORPORATE", {
            headers: authHeaders(token),
        }));
        const body = await readJson(res);
        const sellers = body!.sellers as Array<{ showroomType: string }>;
        expect(sellers.every((s) => s.showroomType === "CORPORATE")).toBe(true);
    });

    test("filters by isVerified=true", async () => {
        seedSeller("iv-true", { isVerified: true, verificationLevel: "INDIVIDUAL" });
        const res = await app.handle(new Request("http://localhost/admin/seller-profiles?isVerified=true", {
            headers: authHeaders(token),
        }));
        const body = await readJson(res);
        const sellers = body!.sellers as Array<{ isVerified: boolean }>;
        expect(sellers.length).toBeGreaterThan(0);
        expect(sellers.every((s) => s.isVerified === true)).toBe(true);
    });

    test("ignores unknown verificationLevel value", async () => {
        const res = await app.handle(new Request("http://localhost/admin/seller-profiles?verificationLevel=BOGUS", {
            headers: authHeaders(token),
        }));
        expect(res.status).toBe(200);
        // unknown value is silently dropped — route must not 400
    });
});

// ─── GET /:id ───────────────────────────────────────────────────────

describe("GET /admin/seller-profiles/:id", () => {
    test("returns { seller, stats } shape", async () => {
        seedSeller("detail-1", { totalSoldCount: 7 });
        const res = await app.handle(new Request("http://localhost/admin/seller-profiles/detail-1", {
            headers: authHeaders(token),
        }));
        expect(res.status).toBe(200);
        const body = await readJson(res);
        expect(body!.seller).toBeDefined();
        expect(body!.stats).toBeDefined();
        const stats = body!.stats as { listingCount: number; totalSoldCount: number; soldListingCount: number };
        expect(typeof stats.listingCount).toBe("number");
        expect(stats.totalSoldCount).toBe(7);
        expect(typeof stats.soldListingCount).toBe("number");
    });

    test("404 when seller missing", async () => {
        const res = await app.handle(new Request("http://localhost/admin/seller-profiles/nope", {
            headers: authHeaders(token),
        }));
        expect(res.status).toBe(404);
        const body = await readJson(res);
        expect(body!.message).toBe("ไม่พบโปรไฟล์ผู้ขาย");
    });
});

// ─── PUT /:id ───────────────────────────────────────────────────────

describe("PUT /admin/seller-profiles/:id", () => {
    test("updates fields and writes audit log", async () => {
        seedSeller("put-1", { shopName: "เก่า" });
        const res = await app.handle(new Request("http://localhost/admin/seller-profiles/put-1", {
            method: "PUT",
            headers: { "content-type": "application/json", ...authHeaders(token) },
            body: JSON.stringify({ shopName: "ใหม่", shopProvince: "กรุงเทพ" }),
        }));
        expect(res.status).toBe(200);
        const body = await readJson(res);
        expect(body!.message).toBe("อัปเดตโปรไฟล์ผู้ขายสำเร็จ");
        expect((body!.seller as { shopName: string }).shopName).toBe("ใหม่");

        const audit = db._store.auditLogs.find((l) => l.action === "SELLER_PROFILE_UPDATE" && l.targetId === "put-1");
        expect(audit).toBeDefined();
        expect(audit!.adminId).toBe("admin-seller-test");
    });

    test("400 on invalid verificationLevel", async () => {
        seedSeller("put-bad-level");
        const res = await app.handle(new Request("http://localhost/admin/seller-profiles/put-bad-level", {
            method: "PUT",
            headers: { "content-type": "application/json", ...authHeaders(token) },
            body: JSON.stringify({ verificationLevel: "NOT_A_LEVEL" }),
        }));
        expect(res.status).toBe(400);
        const body = await readJson(res);
        expect(body!.message).toBe("verificationLevel ไม่ถูกต้อง");
    });

    test("404 for missing seller", async () => {
        const res = await app.handle(new Request("http://localhost/admin/seller-profiles/ghost", {
            method: "PUT",
            headers: { "content-type": "application/json", ...authHeaders(token) },
            body: JSON.stringify({ shopName: "X" }),
        }));
        expect(res.status).toBe(404);
    });
});

// ─── POST /:id/verify ───────────────────────────────────────────────

describe("POST /admin/seller-profiles/:id/verify", () => {
    test("defaults to INDIVIDUAL when current=NONE and no level provided", async () => {
        seedSeller("verify-from-none", { verificationLevel: "NONE", isVerified: false });
        const res = await app.handle(new Request("http://localhost/admin/seller-profiles/verify-from-none/verify", {
            method: "POST",
            headers: { "content-type": "application/json", ...authHeaders(token) },
            body: "{}",
        }));
        expect(res.status).toBe(200);
        const body = await readJson(res);
        const seller = body!.seller as { isVerified: boolean; verificationLevel: string; verifiedAt: unknown };
        expect(seller.isVerified).toBe(true);
        expect(seller.verificationLevel).toBe("INDIVIDUAL");
        expect(seller.verifiedAt).not.toBeNull();

        const audit = db._store.auditLogs.find((l) => l.action === "SELLER_PROFILE_VERIFY" && l.targetId === "verify-from-none");
        expect(audit).toBeDefined();
        expect((audit!.metadata as { verificationLevel: string }).verificationLevel).toBe("INDIVIDUAL");
    });

    test("preserves current verificationLevel when already set (e.g. CORPORATE)", async () => {
        seedSeller("verify-from-corp", { verificationLevel: "CORPORATE", isVerified: false });
        const res = await app.handle(new Request("http://localhost/admin/seller-profiles/verify-from-corp/verify", {
            method: "POST",
            headers: { "content-type": "application/json", ...authHeaders(token) },
            body: "{}",
        }));
        const body = await readJson(res);
        const seller = body!.seller as { verificationLevel: string; isVerified: boolean };
        expect(seller.verificationLevel).toBe("CORPORATE");
        expect(seller.isVerified).toBe(true);
    });

    test("honours explicit verificationLevel in body", async () => {
        seedSeller("verify-explicit", { verificationLevel: "NONE" });
        const res = await app.handle(new Request("http://localhost/admin/seller-profiles/verify-explicit/verify", {
            method: "POST",
            headers: { "content-type": "application/json", ...authHeaders(token) },
            body: JSON.stringify({ verificationLevel: "CORPORATE" }),
        }));
        const body = await readJson(res);
        expect((body!.seller as { verificationLevel: string }).verificationLevel).toBe("CORPORATE");
    });

    test("404 when seller missing", async () => {
        const res = await app.handle(new Request("http://localhost/admin/seller-profiles/ghost/verify", {
            method: "POST",
            headers: { "content-type": "application/json", ...authHeaders(token) },
            body: "{}",
        }));
        expect(res.status).toBe(404);
    });
});

// ─── POST /:id/unverify ─────────────────────────────────────────────

describe("POST /admin/seller-profiles/:id/unverify", () => {
    test("resets isVerified=false + verificationLevel=NONE + verifiedAt=null", async () => {
        seedSeller("unverify-1", { isVerified: true, verificationLevel: "CORPORATE", verifiedAt: new Date() });
        const res = await app.handle(new Request("http://localhost/admin/seller-profiles/unverify-1/unverify", {
            method: "POST",
            headers: authHeaders(token),
        }));
        expect(res.status).toBe(200);
        const body = await readJson(res);
        const seller = body!.seller as { isVerified: boolean; verificationLevel: string; verifiedAt: unknown };
        expect(seller.isVerified).toBe(false);
        expect(seller.verificationLevel).toBe("NONE");
        expect(seller.verifiedAt).toBeNull();

        const audit = db._store.auditLogs.find((l) => l.action === "SELLER_PROFILE_UNVERIFY" && l.targetId === "unverify-1");
        expect(audit).toBeDefined();
    });

    test("404 when seller missing", async () => {
        const res = await app.handle(new Request("http://localhost/admin/seller-profiles/ghost/unverify", {
            method: "POST",
            headers: authHeaders(token),
        }));
        expect(res.status).toBe(404);
    });
});
