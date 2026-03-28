/**
 * Package Routes
 * API สำหรับระบบแพ็กเกจผู้ลงขาย
 */

import { Elysia, t } from "elysia";
import prisma from "./db";
import { getUserPackage } from "./config/packages";
import { uploadFile, processImage, generateFilename } from "./storage";

// =============================================
// Public Routes - ไม่ต้อง login
// =============================================
export const packageRoutes = new Elysia({ prefix: "/packages" })

    // ดึงรายการแพ็กเกจทั้งหมดจาก Database
    .get("/", async () => {
        const packages = await prisma.package.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            select: {
                id: true,
                name: true,
                nameTh: true,
                slug: true,
                description: true,
                targetAudience: true,
                price: true,
                maxListings: true,
                maxPhotosPerListing: true,
                listingDurationDays: true,
                autoBumpPerDay: true,
                badge: true,
                searchPriority: true,
                features: true,
                sortOrder: true,
            }
        });

        return { packages };
    })

    // ดึง Package ปัจจุบันของ user
    .get("/my", async ({ query, set }) => {
        const userId = query.userId;
        if (!userId) {
            set.status = 400;
            return { message: "กรุณาระบุ userId" };
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                currentPackageId: true,
                packageExpiresAt: true,
                currentPackage: true,
                _count: {
                    select: {
                        listings: {
                            where: {
                                status: { in: ['ACTIVE', 'DRAFT', 'PENDING'] }
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            set.status = 404;
            return { message: "ไม่พบผู้ใช้งาน" };
        }

        const pkg = user.currentPackage;

        return {
            currentPackage: pkg ? {
                id: pkg.id,
                name: pkg.name,
                nameTh: pkg.nameTh,
                slug: pkg.slug,
                maxListings: pkg.maxListings,
                maxPhotosPerListing: pkg.maxPhotosPerListing,
                listingDurationDays: pkg.listingDurationDays,
            } : null,
            packageExpiresAt: user.packageExpiresAt,
            usage: {
                activeListings: user._count.listings,
                maxListings: pkg?.maxListings ?? 1
            }
        };
    })

    // ส่งคำขออัพเกรดแพ็กเกจ (พร้อมแนบสลิป)
    .post("/upgrade", async ({ body, set }) => {
        const { userId, packageId, slipImage } = body;

        // ตรวจสอบ user
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, currentPackageId: true, currentPackage: true }
        });
        if (!user) {
            set.status = 401;
            return { message: "กรุณาเข้าสู่ระบบ" };
        }

        // ตรวจสอบ package ที่จะอัพเกรด
        const targetPackage = await prisma.package.findUnique({
            where: { id: packageId }
        });
        if (!targetPackage || !targetPackage.isActive) {
            set.status = 400;
            return { message: "แพ็กเกจที่เลือกไม่ถูกต้องหรือไม่พร้อมใช้งาน" };
        }

        // ห้ามเลือกแพ็กเกจที่ลำดับเท่ากับหรือต่ำกว่าปัจจุบัน
        if (user.currentPackage && targetPackage.sortOrder <= user.currentPackage.sortOrder) {
            set.status = 400;
            return { message: "ไม่สามารถเลือกแพ็กเกจที่ต่ำกว่าหรือเท่ากับแพ็กเกจปัจจุบันได้" };
        }

        // ตรวจสอบว่ามีรายการคำขอที่รอตรวจสอบอยู่หรือไม่
        const pendingTransaction = await prisma.packageTransaction.findFirst({
            where: { userId, status: 'PENDING' }
        });
        if (pendingTransaction) {
            set.status = 400;
            return { message: "คุณมีรายการรอตรวจสอบอยู่แล้ว กรุณารอผลการตรวจสอบ" };
        }

        try {
            // อัพโหลดสลิป
            const slipBuffer = Buffer.from(slipImage.buffer, 'base64');
            const webpBuffer = await processImage(slipBuffer, {
                maxWidth: 800,
                quality: 85
            });
            const baseFilename = generateFilename(slipImage.filename);
            const webpFilename = baseFilename.replace(/\.[^.]+$/, '.webp');
            const objectPath = `${userId}/slips/${webpFilename}`;
            const slipUrl = await uploadFile(objectPath, webpBuffer, 'image/webp');

            // สร้าง transaction
            const transaction = await prisma.packageTransaction.create({
                data: {
                    userId,
                    packageId: targetPackage.id,
                    amount: targetPackage.price,
                    slipImage: slipUrl,
                    status: 'PENDING'
                },
                include: {
                    package: {
                        select: { name: true, nameTh: true }
                    }
                }
            });

            return {
                message: "ส่งคำขออัพเกรดแพ็กเกจสำเร็จ รอการตรวจสอบจากผู้ดูแลระบบ",
                transaction
            };
        } catch (error) {
            console.error('Package upgrade error:', error);
            set.status = 500;
            return { message: "เกิดข้อผิดพลาดในการส่งคำขอ" };
        }
    }, {
        body: t.Object({
            userId: t.String(),
            packageId: t.String(),
            slipImage: t.Object({
                buffer: t.String(), // base64
                filename: t.String(),
                mimetype: t.String()
            })
        })
    })

    // ดึงข้อมูลการชำระเงิน (บัญชีธนาคาร, QR Code) สำหรับแสดงให้ผู้ใช้
    .get("/payment-info", async () => {
        const settings = await prisma.systemSetting.findMany({
            where: { key: { startsWith: 'payment.' } }
        });
        const result: Record<string, string> = {};
        for (const s of settings) {
            // ตัด prefix 'payment.' ออกเพื่อให้ key สั้นลง
            const shortKey = s.key.replace('payment.', '');
            result[shortKey] = s.value;
        }
        return result;
    })

    // ดึงประวัติการอัพเกรดของ user
    .get("/transactions", async ({ query, set }) => {
        const userId = query.userId;
        if (!userId) {
            set.status = 400;
            return { message: "กรุณาระบุ userId" };
        }

        const transactions = await prisma.packageTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                package: {
                    select: { id: true, name: true, nameTh: true, slug: true }
                }
            }
        });

        return { transactions };
    });
