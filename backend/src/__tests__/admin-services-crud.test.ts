/**
 * Admin services CRUD route tests (inspection bookings + service inquiries).
 *
 * Covers GET/DELETE bookings/:id and inquiries/:id, plus auth guard.
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
    const mod = await import("../admin-services");
    app = mod.adminServiceRoutes as unknown as AdminApp;
    token = makeAdminToken("admin-services-test");
});

function seedBooking(id: string, extras: Record<string, unknown> = {}) {
    db._store.bookings.set(id, {
        id,
        contactName: "สมชาย ทดสอบ",
        contactPhone: "0812345678",
        brandName: "Toyota",
        modelName: "Camry",
        status: "PENDING",
        ...extras,
    });
}

function seedInquiry(id: string, extras: Record<string, unknown> = {}) {
    db._store.inquiries.set(id, {
        id,
        contactName: "สมหญิง ทดสอบ",
        contactPhone: "0823456789",
        type: "FINANCING",
        status: "NEW",
        ...extras,
    });
}

// ─── Auth ───────────────────────────────────────────────────────────

describe("admin/services — auth guard", () => {
    test("GET booking without auth → 401", async () => {
        const res = await app.handle(new Request("http://localhost/admin/services/bookings/b1"));
        expect(res.status).toBe(401);
        const body = await readJson(res);
        expect(body!.message).toBe("กรุณาเข้าสู่ระบบ Admin");
    });

    test("DELETE booking without auth → 401", async () => {
        const res = await app.handle(new Request("http://localhost/admin/services/bookings/b1", { method: "DELETE" }));
        expect(res.status).toBe(401);
    });

    test("GET inquiry with bogus token → 401", async () => {
        const res = await app.handle(new Request("http://localhost/admin/services/inquiries/i1", {
            headers: { authorization: "Bearer nonsense" },
        }));
        expect(res.status).toBe(401);
    });
});

// ─── GET bookings/:id ───────────────────────────────────────────────

describe("GET /admin/services/bookings/:id", () => {
    test("returns booking shape on happy path", async () => {
        seedBooking("b-get-1");
        const res = await app.handle(new Request("http://localhost/admin/services/bookings/b-get-1", {
            headers: authHeaders(token),
        }));
        expect(res.status).toBe(200);
        const body = await readJson(res);
        expect(body!.booking).toBeDefined();
        expect((body!.booking as { id: string }).id).toBe("b-get-1");
    });

    test("404 when booking missing", async () => {
        const res = await app.handle(new Request("http://localhost/admin/services/bookings/not-here", {
            headers: authHeaders(token),
        }));
        expect(res.status).toBe(404);
        const body = await readJson(res);
        expect(body!.message).toBe("ไม่พบการจอง");
    });
});

// ─── DELETE bookings/:id ────────────────────────────────────────────

describe("DELETE /admin/services/bookings/:id", () => {
    test("removes booking and writes audit log", async () => {
        seedBooking("b-del-1");
        const res = await app.handle(new Request("http://localhost/admin/services/bookings/b-del-1", {
            method: "DELETE",
            headers: authHeaders(token),
        }));
        expect(res.status).toBe(200);
        const body = await readJson(res);
        expect(body!.message).toBe("ลบการจองเรียบร้อย");
        expect(db._store.bookings.has("b-del-1")).toBe(false);

        const audit = db._store.auditLogs.find((l) => l.action === "BOOKING_DELETE" && l.targetId === "b-del-1");
        expect(audit).toBeDefined();
        expect(audit!.adminId).toBe("admin-services-test");
        expect(audit!.targetType).toBe("BOOKING");
    });

    test("404 when booking missing", async () => {
        const res = await app.handle(new Request("http://localhost/admin/services/bookings/ghost", {
            method: "DELETE",
            headers: authHeaders(token),
        }));
        expect(res.status).toBe(404);
    });
});

// ─── GET inquiries/:id ──────────────────────────────────────────────

describe("GET /admin/services/inquiries/:id", () => {
    test("returns inquiry shape on happy path", async () => {
        seedInquiry("i-get-1");
        const res = await app.handle(new Request("http://localhost/admin/services/inquiries/i-get-1", {
            headers: authHeaders(token),
        }));
        expect(res.status).toBe(200);
        const body = await readJson(res);
        expect(body!.inquiry).toBeDefined();
        expect((body!.inquiry as { id: string }).id).toBe("i-get-1");
    });

    test("404 when inquiry missing", async () => {
        const res = await app.handle(new Request("http://localhost/admin/services/inquiries/not-here", {
            headers: authHeaders(token),
        }));
        expect(res.status).toBe(404);
        const body = await readJson(res);
        expect(body!.message).toBe("ไม่พบรายการสอบถาม");
    });
});

// ─── DELETE inquiries/:id ───────────────────────────────────────────

describe("DELETE /admin/services/inquiries/:id", () => {
    test("removes inquiry and writes audit log", async () => {
        seedInquiry("i-del-1");
        const res = await app.handle(new Request("http://localhost/admin/services/inquiries/i-del-1", {
            method: "DELETE",
            headers: authHeaders(token),
        }));
        expect(res.status).toBe(200);
        expect(db._store.inquiries.has("i-del-1")).toBe(false);

        const audit = db._store.auditLogs.find((l) => l.action === "INQUIRY_DELETE" && l.targetId === "i-del-1");
        expect(audit).toBeDefined();
        expect(audit!.targetType).toBe("INQUIRY");
    });

    test("404 when inquiry missing", async () => {
        const res = await app.handle(new Request("http://localhost/admin/services/inquiries/ghost", {
            method: "DELETE",
            headers: authHeaders(token),
        }));
        expect(res.status).toBe(404);
    });
});
