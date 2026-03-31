import { Elysia, t } from "elysia";
import prisma from "./db";

export const adminServiceRoutes = new Elysia({ prefix: "/admin/services" })

    // Dashboard stats
    .get("/dashboard", async () => {
        const [totalBookings, pendingBookings, totalInquiries, newInquiries] = await Promise.all([
            prisma.inspectionBooking.count(),
            prisma.inspectionBooking.count({ where: { status: "PENDING" } }),
            prisma.serviceInquiry.count(),
            prisma.serviceInquiry.count({ where: { status: "NEW" } }),
        ]);

        return {
            stats: { totalBookings, pendingBookings, totalInquiries, newInquiries }
        };
    })

    // List bookings (paginated)
    .get("/bookings", async ({ query }) => {
        const status = (query as any).status as string | undefined;
        const search = (query as any).search as string | undefined;
        const page = Number((query as any).page) || 1;
        const limit = Number((query as any).limit) || 20;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { contactName: { contains: search, mode: 'insensitive' } },
                { contactPhone: { contains: search } },
                { brandName: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [bookings, total] = await Promise.all([
            prisma.inspectionBooking.findMany({
                where,
                include: { package: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.inspectionBooking.count({ where }),
        ]);

        return {
            bookings,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    })

    // Update booking
    .put("/bookings/:id", async ({ params, body, set }) => {
        try {
            const booking = await prisma.inspectionBooking.update({
                where: { id: params.id },
                data: body as any,
                include: { package: true },
            });
            return { message: "อัปเดตสำเร็จ", booking };
        } catch {
            set.status = 404;
            return { message: "ไม่พบการจอง" };
        }
    }, {
        body: t.Object({
            status: t.Optional(t.String()),
            adminNote: t.Optional(t.String()),
        })
    })

    // List inquiries (paginated)
    .get("/inquiries", async ({ query }) => {
        const type = (query as any).type as string | undefined;
        const status = (query as any).status as string | undefined;
        const page = Number((query as any).page) || 1;
        const limit = Number((query as any).limit) || 20;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (type) where.type = type;
        if (status) where.status = status;

        const [inquiries, total] = await Promise.all([
            prisma.serviceInquiry.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.serviceInquiry.count({ where }),
        ]);

        return {
            inquiries,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    })

    // Update inquiry
    .put("/inquiries/:id", async ({ params, body, set }) => {
        try {
            const inquiry = await prisma.serviceInquiry.update({
                where: { id: params.id },
                data: body as any,
            });
            return { message: "อัปเดตสำเร็จ", inquiry };
        } catch {
            set.status = 404;
            return { message: "ไม่พบรายการ" };
        }
    }, {
        body: t.Object({
            status: t.Optional(t.String()),
            adminNote: t.Optional(t.String()),
        })
    })

    // === Inspection Packages CRUD ===

    // List all packages (including inactive)
    .get("/packages", async () => {
        const packages = await prisma.inspectionPackage.findMany({
            orderBy: { order: 'asc' },
        });
        return { packages };
    })

    // Create package
    .post("/packages", async ({ body }) => {
        const pkg = await prisma.inspectionPackage.create({
            data: body as any,
        });
        return { message: "สร้างแพ็กเกจสำเร็จ", package: pkg };
    }, {
        body: t.Object({
            name: t.String(),
            nameEn: t.Optional(t.String()),
            price: t.Number(),
            description: t.Optional(t.String()),
            features: t.Optional(t.Any()),
            isRecommended: t.Optional(t.Boolean()),
            isActive: t.Optional(t.Boolean()),
            order: t.Optional(t.Number()),
        })
    })

    // Update package
    .put("/packages/:id", async ({ params, body, set }) => {
        try {
            const pkg = await prisma.inspectionPackage.update({
                where: { id: params.id },
                data: body as any,
            });
            return { message: "อัปเดตสำเร็จ", package: pkg };
        } catch {
            set.status = 404;
            return { message: "ไม่พบแพ็กเกจ" };
        }
    }, {
        body: t.Object({
            name: t.Optional(t.String()),
            nameEn: t.Optional(t.String()),
            price: t.Optional(t.Number()),
            description: t.Optional(t.String()),
            features: t.Optional(t.Any()),
            isRecommended: t.Optional(t.Boolean()),
            isActive: t.Optional(t.Boolean()),
            order: t.Optional(t.Number()),
        })
    })

    // Delete package (only if no bookings)
    .delete("/packages/:id", async ({ params, set }) => {
        const bookingCount = await prisma.inspectionBooking.count({
            where: { packageId: params.id }
        });

        if (bookingCount > 0) {
            set.status = 400;
            return { message: "ไม่สามารถลบได้ เนื่องจากมีการจองที่ใช้แพ็กเกจนี้อยู่" };
        }

        try {
            await prisma.inspectionPackage.delete({ where: { id: params.id } });
            return { message: "ลบแพ็กเกจสำเร็จ" };
        } catch {
            set.status = 404;
            return { message: "ไม่พบแพ็กเกจ" };
        }
    })

    // === Service Partners CRUD ===

    // List all partners
    .get("/partners", async () => {
        const partners = await prisma.servicePartner.findMany({
            orderBy: { order: 'asc' },
        });
        return { partners };
    })

    // Create partner
    .post("/partners", async ({ body }) => {
        const partner = await prisma.servicePartner.create({
            data: body as any,
        });
        return { message: "สร้างพาร์ทเนอร์สำเร็จ", partner };
    }, {
        body: t.Object({
            name: t.String(),
            type: t.String(),
            logoUrl: t.Optional(t.String()),
            description: t.Optional(t.String()),
            highlight: t.Optional(t.String()),
            order: t.Optional(t.Number()),
        })
    })

    // Update partner
    .put("/partners/:id", async ({ params, body, set }) => {
        try {
            const partner = await prisma.servicePartner.update({
                where: { id: params.id },
                data: body as any,
            });
            return { message: "อัปเดตสำเร็จ", partner };
        } catch {
            set.status = 404;
            return { message: "ไม่พบพาร์ทเนอร์" };
        }
    }, {
        body: t.Object({
            name: t.Optional(t.String()),
            type: t.Optional(t.String()),
            logoUrl: t.Optional(t.String()),
            description: t.Optional(t.String()),
            highlight: t.Optional(t.String()),
            isActive: t.Optional(t.Boolean()),
            order: t.Optional(t.Number()),
        })
    })

    // Delete partner
    .delete("/partners/:id", async ({ params, set }) => {
        try {
            await prisma.servicePartner.delete({ where: { id: params.id } });
            return { message: "ลบพาร์ทเนอร์สำเร็จ" };
        } catch {
            set.status = 404;
            return { message: "ไม่พบพาร์ทเนอร์" };
        }
    });
