/**
 * Shared test helpers for admin CRUD integration-lite tests.
 *
 * Strategy: mock `./db` BEFORE importing route modules, expose an in-memory
 * stub that records mutation calls so we can assert audit-log side effects
 * and response shapes via Elysia's `.handle(request)` pattern. No real DB.
 */

import { mock } from "bun:test";
import jsonwebtoken from "jsonwebtoken";

export type AuditLogEntry = {
    adminId: string;
    action: string;
    targetType: string;
    targetId: string;
    note?: string | null;
    metadata?: unknown;
    ipAddress?: string | null;
};

export type PrismaStub = {
    // admin.ts user lookup is bypassed for these groups (only listings+users+sellerprofile+services+garage groups
    // use a simple jwt-only derive). But admin.ts's own routes DO call prisma.admin.findUnique — our groups don't.
    _store: {
        listings: Map<string, Record<string, unknown>>;
        users: Map<string, Record<string, unknown>>;
        sellerProfiles: Map<string, Record<string, unknown>>;
        bookings: Map<string, Record<string, unknown>>;
        inquiries: Map<string, Record<string, unknown>>;
        garageVehicles: Map<string, Record<string, unknown>>;
        serviceRecords: Map<string, Record<string, unknown>>;
        maintenanceReminders: Map<string, Record<string, unknown>>;
        auditLogs: AuditLogEntry[];
    };
    adminAuditLog: {
        create: (args: { data: AuditLogEntry }) => Promise<AuditLogEntry>;
    };
    vehicleListing: {
        findUnique: (args: { where: { id: string } }) => Promise<Record<string, unknown> | null>;
        update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<Record<string, unknown>>;
        delete: (args: { where: { id: string } }) => Promise<Record<string, unknown>>;
        count: (args?: { where?: Record<string, unknown> }) => Promise<number>;
    };
    user: {
        findUnique: (args: { where: { id: string } }) => Promise<Record<string, unknown> | null>;
        findFirst: (args: { where: Record<string, unknown> }) => Promise<Record<string, unknown> | null>;
        update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<Record<string, unknown>>;
    };
    sellerProfile: {
        findUnique: (args: { where: { id: string } }) => Promise<Record<string, unknown> | null>;
        findMany: (args: Record<string, unknown>) => Promise<Record<string, unknown>[]>;
        count: (args?: { where?: Record<string, unknown> }) => Promise<number>;
        update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<Record<string, unknown>>;
    };
    inspectionBooking: {
        findUnique: (args: { where: { id: string }; include?: unknown }) => Promise<Record<string, unknown> | null>;
        delete: (args: { where: { id: string } }) => Promise<Record<string, unknown>>;
    };
    serviceInquiry: {
        findUnique: (args: { where: { id: string }; include?: unknown }) => Promise<Record<string, unknown> | null>;
        delete: (args: { where: { id: string } }) => Promise<Record<string, unknown>>;
    };
    garageVehicle: {
        findUnique: (args: { where: { id: string }; include?: unknown }) => Promise<Record<string, unknown> | null>;
        update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<Record<string, unknown>>;
        delete: (args: { where: { id: string } }) => Promise<Record<string, unknown>>;
    };
    serviceRecord: {
        findUnique: (args: { where: { id: string } }) => Promise<Record<string, unknown> | null>;
        delete: (args: { where: { id: string } }) => Promise<Record<string, unknown>>;
    };
    maintenanceReminder: {
        findUnique: (args: { where: { id: string } }) => Promise<Record<string, unknown> | null>;
        delete: (args: { where: { id: string } }) => Promise<Record<string, unknown>>;
    };
    $transaction: <T>(fn: (tx: PrismaStub) => Promise<T>) => Promise<T>;
};

