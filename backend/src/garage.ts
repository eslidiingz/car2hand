import { Elysia, t } from "elysia";
import prisma from "./db";
import { authGuard } from "./jwt";
import { uploadGarageVehicleImage, deleteByPrefix, isValidImageType, isValidFileSize } from "./storage";

export const garageRoutes = new Elysia({ prefix: "/garage" })
    .use(authGuard)

    // List user's vehicles
    .get("/", async ({ auth, set }) => {
        if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;

        const vehicles = await prisma.garageVehicle.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                reminders: { where: { isCompleted: false }, orderBy: { createdAt: 'desc' } },
                _count: { select: { serviceRecords: true } }
            }
        });
        return { vehicles };
    })

    // Get single vehicle with details
    .get("/:id", async ({ params, auth, set }) => {

        const vehicle = await prisma.garageVehicle.findUnique({
            where: { id: params.id },
            include: {
                serviceRecords: { orderBy: { serviceDate: 'desc' }, take: 10 },
                reminders: { orderBy: { createdAt: 'desc' } }
            }
        });
        if (!vehicle) { set.status = 404; return { message: "ไม่พบรถ" }; }
        if (vehicle.userId !== auth.userId) {
            set.status = 403;
            return { message: "ไม่มีสิทธิ์เข้าถึง" };
        }
        return { vehicle };
    })

    // Add vehicle
    .post("/", async ({ body, auth, set }) => {
        if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;

        const vehicle = await prisma.garageVehicle.create({ data: { ...body, userId } as any });
        return { message: "เพิ่มรถสำเร็จ", vehicle };
    }, {
        body: t.Object({
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
    .put("/:id", async ({ params, body, auth, set }) => {

        const vehicle = await prisma.garageVehicle.findUnique({ where: { id: params.id } });
        if (!vehicle || vehicle.userId !== auth.userId) {
            set.status = 403;
            return { message: "ไม่มีสิทธิ์เข้าถึง" };
        }

        try {
            const updated = await prisma.garageVehicle.update({
                where: { id: params.id },
                data: body as any,
            });
            return { message: "อัปเดตสำเร็จ", vehicle: updated };
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
    .delete("/:id", async ({ params, auth, set }) => {

        const vehicle = await prisma.garageVehicle.findUnique({ where: { id: params.id } });
        if (!vehicle || vehicle.userId !== auth.userId) {
            set.status = 403;
            return { message: "ไม่มีสิทธิ์เข้าถึง" };
        }

        try {
            await prisma.garageVehicle.delete({ where: { id: params.id } });
            // clean up image files (best-effort)
            try { await deleteByPrefix(`${auth.userId}/garage/${params.id}/`); } catch { }
            return { message: "ลบรถสำเร็จ" };
        } catch { set.status = 404; return { message: "ไม่พบรถ" }; }
    })

    // Upload vehicle image (multipart/form-data, field "file")
    .post("/:id/image", async ({ params, auth, body, set }) => {
        if (!auth || !auth.userId) { set.status = 401; return { message: "กรุณาเข้าสู่ระบบ" }; }

        const vehicle = await prisma.garageVehicle.findUnique({ where: { id: params.id } });
        if (!vehicle || vehicle.userId !== auth.userId) {
            set.status = 403; return { message: "ไม่มีสิทธิ์เข้าถึง" };
        }

        const file = (body as { file?: File })?.file;
        if (!file || !(file instanceof File)) {
            set.status = 400; return { message: "กรุณาเลือกไฟล์รูปภาพ" };
        }
        if (!isValidImageType(file.type)) {
            set.status = 400; return { message: "รองรับเฉพาะไฟล์ JPG, PNG, WebP, GIF" };
        }
        if (!isValidFileSize(file.size, 10)) {
            set.status = 400; return { message: "ขนาดไฟล์ต้องไม่เกิน 10MB" };
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const url = await uploadGarageVehicleImage(auth.userId, params.id, {
                buffer,
                originalname: file.name || "car.jpg",
                mimetype: file.type,
            });
            const updated = await prisma.garageVehicle.update({
                where: { id: params.id },
                data: { imageUrl: url },
                select: { id: true, imageUrl: true },
            });
            return { message: "อัพโหลดรูปสำเร็จ", imageUrl: updated.imageUrl };
        } catch (err) {
            console.error("Garage image upload error:", err);
            set.status = 500;
            return { message: "ไม่สามารถอัพโหลดรูปได้" };
        }
    })

    // Remove vehicle image
    .delete("/:id/image", async ({ params, auth, set }) => {
        if (!auth || !auth.userId) { set.status = 401; return { message: "กรุณาเข้าสู่ระบบ" }; }

        const vehicle = await prisma.garageVehicle.findUnique({ where: { id: params.id } });
        if (!vehicle || vehicle.userId !== auth.userId) {
            set.status = 403; return { message: "ไม่มีสิทธิ์เข้าถึง" };
        }

        try {
            await deleteByPrefix(`${auth.userId}/garage/${params.id}/`);
            await prisma.garageVehicle.update({
                where: { id: params.id },
                data: { imageUrl: null },
            });
            return { message: "ลบรูปสำเร็จ" };
        } catch (err) {
            console.error("Garage image delete error:", err);
            set.status = 500;
            return { message: "ไม่สามารถลบรูปได้" };
        }
    })

    // Update mileage
    .put("/:id/mileage", async ({ params, body, auth, set }) => {

        const vehicle = await prisma.garageVehicle.findUnique({ where: { id: params.id } });
        if (!vehicle || vehicle.userId !== auth.userId) {
            set.status = 403;
            return { message: "ไม่มีสิทธิ์เข้าถึง" };
        }

        try {
            const updated = await prisma.garageVehicle.update({
                where: { id: params.id },
                data: { currentMileage: (body as any).mileage }
            });
            return { message: "อัปเดตเลขไมล์สำเร็จ", vehicle: updated };
        } catch { set.status = 404; return { message: "ไม่พบรถ" }; }
    }, { body: t.Object({ mileage: t.Number() }) })

    // === Service Records ===
    .get("/:id/services", async ({ params, auth, set }) => {

        const vehicle = await prisma.garageVehicle.findUnique({ where: { id: params.id } });
        if (!vehicle || vehicle.userId !== auth.userId) {
            set.status = 403;
            return { message: "ไม่มีสิทธิ์เข้าถึง" };
        }

        const records = await prisma.serviceRecord.findMany({
            where: { vehicleId: params.id },
            orderBy: { serviceDate: 'desc' }
        });
        return { records };
    })

    .post("/:id/services", async ({ params, body, auth, set }) => {

        const vehicle = await prisma.garageVehicle.findUnique({ where: { id: params.id } });
        if (!vehicle || vehicle.userId !== auth.userId) {
            set.status = 403;
            return { message: "ไม่มีสิทธิ์เข้าถึง" };
        }

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

    .delete("/services/:id", async ({ params, auth, set }) => {

        const record = await prisma.serviceRecord.findUnique({
            where: { id: params.id },
            include: { vehicle: true }
        });
        if (!record || record.vehicle.userId !== auth.userId) {
            set.status = 403;
            return { message: "ไม่มีสิทธิ์เข้าถึง" };
        }

        try {
            await prisma.serviceRecord.delete({ where: { id: params.id } });
            return { message: "ลบสำเร็จ" };
        } catch { set.status = 404; return { message: "ไม่พบรายการ" }; }
    })

    // === Maintenance Reminders ===
    .get("/:id/reminders", async ({ params, auth, set }) => {

        const vehicle = await prisma.garageVehicle.findUnique({ where: { id: params.id } });
        if (!vehicle || vehicle.userId !== auth.userId) {
            set.status = 403;
            return { message: "ไม่มีสิทธิ์เข้าถึง" };
        }

        const reminders = await prisma.maintenanceReminder.findMany({
            where: { vehicleId: params.id },
            orderBy: { createdAt: 'desc' }
        });
        return { reminders };
    })

    .post("/:id/reminders", async ({ params, body, auth, set }) => {

        const vehicle = await prisma.garageVehicle.findUnique({ where: { id: params.id } });
        if (!vehicle || vehicle.userId !== auth.userId) {
            set.status = 403;
            return { message: "ไม่มีสิทธิ์เข้าถึง" };
        }

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

    .put("/reminders/:id", async ({ params, body, auth, set }) => {

        const reminder = await prisma.maintenanceReminder.findUnique({
            where: { id: params.id },
            include: { vehicle: true }
        });
        if (!reminder || reminder.vehicle.userId !== auth.userId) {
            set.status = 403;
            return { message: "ไม่มีสิทธิ์เข้าถึง" };
        }

        try {
            const { dueDate, ...rest } = body as any;
            const updated = await prisma.maintenanceReminder.update({
                where: { id: params.id },
                data: {
                    ...rest,
                    ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
                },
            });
            return { message: "อัปเดตสำเร็จ", reminder: updated };
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

    .delete("/reminders/:id", async ({ params, auth, set }) => {

        const reminder = await prisma.maintenanceReminder.findUnique({
            where: { id: params.id },
            include: { vehicle: true }
        });
        if (!reminder || reminder.vehicle.userId !== auth.userId) {
            set.status = 403;
            return { message: "ไม่มีสิทธิ์เข้าถึง" };
        }

        try {
            await prisma.maintenanceReminder.delete({ where: { id: params.id } });
            return { message: "ลบสำเร็จ" };
        } catch { set.status = 404; return { message: "ไม่พบรายการ" }; }
    });
