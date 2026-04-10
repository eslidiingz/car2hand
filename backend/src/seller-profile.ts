/**
 * Seller Profile Routes
 * Public: view seller profiles and their listings
 * Protected: create/update own seller profile (paid package only)
 */

import { Elysia, t } from "elysia";
import prisma from "./db";
import { authGuard } from "./jwt";
import { getUserPackage } from "./config/packages";
import { isValidImageType, isValidFileSize, processImage, generateFilename, uploadFile, deleteOldFile, buildSellerLogoPath, buildSellerCoverPath } from "./storage";
import { sanitizeObject } from "./security";

// =============================================
// Public Routes
// =============================================
const publicSellerRoutes = new Elysia({ prefix: "/sellers" })

    // ดูโปรไฟล์ร้านสาธารณะ
    .get("/:id", async ({ params, set }) => {
        const { id } = params;

        const profile = await prisma.sellerProfile.findUnique({
            where: { userId: id },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        isActive: true,
                        createdAt: true,
                        packageExpiresAt: true,
                        currentPackage: {
                            select: { badge: true, name: true, slug: true }
                        }
                    }
                }
            }
        });

        if (!profile) {
            set.status = 404;
            return { message: "ไม่พบโปรไฟล์ร้าน" };
        }

        // นับจำนวนรถที่ขายอยู่ + ยอดวิวรวม
        const [activeListingCount, viewsResult] = await Promise.all([
            prisma.vehicleListing.count({
                where: { userId: id, status: 'ACTIVE' }
            }),
            prisma.vehicleListing.aggregate({
                where: { userId: id },
                _sum: { viewCount: true }
            })
        ]);

        // Check package badge
        const now = new Date();
        const pkgActive = profile.user.currentPackage
            ? (profile.user.packageExpiresAt ? new Date(profile.user.packageExpiresAt) > now : true)
            : false;

        return {
            profile: {
                ...profile,
                user: {
                    id: profile.user.id,
                    fullName: profile.user.fullName,
                    memberSince: profile.user.createdAt,
                    badge: pkgActive ? profile.user.currentPackage?.badge : null,
                },
                stats: {
                    activeListings: activeListingCount,
                    totalViews: viewsResult._sum.viewCount || 0,
                }
            }
        };
    })

    // ดูรายการรถของร้าน
    .get("/:id/listings", async ({ params, query }) => {
        const { id } = params;
        const page = parseInt(query.page as string || "1");
        const limit = parseInt(query.limit as string || "12");
        const skip = (page - 1) * limit;

        const [listings, total] = await Promise.all([
            prisma.vehicleListing.findMany({
                where: { userId: id, status: 'ACTIVE' },
                include: {
                    images: { where: { isPrimary: true }, take: 1 },
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            packageExpiresAt: true,
                            currentPackage: { select: { badge: true } },
                            sellerProfile: {
                                select: { shopName: true, shopLogo: true, showroomType: true, isVerified: true }
                            }
                        }
                    }
                },
                orderBy: [
                    { bumpedAt: { sort: 'desc', nulls: 'last' } },
                    { createdAt: 'desc' }
                ],
                skip,
                take: limit
            }),
            prisma.vehicleListing.count({ where: { userId: id, status: 'ACTIVE' } })
        ]);

        // Enrich with badge
        const now = new Date();
        const enriched = listings.map(l => {
            const pkgActive = l.user.currentPackage
                ? (l.user.packageExpiresAt ? new Date(l.user.packageExpiresAt) > now : true)
                : false;
            return {
                ...l,
                badge: pkgActive ? l.user.currentPackage?.badge : null,
                user: {
                    id: l.user.id,
                    fullName: l.user.fullName,
                    sellerProfile: l.user.sellerProfile
                }
            };
        });

        return {
            listings: enriched,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        };
    });

