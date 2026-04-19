/**
 * Admin P1 features — audit log, garage viewer, revenue CSV export,
 * bulk listing actions.
 *
 * Also exports `logAdminAction()` for other admin routes to use.
 */

import { Elysia, t } from "elysia";
import prisma from "./db";
import { jwtPlugin } from "./jwt";

const adminAuth = (app: Elysia) =>
    app.use(jwtPlugin()).derive(async ({ jwt, headers, set, request }) => {
        const authHeader = headers["authorization"];
        if (!authHeader?.startsWith("Bearer ")) {
            set.status = 401;
            return { authError: "Unauthorized" as const, adminId: null as string | null, adminIp: null as string | null };
        }
        const token = authHeader.slice(7).trim();
        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = 401;
            return { authError: "Invalid Token" as const, adminId: null as string | null, adminIp: null as string | null };
        }
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
            || request.headers.get("x-real-ip")
            || null;
        return { authError: null as string | null, adminId: (payload as { userId: string }).userId, adminIp: ip };
    });

/** Compute before/after diff for changed fields. Used by UPDATE audit logs. */
export function diffFields(
    before: Record<string, unknown>,
    after: Record<string, unknown>
): Record<string, { before: unknown; after: unknown }> {
    const changes: Record<string, { before: unknown; after: unknown }> = {};
    for (const key of Object.keys(after)) {
        const b = before[key];
        const a = after[key];
        const same = b === a || (b instanceof Date && a instanceof Date && b.getTime() === a.getTime());
        if (!same) changes[key] = { before: b, after: a };
    }
    return changes;
}

/** Fire-and-forget audit logger. Never throws — logging failure shouldn't break the admin action. */
export async function logAdminAction(params: {
    adminId: string;
    action: string;
    targetType: string;
    targetId: string;
    note?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string | null;
}): Promise<void> {
    try {
        await prisma.adminAuditLog.create({
            data: {
                adminId: params.adminId,
                action: params.action,
                targetType: params.targetType,
                targetId: params.targetId,
                note: params.note,
                metadata: params.metadata as never,
                ipAddress: params.ipAddress,
            },
        });
    } catch (err) {
        console.warn("[audit] log failed:", err instanceof Error ? err.message : err);
    }
}

/* ─── Audit log viewer ──────────────────────────────────────── */

