/**
 * Admin garage CRUD route tests.
 *
 * Covers PUT /admin/garage/:id, DELETE /admin/garage/:id,
 * DELETE /admin/garage/service-records/:id, DELETE /admin/garage/reminders/:id.
 *
 * Matches the mock-heavy style used elsewhere in this folder: no real DB, no testcontainers.
 * Prisma is stubbed via `mock.module("../db", ...)` before the route module is dynamically imported.
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
    const mod = await import("../admin-p1");
    app = mod.adminGarageRoutes as unknown as AdminApp;
    token = makeAdminToken("admin-garage-test");
});

function seedVehicle(id: string, extras: Record<string, unknown> = {}) {
    db._store.garageVehicles.set(id, {
        id,
        userId: "user-1",
        nickname: "รถของฉัน",
        brand: "Toyota",
        model: "Camry",
        licensePlate: "1กข 1234",
        color: "ขาว",
        currentMileage: 50000,
        ...extras,
    });
}

function seedServiceRecord(id: string, vehicleId: string) {
    db._store.serviceRecords.set(id, {
        id,
        vehicleId,
        title: "เปลี่ยนน้ำมันเครื่อง",
        serviceDate: new Date(),
    });
}

function seedReminder(id: string, vehicleId: string) {
    db._store.maintenanceReminders.set(id, {
        id,
        vehicleId,
        title: "ต่อภาษีรถ",
        dueDate: new Date(),
    });
}

// ─── Auth guard ─────────────────────────────────────────────────────

describe("admin/garage — auth guard", () => {
    test("PUT without Bearer returns 401", async () => {
        const res = await app.handle(new Request("http://localhost/admin/garage/v1", {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ nickname: "X" }),
        }));
        expect(res.status).toBe(401);
    });

    test("DELETE with malformed Bearer token returns 401", async () => {
        const res = await app.handle(new Request("http://localhost/admin/garage/v1", {
            method: "DELETE",
            headers: { authorization: "Bearer not-a-real-token" },
        }));
        expect(res.status).toBe(401);
    });

    test("DELETE service-record without auth returns 401", async () => {
        const res = await app.handle(new Request("http://localhost/admin/garage/service-records/sr1", {
            method: "DELETE",
        }));
        expect(res.status).toBe(401);
    });

    test("DELETE reminder without auth returns 401", async () => {
        const res = await app.handle(new Request("http://localhost/admin/garage/reminders/r1", {
            method: "DELETE",
        }));
        expect(res.status).toBe(401);
    });
});

// ─── PUT /admin/garage/:id ──────────────────────────────────────────

describe("PUT /admin/garage/:id", () => {
    test("updates accepted fields and writes audit log", async () => {
        seedVehicle("v-put-1", { nickname: "เก่า" });

        const res = await app.handle(new Request("http://localhost/admin/garage/v-put-1", {
            method: "PUT",
            headers: { "content-type": "application/json", ...authHeaders(token) },
            body: JSON.stringify({ nickname: "ใหม่", currentMileage: 60000 }),
        }));

        expect(res.status).toBe(200);
        const body = await readJson(res);
        expect(body).not.toBeNull();
        expect(body!.message).toBe("อัปเดตรถในโรงรถสำเร็จ");
        expect((body!.vehicle as { nickname: string }).nickname).toBe("ใหม่");

        const audit = db._store.auditLogs.find((l) => l.action === "GARAGE_VEHICLE_UPDATE" && l.targetId === "v-put-1");
        expect(audit).toBeDefined();
        expect(audit!.adminId).toBe("admin-garage-test");
        expect(audit!.targetType).toBe("GARAGE_VEHICLE");
    });

    test("returns 404 when vehicle does not exist", async () => {
        const res = await app.handle(new Request("http://localhost/admin/garage/does-not-exist", {
            method: "PUT",
            headers: { "content-type": "application/json", ...authHeaders(token) },
            body: JSON.stringify({ nickname: "X" }),
        }));
        expect(res.status).toBe(404);
        const body = await readJson(res);
        expect(body!.message).toBe("ไม่พบรถในโรงรถ");
    });
});

// ─── DELETE /admin/garage/:id ───────────────────────────────────────

describe("DELETE /admin/garage/:id", () => {
    test("deletes vehicle + cascades serviceRecords and reminders + audit log", async () => {
        seedVehicle("v-del-1");
        seedServiceRecord("sr-cascade-1", "v-del-1");
        seedServiceRecord("sr-cascade-2", "v-del-1");
        seedReminder("rm-cascade-1", "v-del-1");

        const res = await app.handle(new Request("http://localhost/admin/garage/v-del-1", {
            method: "DELETE",
            headers: authHeaders(token),
        }));

        expect(res.status).toBe(200);
        const body = await readJson(res);
        expect(body!.message).toBe("ลบรถในโรงรถเรียบร้อย");
        expect(db._store.garageVehicles.has("v-del-1")).toBe(false);
        expect(db._store.serviceRecords.has("sr-cascade-1")).toBe(false);
        expect(db._store.serviceRecords.has("sr-cascade-2")).toBe(false);
        expect(db._store.maintenanceReminders.has("rm-cascade-1")).toBe(false);

        const audit = db._store.auditLogs.find((l) => l.action === "GARAGE_VEHICLE_DELETE" && l.targetId === "v-del-1");
        expect(audit).toBeDefined();
        expect((audit!.metadata as { ownerId: string }).ownerId).toBe("user-1");
    });

    test("returns 404 for missing vehicle", async () => {
        const res = await app.handle(new Request("http://localhost/admin/garage/missing", {
            method: "DELETE",
            headers: authHeaders(token),
        }));
        expect(res.status).toBe(404);
    });
});

// ─── DELETE /admin/garage/service-records/:id ───────────────────────

describe("DELETE /admin/garage/service-records/:id", () => {
    test("removes service record and writes audit log", async () => {
        seedVehicle("v-sr-parent");
        seedServiceRecord("sr-lone-1", "v-sr-parent");

        const res = await app.handle(new Request("http://localhost/admin/garage/service-records/sr-lone-1", {
            method: "DELETE",
            headers: authHeaders(token),
        }));

        expect(res.status).toBe(200);
        expect(db._store.serviceRecords.has("sr-lone-1")).toBe(false);

        const audit = db._store.auditLogs.find((l) => l.action === "SERVICE_RECORD_DELETE" && l.targetId === "sr-lone-1");
        expect(audit).toBeDefined();
    });

    test("returns 404 when service record missing", async () => {
        const res = await app.handle(new Request("http://localhost/admin/garage/service-records/missing-sr", {
            method: "DELETE",
            headers: authHeaders(token),
        }));
        expect(res.status).toBe(404);
        const body = await readJson(res);
        expect(body!.message).toBe("ไม่พบประวัติการซ่อมบำรุง");
    });
});

// ─── DELETE /admin/garage/reminders/:id ─────────────────────────────

describe("DELETE /admin/garage/reminders/:id", () => {
    test("removes reminder and writes audit log", async () => {
        seedVehicle("v-rm-parent");
        seedReminder("rm-lone-1", "v-rm-parent");

        const res = await app.handle(new Request("http://localhost/admin/garage/reminders/rm-lone-1", {
            method: "DELETE",
            headers: authHeaders(token),
        }));

        expect(res.status).toBe(200);
        expect(db._store.maintenanceReminders.has("rm-lone-1")).toBe(false);

        const audit = db._store.auditLogs.find((l) => l.action === "MAINTENANCE_REMINDER_DELETE" && l.targetId === "rm-lone-1");
        expect(audit).toBeDefined();
    });

    test("returns 404 when reminder missing", async () => {
        const res = await app.handle(new Request("http://localhost/admin/garage/reminders/missing-rm", {
            method: "DELETE",
            headers: authHeaders(token),
        }));
        expect(res.status).toBe(404);
        const body = await readJson(res);
        expect(body!.message).toBe("ไม่พบรายการเตือน");
    });
});
