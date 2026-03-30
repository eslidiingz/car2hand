import { Elysia, t } from "elysia";
import prisma from "./db";

export const garageRoutes = new Elysia({ prefix: "/garage" })

    // List user's vehicles
    .get("/", async ({ query }) => {
        const { userId } = query;
        if (!userId) return { vehicles: [] };

        const vehicles = await prisma.garageVehicle.findMany({
            where: { userId: userId as string },
            orderBy: { createdAt: 'desc' },
            include: {
                reminders: { where: { isCompleted: false }, orderBy: { createdAt: 'desc' } },
                _count: { select: { serviceRecords: true } }
            }
        });
        return { vehicles };
    })

    // Get single vehicle with details
    .get("/:id", async ({ params, set }) => {
        const vehicle = await prisma.garageVehicle.findUnique({
            where: { id: params.id },
            include: {
                serviceRecords: { orderBy: { serviceDate: 'desc' }, take: 10 },
                reminders: { orderBy: { createdAt: 'desc' } }
            }
        });
        if (!vehicle) { set.status = 404; return { message: "ไม่พบรถ" }; }
        return { vehicle };
    })

    // Add vehicle
    .post("/", async ({ body }) => {
        const vehicle = await prisma.garageVehicle.create({ data: body as any });
        return { message: "เพิ่มรถสำเร็จ", vehicle };
    }, {
        body: t.Object({
            userId: t.String(),
            nickname: t.String(),
            brand: t.String(),
            model: t.String(),
            year: t.Optional(t.Number()),
            color: t.Optional(t.String()),
            licensePlate: t.Optional(t.String()),
            currentMileage: t.Optional(t.Number()),
            imageUrl: t.Optional(t.String()),
        })
    })

    // Update vehicle
    .put("/:id", async ({ params, body, set }) => {
        try {
            const vehicle = await prisma.garageVehicle.update({
                where: { id: params.id },
                data: body as any,
            });
            return { message: "อัปเดตสำเร็จ", vehicle };
        } catch { set.status = 404; return { message: "ไม่พบรถ" }; }
    }, {
        body: t.Object({
            nickname: t.Optional(t.String()),
            brand: t.Optional(t.String()),
            model: t.Optional(t.String()),
            year: t.Optional(t.Number()),
            color: t.Optional(t.String()),
            licensePlate: t.Optional(t.String()),
            currentMileage: t.Optional(t.Number()),
            imageUrl: t.Optional(t.String()),
        })
    })

    // Delete vehicle
    .delete("/:id", async ({ params, set }) => {
        try {
            await prisma.garageVehicle.delete({ where: { id: params.id } });
            return { message: "ลบรถสำเร็จ" };
        } catch { set.status = 404; return { message: "ไม่พบรถ" }; }
    })

    // Update mileage
    .put("/:id/mileage", async ({ params, body, set }) => {
        try {
            const vehicle = await prisma.garageVehicle.update({
                where: { id: params.id },
                data: { currentMileage: (body as any).mileage }
            });
            return { message: "อัปเดตเลขไมล์สำเร็จ", vehicle };
        } catch { set.status = 404; return { message: "ไม่พบรถ" }; }
    }, { body: t.Object({ mileage: t.Number() }) })

    // === Service Records ===
    .get("/:id/services", async ({ params }) => {
        const records = await prisma.serviceRecord.findMany({
            where: { vehicleId: params.id },
            orderBy: { serviceDate: 'desc' }
        });
        return { records };
    })

    .post("/:id/services", async ({ params, body, set }) => {
        try {
            const { serviceDate, cost, ...rest } = body as any;
            const record = await prisma.serviceRecord.create({
                data: {
                    ...rest,
                    serviceDate: new Date(serviceDate),
                    ...(cost != null ? { cost } : {}),
                    vehicleId: params.id,
                }
            });
            return { message: "บันทึกซ่อมสำเร็จ", record };
        } catch (e: any) {
            set.status = 400;
            return { message: "บันทึกไม่สำเร็จ", error: e?.message };
        }
    }, {
        body: t.Object({
            title: t.String(),
            description: t.Optional(t.String()),
            mileage: t.Optional(t.Number()),
            cost: t.Optional(t.Number()),
            serviceDate: t.String(),
            shopName: t.Optional(t.String()),
        })
    })

    .delete("/services/:id", async ({ params, set }) => {
        try {
            await prisma.serviceRecord.delete({ where: { id: params.id } });
            return { message: "ลบสำเร็จ" };
        } catch { set.status = 404; return { message: "ไม่พบรายการ" }; }
    })

    // === Maintenance Reminders ===
    .get("/:id/reminders", async ({ params }) => {
        const reminders = await prisma.maintenanceReminder.findMany({
            where: { vehicleId: params.id },
            orderBy: { createdAt: 'desc' }
        });
        return { reminders };
    })

    .post("/:id/reminders", async ({ params, body }) => {
        const { dueDate, ...rest } = body as any;
        const reminder = await prisma.maintenanceReminder.create({
            data: {
                ...rest,
                ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
                vehicleId: params.id,
            }
        });
        return { message: "เพิ่มแจ้งเตือนสำเร็จ", reminder };
    }, {
        body: t.Object({
            title: t.String(),
            type: t.String(),
            dueDate: t.Optional(t.String()),
            dueMileage: t.Optional(t.Number()),
        })
    })

    .put("/reminders/:id", async ({ params, body, set }) => {
        try {
            const { dueDate, ...rest } = body as any;
            const reminder = await prisma.maintenanceReminder.update({
                where: { id: params.id },
                data: {
                    ...rest,
                    ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
                },
            });
            return { message: "อัปเดตสำเร็จ", reminder };
        } catch { set.status = 404; return { message: "ไม่พบรายการ" }; }
    }, {
        body: t.Object({
            title: t.Optional(t.String()),
            type: t.Optional(t.String()),
            dueDate: t.Optional(t.String()),
            dueMileage: t.Optional(t.Number()),
            isCompleted: t.Optional(t.Boolean()),
        })
    })

    .delete("/reminders/:id", async ({ params, set }) => {
        try {
            await prisma.maintenanceReminder.delete({ where: { id: params.id } });
            return { message: "ลบสำเร็จ" };
        } catch { set.status = 404; return { message: "ไม่พบรายการ" }; }
    });
