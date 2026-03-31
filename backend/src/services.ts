import { Elysia, t } from "elysia";
import prisma from "./db";

export const serviceRoutes = new Elysia({ prefix: "/services" })

    // Get active inspection packages
    .get("/inspection/packages", async () => {
        const packages = await prisma.inspectionPackage.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        });
        return { packages };
    })

    // Create inspection booking
    .post("/inspection/bookings", async ({ body, query, set }) => {
        const userId = (query as any).userId as string | undefined;

        const pkg = await prisma.inspectionPackage.findUnique({
            where: { id: (body as any).packageId }
        });

        if (!pkg || !pkg.isActive) {
            set.status = 400;
            return { message: "แพ็กเกจไม่ถูกต้องหรือไม่พร้อมให้บริการ" };
        }

        const subtotal = Number(pkg.price);
        const vat = Math.round(subtotal * 0.07 * 100) / 100;
        const total = Math.round((subtotal + vat) * 100) / 100;

        const booking = await prisma.inspectionBooking.create({
            data: {
                packageId: (body as any).packageId,
                userId: userId || null,
                brandName: (body as any).brandName,
                modelName: (body as any).modelName || null,
                vehicleNote: (body as any).vehicleNote || null,
                location: (body as any).location,
                appointmentDate: new Date((body as any).appointmentDate),
                timeSlot: (body as any).timeSlot,
                contactName: (body as any).contactName,
                contactPhone: (body as any).contactPhone,
                contactLine: (body as any).contactLine || null,
                subtotal,
                vat,
                total,
            },
            include: { package: true }
        });

        return { message: "จองสำเร็จ", booking };
    }, {
        body: t.Object({
            packageId: t.String(),
            brandName: t.String(),
            modelName: t.Optional(t.String()),
            vehicleNote: t.Optional(t.String()),
            location: t.String(),
            appointmentDate: t.String(),
            timeSlot: t.String(),
            contactName: t.String(),
            contactPhone: t.String(),
            contactLine: t.Optional(t.String()),
        })
    })

    // Get service partners
    .get("/partners", async ({ query }) => {
        const type = (query as any).type as string | undefined;

        const where: any = { isActive: true };
        if (type) {
            where.type = type;
        }

        const partners = await prisma.servicePartner.findMany({
            where,
            orderBy: { order: 'asc' }
        });
        return { partners };
    })

    // Create service inquiry
    .post("/inquiries", async ({ body, query }) => {
        const userId = (query as any).userId as string | undefined;

        const inquiry = await prisma.serviceInquiry.create({
            data: {
                type: (body as any).type,
                contactName: (body as any).contactName,
                contactPhone: (body as any).contactPhone,
                contactLine: (body as any).contactLine || null,
                details: (body as any).details || null,
                userId: userId || null,
            }
        });

        return { message: "ส่งข้อมูลสำเร็จ เจ้าหน้าที่จะติดต่อกลับโดยเร็ว", inquiry };
    }, {
        body: t.Object({
            type: t.String(),
            contactName: t.String(),
            contactPhone: t.String(),
            contactLine: t.Optional(t.String()),
            details: t.Optional(t.Any()),
        })
    })

    // Get booking by id
    .get("/bookings/:id", async ({ params, set }) => {
        const booking = await prisma.inspectionBooking.findUnique({
            where: { id: params.id },
            include: { package: true }
        });

        if (!booking) {
            set.status = 404;
            return { message: "ไม่พบการจอง" };
        }

        return { booking };
    });