export function buildPrismaStub(): PrismaStub {
    const store = {
        listings: new Map<string, Record<string, unknown>>(),
        users: new Map<string, Record<string, unknown>>(),
        sellerProfiles: new Map<string, Record<string, unknown>>(),
        bookings: new Map<string, Record<string, unknown>>(),
        inquiries: new Map<string, Record<string, unknown>>(),
        garageVehicles: new Map<string, Record<string, unknown>>(),
        serviceRecords: new Map<string, Record<string, unknown>>(),
        maintenanceReminders: new Map<string, Record<string, unknown>>(),
        auditLogs: [] as AuditLogEntry[],
    };

    const stub: PrismaStub = {
        _store: store,
        adminAuditLog: {
            create: async ({ data }) => {
                store.auditLogs.push({ ...data });
                return { ...data };
            },
        },
        vehicleListing: {
            findUnique: async ({ where }) => store.listings.get(where.id) ?? null,
            update: async ({ where, data }) => {
                const row = store.listings.get(where.id);
                if (!row) throw new Error("not found");
                const next = { ...row, ...data };
                store.listings.set(where.id, next);
                return next;
            },
            delete: async ({ where }) => {
                const row = store.listings.get(where.id);
                if (!row) throw new Error("not found");
                store.listings.delete(where.id);
                return row;
            },
            count: async ({ where } = {}) => {
                const w = where ?? {};
                let n = 0;
                for (const row of store.listings.values()) {
                    if ("userId" in w && (row as { userId?: string }).userId !== w.userId) continue;
                    if ("status" in w && (row as { status?: string }).status !== w.status) continue;
                    n++;
                }
                return n;
            },
        },
        user: {
            findUnique: async ({ where }) => store.users.get(where.id) ?? null,
            findFirst: async ({ where }) => {
                const email = (where as { email?: string }).email;
                const notId = (where as { NOT?: { id?: string } }).NOT?.id;
                for (const row of store.users.values()) {
                    const r = row as { id: string; email: string };
                    if (email && r.email === email && r.id !== notId) return row;
                }
                return null;
            },
            update: async ({ where, data }) => {
                const row = store.users.get(where.id);
                if (!row) throw new Error("not found");
                const next = { ...row, ...data, updatedAt: new Date() };
                store.users.set(where.id, next);
                return next;
            },
        },
        sellerProfile: {
            findUnique: async ({ where }) => store.sellerProfiles.get(where.id) ?? null,
            findMany: async (args) => {
                const a = args as { where?: Record<string, unknown>; skip?: number; take?: number };
                const all = [...store.sellerProfiles.values()];
                const w = a.where ?? {};
                const filtered = all.filter((row) => {
                    const r = row as { verificationLevel?: string; showroomType?: string; isVerified?: boolean; shopName?: string };
                    if (w.verificationLevel && r.verificationLevel !== w.verificationLevel) return false;
                    if (w.showroomType && r.showroomType !== w.showroomType) return false;
                    if (typeof w.isVerified === "boolean" && r.isVerified !== w.isVerified) return false;
                    if (Array.isArray((w as { OR?: unknown[] }).OR)) {
                        const needles = (w as { OR: Array<{ shopName?: { contains?: string } }> }).OR
                            .map((o) => o.shopName?.contains).filter(Boolean) as string[];
                        if (needles.length > 0 && !needles.some((n) => (r.shopName || "").includes(n))) return false;
                    }
                    return true;
                });
                const skip = a.skip ?? 0;
                const take = a.take ?? filtered.length;
                return filtered.slice(skip, skip + take);
            },
            count: async ({ where } = {}) => {
                const all = [...store.sellerProfiles.values()];
                const w = where ?? {};
                return all.filter((row) => {
                    const r = row as { verificationLevel?: string; showroomType?: string; isVerified?: boolean };
                    if (w.verificationLevel && r.verificationLevel !== w.verificationLevel) return false;
                    if (w.showroomType && r.showroomType !== w.showroomType) return false;
                    if (typeof w.isVerified === "boolean" && r.isVerified !== w.isVerified) return false;
                    return true;
                }).length;
            },
            update: async ({ where, data }) => {
                const row = store.sellerProfiles.get(where.id);
                if (!row) throw new Error("not found");
                const next = { ...row, ...data };
                store.sellerProfiles.set(where.id, next);
                return next;
            },
        },
        inspectionBooking: {
            findUnique: async ({ where }) => store.bookings.get(where.id) ?? null,
            delete: async ({ where }) => {
                const row = store.bookings.get(where.id);
                if (!row) throw new Error("not found");
                store.bookings.delete(where.id);
                return row;
            },
        },
        serviceInquiry: {
            findUnique: async ({ where }) => store.inquiries.get(where.id) ?? null,
            delete: async ({ where }) => {
                const row = store.inquiries.get(where.id);
                if (!row) throw new Error("not found");
                store.inquiries.delete(where.id);
                return row;
            },
        },
        garageVehicle: {
            findUnique: async ({ where }) => store.garageVehicles.get(where.id) ?? null,
            update: async ({ where, data }) => {
                const row = store.garageVehicles.get(where.id);
                if (!row) throw new Error("not found");
                const next = { ...row, ...data };
                store.garageVehicles.set(where.id, next);
                return next;
            },
            delete: async ({ where }) => {
                const row = store.garageVehicles.get(where.id);
                if (!row) throw new Error("not found");
                store.garageVehicles.delete(where.id);
                // cascade: remove dependent serviceRecords + reminders for realism
                for (const [srId, sr] of store.serviceRecords.entries()) {
                    if ((sr as { vehicleId?: string }).vehicleId === where.id) store.serviceRecords.delete(srId);
                }
                for (const [rmId, rm] of store.maintenanceReminders.entries()) {
                    if ((rm as { vehicleId?: string }).vehicleId === where.id) store.maintenanceReminders.delete(rmId);
                }
                return row;
            },
        },
        serviceRecord: {
            findUnique: async ({ where }) => store.serviceRecords.get(where.id) ?? null,
            delete: async ({ where }) => {
                const row = store.serviceRecords.get(where.id);
                if (!row) throw new Error("not found");
                store.serviceRecords.delete(where.id);
                return row;
            },
        },
        maintenanceReminder: {
            findUnique: async ({ where }) => store.maintenanceReminders.get(where.id) ?? null,
            delete: async ({ where }) => {
                const row = store.maintenanceReminders.get(where.id);
                if (!row) throw new Error("not found");
                store.maintenanceReminders.delete(where.id);
                return row;
            },
        },
        $transaction: async (fn) => fn(stub),
    };

    return stub;
}

/** Register the mock BEFORE importing any route module. */
export function installPrismaMock(stub: PrismaStub): void {
    mock.module("../db", () => ({ default: stub }));
}

/** Sign a JWT with the same secret used by production code. */
export function makeAdminToken(adminId = "admin-test-123"): string {
    const secret = process.env.JWT_SECRET || "test-secret";
    return jsonwebtoken.sign({ userId: adminId, email: "admin@test.local" }, secret);
}

export function authHeaders(token?: string): Record<string, string> {
    if (!token) return {};
    return { authorization: `Bearer ${token}` };
}

/** Safe JSON parse — returns null on non-JSON bodies (e.g. elysia validation errors). */
export async function readJson(res: Response): Promise<Record<string, unknown> | null> {
    const text = await res.text();
    if (!text) return null;
    try { return JSON.parse(text) as Record<string, unknown>; } catch { return null; }
}