export const adminAuditRoutes = new Elysia({ prefix: "/admin/audit" })
    .use(adminAuth)
    .get("/", async ({ authError, query, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        const page = parseInt(String(query.page || "1"));
        const limit = Math.min(parseInt(String(query.limit || "50")), 200);
        const action = String(query.action || "");
        const targetType = String(query.targetType || "");
        const adminId = String(query.adminId || "");

        const where = {
            ...(action ? { action } : {}),
            ...(targetType ? { targetType } : {}),
            ...(adminId ? { adminId } : {}),
        };

        const [logs, total] = await Promise.all([
            prisma.adminAuditLog.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.adminAuditLog.count({ where }),
        ]);

        // Hydrate with admin names for the viewer
        const adminIds = [...new Set(logs.map((l) => l.adminId))];
        const admins = await prisma.admin.findMany({
            where: { id: { in: adminIds } },
            select: { id: true, fullName: true, username: true },
        });
        const adminMap = Object.fromEntries(admins.map((a) => [a.id, a]));

        return {
            logs: logs.map((l) => ({ ...l, admin: adminMap[l.adminId] || null })),
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    });

/* ─── Garage viewer (read-only) ─────────────────────────────── */

export const adminGarageRoutes = new Elysia({ prefix: "/admin/garage" })
    .use(adminAuth)
    .get("/", async ({ authError, query, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        const page = parseInt(String(query.page || "1"));
        const limit = Math.min(parseInt(String(query.limit || "25")), 100);
        const search = String(query.search || "").trim();

        const where = search
            ? {
                OR: [
                    { nickname: { contains: search, mode: "insensitive" as const } },
                    { brand: { contains: search, mode: "insensitive" as const } },
                    { model: { contains: search, mode: "insensitive" as const } },
                    { licensePlate: { contains: search, mode: "insensitive" as const } },
                    { user: { fullName: { contains: search, mode: "insensitive" as const } } },
                ],
            }
            : {};

        const [vehicles, total, totalUsers] = await Promise.all([
            prisma.garageVehicle.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    user: { select: { id: true, fullName: true, email: true } },
                    _count: { select: { serviceRecords: true, reminders: true } },
                },
            }),
            prisma.garageVehicle.count({ where }),
            prisma.garageVehicle.groupBy({ by: ["userId"], _count: true }).then((r) => r.length),
        ]);

        return {
            vehicles,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
            stats: { totalVehicles: total, totalUsers },
        };
    })

    .get("/:id", async ({ authError, params, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        const vehicle = await prisma.garageVehicle.findUnique({
            where: { id: params.id },
            include: {
                user: { select: { id: true, fullName: true, email: true, phoneNumber: true } },
                serviceRecords: { orderBy: { serviceDate: "desc" }, take: 20 },
                reminders: { orderBy: { dueDate: "asc" } },
            },
        });
        if (!vehicle) { set.status = 404; return { error: "NOT_FOUND" }; }
        return { vehicle };
    })

    // Update garage vehicle (admin-editable fields — userId cannot change)
    .put("/:id", async ({ authError, adminId, adminIp, params, body, set }) => {
        if (authError || !adminId) { set.status = 401; return { error: authError || "Unauthorized" }; }
        try {
            const existing = await prisma.garageVehicle.findUnique({ where: { id: params.id } });
            if (!existing) {
                set.status = 404;
                return { error: 'Not Found', message: 'ไม่พบรถในโรงรถ' };
            }

            const b = body as {
                nickname?: string;
                licensePlate?: string;
                color?: string;
                currentMileage?: number;
                imageUrl?: string;
            };

            const data: Record<string, unknown> = {};
            if (b.nickname !== undefined) data.nickname = b.nickname;
            if (b.licensePlate !== undefined) data.licensePlate = b.licensePlate;
            if (b.color !== undefined) data.color = b.color;
            if (b.currentMileage !== undefined) data.currentMileage = b.currentMileage;
            if (b.imageUrl !== undefined) data.imageUrl = b.imageUrl;

            const updated = await prisma.garageVehicle.update({
                where: { id: params.id },
                data,
            });

            await logAdminAction({
                adminId,
                action: 'GARAGE_VEHICLE_UPDATE',
                targetType: 'GARAGE_VEHICLE',
                targetId: params.id,
                note: `แก้ไขรถในโรงรถ "${existing.nickname}"`,
                metadata: { changes: diffFields(existing as unknown as Record<string, unknown>, data) },
                ipAddress: adminIp,
            });

            return { message: 'อัปเดตรถในโรงรถสำเร็จ', vehicle: updated };
        } catch (error) {
            console.error('Update garage vehicle error:', error);
            set.status = 500;
            return { error: 'Server Error', message: 'ไม่สามารถอัปเดตรถในโรงรถได้' };
        }
    }, {
        body: t.Object({
            nickname: t.Optional(t.String()),
            licensePlate: t.Optional(t.String()),
            color: t.Optional(t.String()),
            currentMileage: t.Optional(t.Number()),
            imageUrl: t.Optional(t.String()),
        })
    })

    // Delete garage vehicle (cascades serviceRecords + reminders per schema)
    .delete("/:id", async ({ authError, adminId, adminIp, params, set }) => {
        if (authError || !adminId) { set.status = 401; return { error: authError || "Unauthorized" }; }
        try {
            const existing = await prisma.garageVehicle.findUnique({
                where: { id: params.id },
                select: { id: true, nickname: true, userId: true }
            });
            if (!existing) {
                set.status = 404;
                return { error: 'Not Found', message: 'ไม่พบรถในโรงรถ' };
            }

            await prisma.garageVehicle.delete({ where: { id: params.id } });

            await logAdminAction({
                adminId,
                action: 'GARAGE_VEHICLE_DELETE',
                targetType: 'GARAGE_VEHICLE',
                targetId: params.id,
                note: `ลบรถในโรงรถ "${existing.nickname}"`,
                metadata: { ownerId: existing.userId, nickname: existing.nickname },
                ipAddress: adminIp,
            });

            return { message: 'ลบรถในโรงรถเรียบร้อย' };
        } catch (error) {
            console.error('Delete garage vehicle error:', error);
            set.status = 500;
            return { error: 'Server Error', message: 'ไม่สามารถลบรถในโรงรถได้' };
        }
    })

    // Delete service record
    .delete("/service-records/:id", async ({ authError, adminId, adminIp, params, set }) => {
        if (authError || !adminId) { set.status = 401; return { error: authError || "Unauthorized" }; }
        try {
            const existing = await prisma.serviceRecord.findUnique({
                where: { id: params.id },
                select: { id: true, title: true, vehicleId: true }
            });
            if (!existing) {
                set.status = 404;
                return { error: 'Not Found', message: 'ไม่พบประวัติการซ่อมบำรุง' };
            }

            await prisma.serviceRecord.delete({ where: { id: params.id } });

            await logAdminAction({
                adminId,
                action: 'SERVICE_RECORD_DELETE',
                targetType: 'SERVICE_RECORD',
                targetId: params.id,
                note: `ลบประวัติการซ่อมบำรุง "${existing.title}"`,
                metadata: { vehicleId: existing.vehicleId },
                ipAddress: adminIp,
            });

            return { message: 'ลบประวัติการซ่อมบำรุงเรียบร้อย' };
        } catch (error) {
            console.error('Delete service record error:', error);
            set.status = 500;
            return { error: 'Server Error', message: 'ไม่สามารถลบประวัติการซ่อมบำรุงได้' };
        }
    })

    // Delete maintenance reminder
    .delete("/reminders/:id", async ({ authError, adminId, adminIp, params, set }) => {
        if (authError || !adminId) { set.status = 401; return { error: authError || "Unauthorized" }; }
        try {
            const existing = await prisma.maintenanceReminder.findUnique({
                where: { id: params.id },
                select: { id: true, title: true, vehicleId: true }
            });
            if (!existing) {
                set.status = 404;
                return { error: 'Not Found', message: 'ไม่พบรายการเตือน' };
            }

            await prisma.maintenanceReminder.delete({ where: { id: params.id } });

            await logAdminAction({
                adminId,
                action: 'MAINTENANCE_REMINDER_DELETE',
                targetType: 'MAINTENANCE_REMINDER',
                targetId: params.id,
                note: `ลบรายการเตือน "${existing.title}"`,
                metadata: { vehicleId: existing.vehicleId },
                ipAddress: adminIp,
            });

            return { message: 'ลบรายการเตือนเรียบร้อย' };
        } catch (error) {
            console.error('Delete reminder error:', error);
            set.status = 500;
            return { error: 'Server Error', message: 'ไม่สามารถลบรายการเตือนได้' };
        }
    });

/* ─── Revenue / Transaction CSV export ──────────────────────── */

export const adminRevenueRoutes = new Elysia({ prefix: "/admin/revenue" })
    .use(adminAuth)
    // Summary for dashboard — monthly revenue, tx counts, top packages
    .get("/summary", async ({ authError, query, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        const monthsBack = Math.min(parseInt(String(query.months || "12")), 24);
        const since = new Date();
        since.setMonth(since.getMonth() - monthsBack);

        const txs = await prisma.packageTransaction.findMany({
            where: {
                status: "APPROVED",
                approvedAt: { gte: since },
            },
            include: { package: { select: { name: true, slug: true } } },
        });

        // Group by year-month
        const byMonth: Record<string, { revenue: number; count: number }> = {};
        const byPackage: Record<string, { name: string; revenue: number; count: number }> = {};
        let totalRevenue = 0;
        for (const t of txs) {
            const amount = Number(t.amount || 0);
            totalRevenue += amount;
            const d = new Date(t.approvedAt || t.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            if (!byMonth[key]) byMonth[key] = { revenue: 0, count: 0 };
            byMonth[key].revenue += amount;
            byMonth[key].count += 1;

            const pk = t.package?.slug || "unknown";
            if (!byPackage[pk]) byPackage[pk] = { name: t.package?.name || pk, revenue: 0, count: 0 };
            byPackage[pk].revenue += amount;
            byPackage[pk].count += 1;
        }

        return {
            totalRevenue,
            totalTransactions: txs.length,
            byMonth: Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([month, v]) => ({ month, ...v })),
            byPackage: Object.values(byPackage).sort((a, b) => b.revenue - a.revenue),
        };
    })

    // CSV export — transactions within a date range
    .get("/export", async ({ authError, query, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }

        const from = query.from ? new Date(String(query.from)) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const to = query.to ? new Date(String(query.to)) : new Date();
        const statusFilter = String(query.status || "APPROVED").toUpperCase();

        const txs = await prisma.packageTransaction.findMany({
            where: {
                createdAt: { gte: from, lte: to },
                ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
            },
            include: {
                package: { select: { name: true, slug: true } },
                user: { select: { fullName: true, email: true, phoneNumber: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        // Build CSV
        const header = [
            "transaction_id", "created_at", "approved_at", "status",
            "user_name", "user_email", "user_phone",
            "package_slug", "package_name", "amount_thb",
        ];
        const rows = txs.map((t) => [
            t.id,
            t.createdAt.toISOString(),
            t.approvedAt?.toISOString() || "",
            t.status,
            t.user?.fullName || "",
            t.user?.email || "",
            t.user?.phoneNumber || "",
            t.package?.slug || "",
            t.package?.name || "",
            String(t.amount || 0),
        ]);
        const csv = [header, ...rows]
            .map((r) => r.map((cell) => {
                const s = String(cell ?? "");
                return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
            }).join(","))
            .join("\n");

        set.headers["content-type"] = "text/csv; charset=utf-8";
        set.headers["content-disposition"] = `attachment; filename="transactions_${from.toISOString().slice(0, 10)}_${to.toISOString().slice(0, 10)}.csv"`;
        // BOM so Thai text opens correctly in Excel
        return "\uFEFF" + csv;
    });

/* ─── Bulk listing actions ──────────────────────────────────── */

export const adminListingBulkRoutes = new Elysia({ prefix: "/admin/listings/bulk" })
    .use(adminAuth)
    .post("/", async ({ authError, adminId, adminIp, body, set }) => {
        if (authError || !adminId) { set.status = 401; return { error: authError || "Unauthorized" }; }
        const { ids, action, note } = body as {
            ids: string[];
            action: "APPROVE" | "REJECT" | "FEATURE" | "UNFEATURE" | "DEACTIVATE";
            note?: string;
        };
        if (!Array.isArray(ids) || ids.length === 0) {
            set.status = 400; return { error: "EMPTY_IDS" };
        }
        if (ids.length > 100) {
            set.status = 400; return { error: "TOO_MANY", message: "ไม่เกิน 100 รายการต่อครั้ง" };
        }

        let updatedCount = 0;
        const actionMap: Record<string, { status?: string; isFeatured?: boolean }> = {
            APPROVE: { status: "ACTIVE" },
            REJECT: { status: "REJECTED" },
            FEATURE: { isFeatured: true },
            UNFEATURE: { isFeatured: false },
            DEACTIVATE: { status: "INACTIVE" },
        };
        const update = actionMap[action];
        if (!update) { set.status = 400; return { error: "INVALID_ACTION" }; }

        const result = await prisma.vehicleListing.updateMany({
            where: { id: { in: ids } },
            data: update,
        });
        updatedCount = result.count;

        // Audit (one log per bulk action, not per item — less noise)
        await logAdminAction({
            adminId,
            action: `LISTING_BULK_${action}`,
            targetType: "LISTING",
            targetId: ids.join(","),
            note,
            metadata: { count: updatedCount, ids },
            ipAddress: adminIp,
        });

        return { message: `ดำเนินการ ${updatedCount} รายการ`, updated: updatedCount };
    }, {
        body: t.Object({
            ids: t.Array(t.String()),
            action: t.String(),
            note: t.Optional(t.String()),
        }),
    });
