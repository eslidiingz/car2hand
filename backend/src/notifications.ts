/**
 * Notification Admin Routes
 * Manage notification templates, send notifications, and view logs
 */

import { Elysia, t } from "elysia";
import prisma from "./db";
import { jwtPlugin } from "./jwt";
import { pushMessage, multicast, buildTextMessage, replaceVariables, getLineSettings } from "./line";

export const notificationRoutes = new Elysia({ prefix: "/admin/notifications" })
    .use(jwtPlugin())
    .derive(async ({ jwt, headers, set }) => {
        // Same JWT auth pattern as admin.ts
        const authHeader = headers['authorization'];
        if (!authHeader?.startsWith('Bearer ')) { set.status = 401; return { authError: 'Unauthorized' }; }
        const token = authHeader.slice(7).trim();
        const payload = await jwt.verify(token);
        if (!payload) { set.status = 401; return { authError: 'Invalid Token' }; }
        return { adminId: (payload as any).userId };
    })
    .onBeforeHandle(({ adminId, set }: any) => {
        if (!adminId) { set.status = 401; return { error: 'Unauthorized' }; }
    })

    // ===== Template CRUD =====
    .get("/templates", async () => {
        const templates = await prisma.notificationTemplate.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return { templates };
    })

    .post("/templates", async ({ body, set }) => {
        try {
            const template = await prisma.notificationTemplate.create({ data: body as any });
            return { message: "สร้างเทมเพลตสำเร็จ", template };
        } catch (e: any) {
            set.status = 400;
            return { message: e.message?.includes('Unique') ? "ชื่อเทมเพลตนี้มีอยู่แล้ว" : "เกิดข้อผิดพลาด" };
        }
    }, {
        body: t.Object({
            name: t.String(),
            label: t.String(),
            type: t.String(),
            content: t.String(),
            flexJson: t.Optional(t.String()),
            isActive: t.Optional(t.Boolean()),
        })
    })

    .put("/templates/:id", async ({ params, body, set }) => {
        try {
            const template = await prisma.notificationTemplate.update({
                where: { id: params.id },
                data: body as any,
            });
            return { message: "อัปเดตเทมเพลตสำเร็จ", template };
        } catch { set.status = 404; return { message: "ไม่พบเทมเพลต" }; }
    }, {
        body: t.Object({
            name: t.Optional(t.String()),
            label: t.Optional(t.String()),
            type: t.Optional(t.String()),
            content: t.Optional(t.String()),
            flexJson: t.Optional(t.String()),
            isActive: t.Optional(t.Boolean()),
        })
    })

    .delete("/templates/:id", async ({ params, set }) => {
        try {
            await prisma.notificationTemplate.delete({ where: { id: params.id } });
            return { message: "ลบเทมเพลตสำเร็จ" };
        } catch { set.status = 404; return { message: "ไม่พบเทมเพลต" }; }
    })

    // ===== Send Notification =====
    .post("/recipient-count", async ({ body }) => {
        const { recipientType, packageSlug, userId } = body as any;
        let count = 0;

        if (recipientType === 'INDIVIDUAL') {
            if (userId) {
                const user = await prisma.user.findUnique({ where: { id: userId }, select: { lineUserId: true } });
                count = user?.lineUserId ? 1 : 0;
            }
        } else if (recipientType === 'ALL_USERS') {
            count = await prisma.user.count({ where: { lineUserId: { not: null }, isActive: true } });
        } else if (recipientType === 'BY_PACKAGE') {
            count = await prisma.user.count({
                where: { lineUserId: { not: null }, isActive: true, currentPackage: { slug: packageSlug } }
            });
        } else if (recipientType === 'EXPIRED_LISTINGS') {
            count = await prisma.user.count({
                where: { lineUserId: { not: null }, isActive: true, listings: { some: { status: 'EXPIRED' } } }
            });
        }

        return { count };
    })

    .post("/preview", async ({ body }) => {
        const { templateId, userId } = body as any;
        const template = await prisma.notificationTemplate.findUnique({ where: { id: templateId } });
        if (!template) return { message: "ไม่พบเทมเพลต" };

        // Get sample data
        const user = userId
            ? await prisma.user.findUnique({ where: { id: userId }, select: { fullName: true } })
            : { fullName: 'ชื่อผู้ใช้ตัวอย่าง' };

        const listing = await prisma.vehicleListing.findFirst({
            where: userId ? { userId } : {},
            select: { title: true, brand: true, model: true, year: true, expiredAt: true },
            orderBy: { createdAt: 'desc' },
        });

        const variables: Record<string, string> = {
            userName: user?.fullName || 'ผู้ใช้',
            listingTitle: listing ? `${listing.year} ${listing.brand} ${listing.model}` : 'ชื่อประกาศตัวอย่าง',
            expiryDate: listing?.expiredAt ? new Date(listing.expiredAt).toLocaleDateString('th-TH') : 'วันที่ตัวอย่าง',
            siteName: 'Car2Hand',
        };

        const preview = replaceVariables(template.content, variables);
        return { preview, variables };
    })

    .post("/send", async ({ body, adminId, set }: any) => {
        const { templateId, recipientType, packageSlug, userId } = body;

        const template = await prisma.notificationTemplate.findUnique({ where: { id: templateId } });
        if (!template) { set.status = 404; return { message: "ไม่พบเทมเพลต" }; }

        // Get LINE settings to check if configured
        const lineSettings = await getLineSettings();
        if (!lineSettings.channelAccessToken) {
            set.status = 400;
            return { message: "ยังไม่ได้ตั้งค่า LINE OA กรุณาตั้งค่าก่อนส่งแจ้งเตือน" };
        }

        // Build where clause for recipients
        let where: any = { lineUserId: { not: null }, isActive: true };
        if (recipientType === 'INDIVIDUAL') where.id = userId;
        else if (recipientType === 'BY_PACKAGE') where.currentPackage = { slug: packageSlug };
        else if (recipientType === 'EXPIRED_LISTINGS') where.listings = { some: { status: 'EXPIRED' } };

        const users = await prisma.user.findMany({
            where,
            select: { id: true, fullName: true, lineUserId: true },
        });

        let totalSent = 0, totalFailed = 0;

        for (const user of users) {
            if (!user.lineUserId) continue;

            // Get user's latest listing for variables
            const listing = await prisma.vehicleListing.findFirst({
                where: { userId: user.id },
                select: { title: true, brand: true, model: true, year: true, expiredAt: true },
                orderBy: { createdAt: 'desc' },
            });

            const variables: Record<string, string> = {
                userName: user.fullName,
                listingTitle: listing ? `${listing.year} ${listing.brand} ${listing.model}` : '',
                expiryDate: listing?.expiredAt ? new Date(listing.expiredAt).toLocaleDateString('th-TH') : '',
                siteName: 'Car2Hand',
            };

            const messageText = replaceVariables(template.content, variables);
            const messages = buildTextMessage(messageText);

            const result = await pushMessage(user.lineUserId, messages);
            if (result.ok) totalSent++;
            else totalFailed++;
        }

        // Log the send
        await prisma.notificationLog.create({
            data: {
                templateId,
                recipientType,
                recipientFilter: JSON.stringify({ packageSlug, userId }),
                totalSent,
                totalFailed,
                sentBy: adminId,
            }
        });

        return { message: `ส่งแจ้งเตือนสำเร็จ ${totalSent} คน, ล้มเหลว ${totalFailed} คน`, totalSent, totalFailed };
    })

    // ===== Logs =====
    .get("/logs", async ({ query }) => {
        const { page = '1', limit = '20' } = query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const [logs, total] = await Promise.all([
            prisma.notificationLog.findMany({
                skip, take,
                orderBy: { createdAt: 'desc' },
                include: { template: { select: { label: true, type: true } } }
            }),
            prisma.notificationLog.count()
        ]);

        return { logs, pagination: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) } };
    });
