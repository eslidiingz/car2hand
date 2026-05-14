/**
 * Slot Purchase Routes
 * API สำหรับซื้อ slot ประกาศเพิ่ม (99 บาท/slot, สะสมถาวร)
 */

import { Elysia, t } from "elysia";
import prisma from "./db";
import { uploadFile, processImage, generateFilename, isValidImageType, isValidFileSize } from "./storage";
import { getAndBroadcastPendingCounts } from "./admin-sse";
import { authGuard, blockImpersonation } from "./jwt";

export const PRICE_PER_SLOT = 99;
export const MIN_QUANTITY = 1;
export const MAX_QUANTITY_PER_PURCHASE = 10;

const slotRoutes = new Elysia({ prefix: "/slots" })
    .use(authGuard)

    // ดึงสถานะ bonus slots + ประวัติซื้อ ของ user ปัจจุบัน
    .get("/me", async ({ auth, set }) => {
        if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                bonusListingSlots: true,
                currentPackage: { select: { maxListings: true, slug: true } },
            }
        });
        if (!user) { set.status = 404; return { message: "ไม่พบผู้ใช้งาน" }; }

        const packageMax = user.currentPackage?.maxListings ?? 3;
        const bonus = user.bonusListingSlots ?? 0;
        const isUnlimited = packageMax === -1;

        return {
            pricePerSlot: PRICE_PER_SLOT,
            minQuantity: MIN_QUANTITY,
            maxQuantityPerPurchase: MAX_QUANTITY_PER_PURCHASE,
            bonusListingSlots: bonus,
            packageMaxListings: packageMax,
            effectiveMaxListings: isUnlimited ? -1 : packageMax + bonus,
            isUnlimited,
            canPurchase: !isUnlimited,
        };
    })

    // ส่งคำขอซื้อ slot เพิ่ม (พร้อมแนบสลิป)
    .post("/purchase", async ({ body, auth, set }) => {
        if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const blocked = blockImpersonation(auth, set);
        if (blocked) return blocked;
        const userId = auth.userId;
        const { quantity, slipImage } = body;

        if (quantity < MIN_QUANTITY || quantity > MAX_QUANTITY_PER_PURCHASE) {
            set.status = 400;
            return { message: `จำนวน slot ต้องอยู่ระหว่าง ${MIN_QUANTITY}-${MAX_QUANTITY_PER_PURCHASE} ต่อรายการ` };
        }

        if (!isValidImageType(slipImage.mimetype)) {
            set.status = 400;
            return { message: "รองรับเฉพาะไฟล์รูปภาพ" };
        }
        const slipBuffer = Buffer.from(slipImage.buffer, 'base64');
        if (!isValidFileSize(slipBuffer.length)) {
            set.status = 400;
            return { message: "ขนาดไฟล์ต้องไม่เกิน 10 MB" };
        }

        // ตรวจสอบ user + package (ห้ามซื้อตอนแพ็กเกจ unlimited)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, currentPackage: { select: { maxListings: true } } }
        });
        if (!user) { set.status = 401; return { message: "กรุณาเข้าสู่ระบบ" }; }
        if (user.currentPackage?.maxListings === -1) {
            set.status = 400;
            return { message: "แพ็กเกจปัจจุบันลงประกาศได้ไม่จำกัดอยู่แล้ว ไม่ต้องซื้อ slot เพิ่ม" };
        }

        // กันซื้อซ้ำตอนยังมี PENDING ค้าง
        const pending = await prisma.slotPurchase.findFirst({
            where: { userId, status: 'PENDING' }
        });
        if (pending) {
            set.status = 400;
            return { message: "คุณมีรายการรอตรวจสอบอยู่แล้ว กรุณารอผลการตรวจสอบ" };
        }

        try {
            const webpBuffer = await processImage(slipBuffer, { maxWidth: 800, quality: 85 });
            const baseFilename = generateFilename(slipImage.filename);
            const webpFilename = baseFilename.replace(/\.[^.]+$/, '.webp');
            const objectPath = `${userId}/slot-slips/${webpFilename}`;
            const slipUrl = await uploadFile(objectPath, webpBuffer, 'image/webp');

            const totalAmount = quantity * PRICE_PER_SLOT;

            const purchase = await prisma.slotPurchase.create({
                data: {
                    userId,
                    quantity,
                    pricePerSlot: PRICE_PER_SLOT,
                    totalAmount,
                    slipImage: slipUrl,
                    status: 'PENDING',
                },
            });

            getAndBroadcastPendingCounts();
            return {
                message: "ส่งคำขอซื้อ slot สำเร็จ รอการตรวจสอบจากผู้ดูแลระบบ",
                purchase,
            };
        } catch (error) {
            console.error('Slot purchase error:', error);
            set.status = 500;
            const errName = error instanceof Error ? error.name : "";
            // Surface storage errors so admin knows credentials/bucket are misconfigured
            if (errName === "AccessDenied" || errName === "NoSuchBucket" || errName === "InvalidAccessKeyId") {
                return {
                    message: "ไม่สามารถอัพโหลดสลิปได้: ระบบจัดเก็บไฟล์ปฏิเสธการเข้าถึง (กรุณาแจ้ง admin ตรวจสอบการตั้งค่า Storage)",
                    code: errName,
                };
            }
            return { message: "เกิดข้อผิดพลาดในการส่งคำขอ" };
        }
    }, {
        body: t.Object({
            quantity: t.Number(),
            slipImage: t.Object({
                buffer: t.String(),
                filename: t.String(),
                mimetype: t.String(),
            }),
        })
    })

    // ประวัติการซื้อ slot ของ user
    .get("/purchases", async ({ auth, set }) => {
        if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;

        const purchases = await prisma.slotPurchase.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return { purchases };
    });

export const slotPurchaseRoutes = new Elysia().use(slotRoutes);
