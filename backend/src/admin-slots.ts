/**
 * Admin Slot Purchase Routes
 * รีวิวสลิปซื้อ slot ประกาศเพิ่ม + อนุมัติ/ปฏิเสธ
 */

import { Elysia, t } from "elysia";
import prisma from "./db";
import { jwtPlugin } from "./jwt";
import { getAndBroadcastPendingCounts, pushNotification } from "./admin-sse";
import { reactivatePausedListings, getEffectiveMaxListings } from "./config/pause";

async function verifyAdminToken(jwt: any, headers: Record<string, string | undefined>, set: any) {
    const authHeader = headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
        set.status = 401;
        return { adminId: null as string | null };
    }
    const token = authHeader.slice(7).trim();
    const payload = await jwt.verify(token);
    if (!payload) {
        set.status = 401;
        return { adminId: null as string | null };
    }
    const userId = (payload as any).userId;
    const admin = await prisma.admin.findUnique({ where: { id: userId } });
    if (!admin) {
        set.status = 403;
        return { adminId: null as string | null };
    }
    return { adminId: userId as string | null };
}

export const adminSlotPurchaseRoutes = new Elysia({ prefix: "/admin/slot-purchases" })
    .use(jwtPlugin())
    .derive(async ({ jwt, headers, set }) => verifyAdminToken(jwt, headers, set))
    .onBeforeHandle(({ adminId, set }) => {
        if (!adminId) {
            if (set.status !== 403) set.status = 401;
            return { error: 'Unauthorized', message: 'กรุณาเข้าสู่ระบบ Admin' };
        }
    })

    // ดึงรายการคำขอซื้อ slot
    .get("/", async ({ query }) => {
        const { status, page = '1', limit = '20' } = query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const where: any = {};
        if (status) where.status = status;

        const [purchases, total] = await Promise.all([
            prisma.slotPurchase.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            phoneNumber: true,
                            bonusListingSlots: true,
                            currentPackage: { select: { name: true, slug: true } },
                        }
                    }
                }
            }),
            prisma.slotPurchase.count({ where }),
        ]);

        return {
            purchases,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / take),
            }
        };
    })

    // อนุมัติคำขอ → เพิ่ม bonusListingSlots ของ user
    .post("/:id/approve", async ({ params: { id }, set }) => {
        try {
            const purchase = await prisma.slotPurchase.findUnique({
                where: { id },
                include: { user: { select: { id: true, fullName: true, lineUserId: true } } }
            });

            if (!purchase) {
                set.status = 404;
                return { error: 'Not Found', message: 'ไม่พบรายการนี้' };
            }
            if (purchase.status !== 'PENDING') {
                set.status = 400;
                return { error: 'Bad Request', message: 'รายการนี้ถูกตรวจสอบแล้ว' };
            }

            const [updated] = await prisma.$transaction([
                prisma.slotPurchase.update({
                    where: { id },
                    data: { status: 'APPROVED', reviewedAt: new Date() }
                }),
                prisma.user.update({
                    where: { id: purchase.userId },
                    data: { bonusListingSlots: { increment: purchase.quantity } }
                }),
            ]);

            // Reactivate paused listings ตาม bonus slot ที่เพิ่ม (ถ้ามีที่ว่าง)
            const userAfter = await prisma.user.findUnique({
                where: { id: purchase.userId },
                select: { bonusListingSlots: true, currentPackage: { select: { maxListings: true } } }
            });
            const effectiveMax = getEffectiveMaxListings(userAfter?.currentPackage?.maxListings, userAfter?.bonusListingSlots ?? 0);
            let reactivatedCount = 0;
            if (effectiveMax !== -1) {
                const currentActive = await prisma.vehicleListing.count({
                    where: { userId: purchase.userId, status: { in: ['ACTIVE', 'PENDING', 'DRAFT'] } }
                });
                const available = Math.max(0, effectiveMax - currentActive);
                if (available > 0) {
                    reactivatedCount = await reactivatePausedListings(purchase.userId, available);
                }
            }

            // Notification: persist DB + SSE/web push + LINE
            const reactivateMsg = reactivatedCount > 0 ? ` พร้อมปลุกประกาศที่หยุดชั่วคราว ${reactivatedCount} รายการ` : '';
            const approveNotif = {
                title: 'อนุมัติการซื้อ slot ประกาศเพิ่ม',
                message: `เพิ่ม ${purchase.quantity} slot ในบัญชีคุณเรียบร้อย (ยอด ฿${Number(purchase.totalAmount).toLocaleString('th-TH')})${reactivateMsg}`,
                type: 'SLOT_PURCHASE_APPROVED',
            };
            await prisma.userNotification.create({ data: { userId: purchase.userId, ...approveNotif } });
            pushNotification(purchase.userId, { ...approveNotif, url: '/profile/packages' });

            if (purchase.user.lineUserId) {
                try {
                    const { pushMessage, buildTextMessage } = await import("./line");
                    await pushMessage(purchase.user.lineUserId, buildTextMessage(`✅ อนุมัติแล้ว: เพิ่ม ${purchase.quantity} slot ประกาศในบัญชีคุณ`));
                } catch { /* silent */ }
            }

            getAndBroadcastPendingCounts();
            return { message: 'อนุมัติคำขอซื้อ slot สำเร็จ', purchase: updated };
        } catch (error) {
            console.error('Approve slot purchase error:', error);
            set.status = 500;
            return { error: 'Server Error', message: 'ไม่สามารถอนุมัติได้' };
        }
    })

    // ปฏิเสธคำขอ
    .post("/:id/reject", async ({ params: { id }, body, set }) => {
        try {
            const purchase = await prisma.slotPurchase.findUnique({
                where: { id },
                include: { user: { select: { lineUserId: true } } }
            });
            if (!purchase) {
                set.status = 404;
                return { error: 'Not Found', message: 'ไม่พบรายการนี้' };
            }
            if (purchase.status !== 'PENDING') {
                set.status = 400;
                return { error: 'Bad Request', message: 'รายการนี้ถูกตรวจสอบแล้ว' };
            }

            const updated = await prisma.slotPurchase.update({
                where: { id },
                data: {
                    status: 'REJECTED',
                    reviewedAt: new Date(),
                    adminNote: body.adminNote || null,
                }
            });

            const rejectNotif = {
                title: 'คำขอซื้อ slot ถูกปฏิเสธ',
                message: `คำขอซื้อ ${purchase.quantity} slot ถูกปฏิเสธ${body.adminNote ? ': ' + body.adminNote : ' กรุณาตรวจสอบสลิปและส่งคำขอใหม่'}`,
                type: 'SLOT_PURCHASE_REJECTED',
            };
            await prisma.userNotification.create({ data: { userId: purchase.userId, ...rejectNotif } });
            pushNotification(purchase.userId, { ...rejectNotif, url: '/profile/packages' });

            if (purchase.user.lineUserId) {
                try {
                    const { pushMessage, buildTextMessage } = await import("./line");
                    await pushMessage(purchase.user.lineUserId, buildTextMessage(`❌ คำขอซื้อ slot ถูกปฏิเสธ${body.adminNote ? ': ' + body.adminNote : ''}`));
                } catch { /* silent */ }
            }

            getAndBroadcastPendingCounts();
            return { message: 'ปฏิเสธคำขอเรียบร้อย', purchase: updated };
        } catch (error) {
            console.error('Reject slot purchase error:', error);
            set.status = 500;
            return { error: 'Server Error', message: 'ไม่สามารถปฏิเสธได้' };
        }
    }, {
        body: t.Object({
            adminNote: t.Optional(t.String()),
        })
    });