// =============================================
// Protected Routes (ต้อง login + แพ็กเกจเสียเงิน)
// =============================================
const protectedSellerRoutes = new Elysia({ prefix: "/users/me/seller-profile" })
    .use(authGuard)
    .onBeforeHandle(({ auth, set }) => {
        if (!auth || !auth.userId) {
            set.status = 401;
            return { error: 'Unauthorized', message: 'กรุณาเข้าสู่ระบบ' };
        }
    })

    // ดึงโปรไฟล์ตัวเอง (สำหรับแก้ไข)
    .get("/", async ({ auth, set }) => {
        if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;

        const profile = await prisma.sellerProfile.findUnique({
            where: { userId }
        });

        return { profile };
    })

    // สร้าง/แก้ไขโปรไฟล์ร้าน (upsert)
    .put("/", async ({ auth, body, set }) => {
        if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;

        // ตรวจสอบว่ามีแพ็กเกจเสียเงิน
        const userPkg = await getUserPackage(userId);
        if (!userPkg.id) {
            set.status = 403;
            return { message: "ฟีเจอร์นี้สำหรับแพ็กเกจที่เสียเงินเท่านั้น กรุณาอัพเกรดแพ็กเกจ" };
        }

        const sanitized = sanitizeObject(body as Record<string, unknown>);

        const profile = await prisma.sellerProfile.upsert({
            where: { userId },
            update: {
                shopName: sanitized.shopName as string,
                shopDescription: (sanitized.shopDescription as string) || null,
                shopAddress: (sanitized.shopAddress as string) || null,
                shopProvince: (sanitized.shopProvince as string) || null,
                shopDistrict: (sanitized.shopDistrict as string) || null,
                shopMapUrl: (sanitized.shopMapUrl as string) || null,
                shopPhone: (sanitized.shopPhone as string) || null,
                showroomType: (sanitized.showroomType as any) || 'INDIVIDUAL',
                shopOpenHours: (sanitized.shopOpenHours as string) || null,
                shopEstablishedYear: sanitized.shopEstablishedYear as number || null,
                socialWebsite: (sanitized.socialWebsite as string) || null,
                socialFacebook: (sanitized.socialFacebook as string) || null,
                socialLine: (sanitized.socialLine as string) || null,
                socialInstagram: (sanitized.socialInstagram as string) || null,
                specializations: sanitized.specializations || [],
            },
            create: {
                userId,
                shopName: sanitized.shopName as string,
                shopDescription: (sanitized.shopDescription as string) || null,
                shopAddress: (sanitized.shopAddress as string) || null,
                shopProvince: (sanitized.shopProvince as string) || null,
                shopDistrict: (sanitized.shopDistrict as string) || null,
                shopMapUrl: (sanitized.shopMapUrl as string) || null,
                shopPhone: (sanitized.shopPhone as string) || null,
                showroomType: (sanitized.showroomType as any) || 'INDIVIDUAL',
                shopOpenHours: (sanitized.shopOpenHours as string) || null,
                shopEstablishedYear: sanitized.shopEstablishedYear as number || null,
                socialWebsite: (sanitized.socialWebsite as string) || null,
                socialFacebook: (sanitized.socialFacebook as string) || null,
                socialLine: (sanitized.socialLine as string) || null,
                socialInstagram: (sanitized.socialInstagram as string) || null,
                specializations: sanitized.specializations || [],
            }
        });

        return { message: "บันทึกโปรไฟล์ร้านสำเร็จ", profile };
    }, {
        body: t.Object({
            shopName: t.String({ minLength: 2, maxLength: 100 }),
            shopDescription: t.Optional(t.String({ maxLength: 2000 })),
            shopAddress: t.Optional(t.String()),
            shopProvince: t.Optional(t.String()),
            shopDistrict: t.Optional(t.String()),
            shopMapUrl: t.Optional(t.String()),
            shopPhone: t.Optional(t.String()),
            showroomType: t.Optional(t.Union([
                t.Literal("INDIVIDUAL"),
                t.Literal("TENT"),
                t.Literal("DEALER")
            ])),
            shopOpenHours: t.Optional(t.String({ maxLength: 100 })),
            shopEstablishedYear: t.Optional(t.Nullable(t.Number())),
            socialWebsite: t.Optional(t.String()),
            socialFacebook: t.Optional(t.String()),
            socialLine: t.Optional(t.String()),
            socialInstagram: t.Optional(t.String()),
            specializations: t.Optional(t.Array(t.String(), { maxItems: 10 })),
        })
    })

    // อัพโหลดโลโก้ร้าน
    .post("/logo", async ({ auth, body, set }) => {
        if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;

        const userPkg = await getUserPackage(userId);
        if (!userPkg.id) {
            set.status = 403;
            return { message: "ฟีเจอร์นี้สำหรับแพ็กเกจที่เสียเงินเท่านั้น" };
        }

        const { image } = body;

        if (!isValidImageType(image.mimetype)) {
            set.status = 400;
            return { message: "รองรับเฉพาะไฟล์ JPEG, PNG, WebP และ GIF" };
        }

        const imageBuffer = Buffer.from(image.buffer, 'base64');
        if (!isValidFileSize(imageBuffer.length)) {
            set.status = 400;
            return { message: "ขนาดไฟล์ต้องไม่เกิน 10 MB" };
        }

        try {
            // Get old logo URL for cleanup
            const existing = await prisma.sellerProfile.findUnique({
                where: { userId },
                select: { shopLogo: true }
            });

            const webpBuffer = await processImage(imageBuffer, {
                maxWidth: 400,
                maxHeight: 400,
                quality: 85
            });

            const filename = generateFilename(image.filename);
            const webpFilename = filename.replace(/\.[^.]+$/, '.webp');
            const objectPath = buildSellerLogoPath(userId, webpFilename);
            const logoUrl = await uploadFile(objectPath, webpBuffer, 'image/webp');

            // Upsert profile with logo
            await prisma.sellerProfile.upsert({
                where: { userId },
                update: { shopLogo: logoUrl },
                create: { userId, shopName: 'ร้านของฉัน', shopLogo: logoUrl }
            });

            // Delete old logo
            if (existing?.shopLogo) {
                await deleteOldFile(existing.shopLogo);
            }

            return { message: "อัพโหลดโลโก้สำเร็จ", logoUrl };
        } catch (error) {
            console.error("Logo upload error:", error);
            set.status = 500;
            return { message: "เกิดข้อผิดพลาดในการอัพโหลด" };
        }
    }, {
        body: t.Object({
            image: t.Object({
                buffer: t.String(),
                filename: t.String(),
                mimetype: t.String()
            })
        })
    })

    // อัพโหลดภาพปกร้าน
    .post("/cover", async ({ auth, body, set }) => {
        if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;

        const userPkg = await getUserPackage(userId);
        if (!userPkg.id) {
            set.status = 403;
            return { message: "ฟีเจอร์นี้สำหรับแพ็กเกจที่เสียเงินเท่านั้น" };
        }

        const { image } = body;

        if (!isValidImageType(image.mimetype)) {
            set.status = 400;
            return { message: "รองรับเฉพาะไฟล์ JPEG, PNG, WebP และ GIF" };
        }

        const imageBuffer = Buffer.from(image.buffer, 'base64');
        if (!isValidFileSize(imageBuffer.length)) {
            set.status = 400;
            return { message: "ขนาดไฟล์ต้องไม่เกิน 10 MB" };
        }

        try {
            const existing = await prisma.sellerProfile.findUnique({
                where: { userId },
                select: { shopCoverImage: true }
            });

            const webpBuffer = await processImage(imageBuffer, {
                maxWidth: 1200,
                maxHeight: 400,
                quality: 85
            });

            const filename = generateFilename(image.filename);
            const webpFilename = filename.replace(/\.[^.]+$/, '.webp');
            const objectPath = buildSellerCoverPath(userId, webpFilename);
            const coverUrl = await uploadFile(objectPath, webpBuffer, 'image/webp');

            await prisma.sellerProfile.upsert({
                where: { userId },
                update: { shopCoverImage: coverUrl },
                create: { userId, shopName: 'ร้านของฉัน', shopCoverImage: coverUrl }
            });

            if (existing?.shopCoverImage) {
                await deleteOldFile(existing.shopCoverImage);
            }

            return { message: "อัพโหลดภาพปกสำเร็จ", coverUrl };
        } catch (error) {
            console.error("Cover upload error:", error);
            set.status = 500;
            return { message: "เกิดข้อผิดพลาดในการอัพโหลด" };
        }
    }, {
        body: t.Object({
            image: t.Object({
                buffer: t.String(),
                filename: t.String(),
                mimetype: t.String()
            })
        })
    });

// =============================================
// Combined export
// =============================================
export const sellerProfileRoutes = new Elysia()
    .use(publicSellerRoutes)
    .use(protectedSellerRoutes);
