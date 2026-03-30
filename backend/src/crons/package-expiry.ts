import prisma from "../db";

// แจ้งเตือนแพ็กเกจจะหมดอายุใน 3 วัน
async function notifyExpiringPackages() {
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    try {
        // หา users ที่ packageExpiresAt อยู่ระหว่าง now กับ 3 วันข้างหน้า
        const users = await prisma.user.findMany({
            where: {
                packageExpiresAt: { gt: now, lte: threeDaysLater },
                currentPackageId: { not: null },
            },
            select: { id: true, fullName: true, lineUserId: true, packageExpiresAt: true, currentPackage: { select: { name: true } } }
        });

        for (const user of users) {
            // เช็คว่าเคยส่งแจ้งเตือนนี้แล้วหรือยัง (ใน 3 วันที่ผ่านมา)
            const existing = await prisma.userNotification.findFirst({
                where: {
                    userId: user.id,
                    type: 'PACKAGE_EXPIRING',
                    createdAt: { gte: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) }
                }
            });
            if (existing) continue;

            const daysLeft = Math.ceil((user.packageExpiresAt!.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

            // สร้าง in-app notification
            await prisma.userNotification.create({
                data: {
                    userId: user.id,
                    title: 'แพ็กเกจใกล้หมดอายุ',
                    message: `แพ็กเกจ ${user.currentPackage?.name} ของคุณจะหมดอายุในอีก ${daysLeft} วัน กรุณาต่ออายุเพื่อใช้งานต่อ`,
                    type: 'PACKAGE_EXPIRING',
                }
            });

            // ส่ง LINE notification (if connected)
            if (user.lineUserId) {
                try {
                    const { pushMessage, buildTextMessage } = await import("../line");
                    await pushMessage(user.lineUserId, buildTextMessage(
                        `\u{1F514} แจ้งเตือน: แพ็กเกจ ${user.currentPackage?.name} ของคุณจะหมดอายุในอีก ${daysLeft} วัน\n\nกรุณาต่ออายุที่ Car2Hand เพื่อใช้งานต่อ`
                    ));
                } catch {}
            }
        }

        if (users.length > 0) console.log(`[Package Expiry] แจ้งเตือน ${users.length} ผู้ใช้ที่แพ็กเกจใกล้หมดอายุ`);
    } catch (error) {
        console.error('[Package Expiry] Error:', error);
    }
}

// แจ้งเตือนแพ็กเกจหมดอายุแล้ว
async function notifyExpiredPackages() {
    const now = new Date();

    try {
        const users = await prisma.user.findMany({
            where: {
                packageExpiresAt: { lt: now },
                currentPackageId: { not: null },
            },
            select: { id: true, lineUserId: true, currentPackage: { select: { name: true } } }
        });

        for (const user of users) {
            const existing = await prisma.userNotification.findFirst({
                where: {
                    userId: user.id,
                    type: 'PACKAGE_EXPIRED',
                    createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
                }
            });
            if (existing) continue;

            await prisma.userNotification.create({
                data: {
                    userId: user.id,
                    title: 'แพ็กเกจหมดอายุ',
                    message: `แพ็กเกจ ${user.currentPackage?.name} ของคุณหมดอายุแล้ว สิทธิ์ของคุณถูกเปลี่ยนเป็น Basic (Free) กรุณาอัพเกรดเพื่อใช้งานต่อ`,
                    type: 'PACKAGE_EXPIRED',
                }
            });

            if (user.lineUserId) {
                try {
                    const { pushMessage, buildTextMessage } = await import("../line");
                    await pushMessage(user.lineUserId, buildTextMessage(
                        `\u{26A0}\u{FE0F} แพ็กเกจ ${user.currentPackage?.name} ของคุณหมดอายุแล้ว\n\nสิทธิ์ถูกเปลี่ยนเป็น Basic (Free)\nอัพเกรดแพ็กเกจที่ Car2Hand เพื่อใช้งานต่อ`
                    ));
                } catch {}
            }
        }
    } catch (error) {
        console.error('[Package Expired] Error:', error);
    }
}

// เริ่มต้น cron jobs
export function startPackageExpiryCrons() {
    // เรียกตอน startup
    notifyExpiringPackages();
    notifyExpiredPackages();

    // แจ้งเตือนใกล้หมดอายุ ทุก 24 ชม.
    setInterval(notifyExpiringPackages, 24 * 60 * 60 * 1000);

    // แจ้งเตือนหมดอายุ ทุก 1 ชม.
    setInterval(notifyExpiredPackages, 60 * 60 * 1000);

    console.log('[Cron] Package expiry notification crons started');
}
