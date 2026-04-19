/**
 * Admin seller profile routes — /admin/seller-profiles/*
 *
 * CRUD + verification workflow for shops / dealers.
 * Mirrors the auth pattern used in admin-kyc.ts / admin-moderation.ts.
 */

import { Elysia, t } from "elysia";
import prisma from "./db";
import { jwtPlugin } from "./jwt";
import { logAdminAction, diffFields } from "./admin-p1";

export const adminSellerProfileRoutes = new Elysia({ prefix: "/admin/seller-profiles" })
    .use(jwtPlugin())
    .derive(async ({ jwt, headers, set }) => {
        const authHeader = headers["authorization"];
        if (!authHeader?.startsWith("Bearer ")) {
            set.status = 401;
            return { authError: "Unauthorized" as const, adminId: null as string | null };
        }
        const token = authHeader.slice(7).trim();
        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = 401;
            return { authError: "Invalid Token" as const, adminId: null as string | null };
        }
        return { authError: null as string | null, adminId: (payload as { userId: string }).userId };
    })
    .onBeforeHandle(({ authError, set }) => {
        if (authError) {
            set.status = 401;
            return { error: 'Unauthorized', message: 'กรุณาเข้าสู่ระบบ Admin' };
        }
    })

    // List seller profiles (pagination + search + filter)
    .get("/", async ({ query }) => {
        const search = String(query.search || "").trim();
        const verificationLevel = String(query.verificationLevel || "").trim();
        const showroomType = String(query.showroomType || "").trim();
        const isVerifiedRaw = query.isVerified;
        const page = parseInt(String(query.page || "1"));
        const limit = Math.min(parseInt(String(query.limit || "20")), 100);
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {};
        if (verificationLevel && ["NONE", "ID", "BUSINESS", "DEALER"].includes(verificationLevel)) {
            where.verificationLevel = verificationLevel;
        }
        if (showroomType && ["INDIVIDUAL", "TENT", "DEALER"].includes(showroomType)) {
            where.showroomType = showroomType;
        }
        if (isVerifiedRaw !== undefined) {
            const v = String(isVerifiedRaw);
            if (v === "true") where.isVerified = true;
            else if (v === "false") where.isVerified = false;
        }
        if (search) {
            where.OR = [
                { shopName: { contains: search, mode: "insensitive" } },
                { user: { fullName: { contains: search, mode: "insensitive" } } },
                { user: { email: { contains: search, mode: "insensitive" } } },
            ];
        }

        const [sellers, total] = await Promise.all([
            prisma.sellerProfile.findMany({
                where: where as never,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            phoneNumber: true,
                            profileImage: true,
                            isActive: true,
                            createdAt: true,
                        }
                    },
                }
            }),
            prisma.sellerProfile.count({ where: where as never }),
        ]);

        return {
            sellers,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    })

    // Detail with user + listing count + total sold count
    .get("/:id", async ({ params, set }) => {
        const seller = await prisma.sellerProfile.findUnique({
            where: { id: params.id },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phoneNumber: true,
                        profileImage: true,
                        isActive: true,
                        createdAt: true,
                        currentPackage: { select: { name: true, nameTh: true, slug: true } },
                    }
                }
            }
        });
        if (!seller) {
            set.status = 404;
            return { error: 'Not Found', message: 'ไม่พบโปรไฟล์ผู้ขาย' };
        }

        const [listingCount, soldCount] = await Promise.all([
            prisma.vehicleListing.count({ where: { userId: seller.userId } }),
            prisma.vehicleListing.count({ where: { userId: seller.userId, status: 'SOLD' } }),
        ]);

        return {
            seller,
            stats: {
                listingCount,
                totalSoldCount: seller.totalSoldCount,
                soldListingCount: soldCount,
            }
        };
    })

    // Update seller profile
    .put("/:id", async ({ params, body, adminId, set }) => {
        try {
            const existing = await prisma.sellerProfile.findUnique({ where: { id: params.id } });
            if (!existing) {
                set.status = 404;
                return { error: 'Not Found', message: 'ไม่พบโปรไฟล์ผู้ขาย' };
            }

            const b = body as {
                shopName?: string;
                shopDescription?: string;
                shopAddress?: string;
                shopProvince?: string;
                shopDistrict?: string;
                shopPhone?: string;
                showroomType?: "INDIVIDUAL" | "TENT" | "DEALER";
                shopOpenHours?: string;
                socialFacebook?: string;
                socialLine?: string;
                socialInstagram?: string;
                specializations?: unknown;
                verificationLevel?: string;
            };

            const data: Record<string, unknown> = {};
            if (b.shopName !== undefined) data.shopName = b.shopName;
            if (b.shopDescription !== undefined) data.shopDescription = b.shopDescription;
            if (b.shopAddress !== undefined) data.shopAddress = b.shopAddress;
            if (b.shopProvince !== undefined) data.shopProvince = b.shopProvince;
            if (b.shopDistrict !== undefined) data.shopDistrict = b.shopDistrict;
            if (b.shopPhone !== undefined) data.shopPhone = b.shopPhone;
            if (b.showroomType !== undefined) data.showroomType = b.showroomType;
            if (b.shopOpenHours !== undefined) data.shopOpenHours = b.shopOpenHours;
            if (b.socialFacebook !== undefined) data.socialFacebook = b.socialFacebook;
            if (b.socialLine !== undefined) data.socialLine = b.socialLine;
            if (b.socialInstagram !== undefined) data.socialInstagram = b.socialInstagram;
            if (b.specializations !== undefined) data.specializations = b.specializations as never;
            if (b.verificationLevel !== undefined) {
                if (!["NONE", "ID", "BUSINESS", "DEALER"].includes(b.verificationLevel)) {
                    set.status = 400;
                    return { error: 'Validation', message: 'verificationLevel ไม่ถูกต้อง' };
                }
                data.verificationLevel = b.verificationLevel;
            }

            const updated = await prisma.sellerProfile.update({
                where: { id: params.id },
                data,
            });

            if (adminId) {
                await logAdminAction({
                    adminId,
                    action: 'SELLER_PROFILE_UPDATE',
                    targetType: 'SELLER_PROFILE',
                    targetId: params.id,
                    note: `แก้ไขโปรไฟล์ร้าน "${existing.shopName}"`,
                    metadata: { changes: diffFields(existing as unknown as Record<string, unknown>, data) },
                });
            }

            return { message: 'อัปเดตโปรไฟล์ผู้ขายสำเร็จ', seller: updated };
        } catch (error) {
            console.error('Update seller profile error:', error);
            set.status = 500;
            return { error: 'Server Error', message: 'ไม่สามารถอัปเดตโปรไฟล์ผู้ขายได้' };
        }
    }, {
        body: t.Object({
            shopName: t.Optional(t.String()),
            shopDescription: t.Optional(t.String()),
            shopAddress: t.Optional(t.String()),
            shopProvince: t.Optional(t.String()),
            shopDistrict: t.Optional(t.String()),
            shopPhone: t.Optional(t.String()),
            showroomType: t.Optional(t.Union([t.Literal('INDIVIDUAL'), t.Literal('TENT'), t.Literal('DEALER')])),
            shopOpenHours: t.Optional(t.String()),
            socialFacebook: t.Optional(t.String()),
            socialLine: t.Optional(t.String()),
            socialInstagram: t.Optional(t.String()),
            specializations: t.Optional(t.Any()),
            verificationLevel: t.Optional(t.String()),
        })
    })

    // Verify (manual — bypasses KYC flow)
    .post("/:id/verify", async ({ params, body, adminId, set }) => {
        try {
            const existing = await prisma.sellerProfile.findUnique({ where: { id: params.id } });
            if (!existing) {
                set.status = 404;
                return { error: 'Not Found', message: 'ไม่พบโปรไฟล์ผู้ขาย' };
            }

            const b = body as { verificationLevel?: "ID" | "BUSINESS" | "DEALER" };
            const level = b.verificationLevel && ["ID", "BUSINESS", "DEALER"].includes(b.verificationLevel)
                ? b.verificationLevel
                : (existing.verificationLevel && existing.verificationLevel !== "NONE"
                    ? existing.verificationLevel
                    : "ID");

            const updated = await prisma.sellerProfile.update({
                where: { id: params.id },
                data: {
                    isVerified: true,
                    verifiedAt: new Date(),
                    verificationLevel: level,
                }
            });

            if (adminId) {
                await logAdminAction({
                    adminId,
                    action: 'SELLER_PROFILE_VERIFY',
                    targetType: 'SELLER_PROFILE',
                    targetId: params.id,
                    note: `ยืนยันร้าน "${existing.shopName}" ระดับ ${level}`,
                    metadata: { verificationLevel: level },
                });
            }

            return { message: 'ยืนยันผู้ขายเรียบร้อย', seller: updated };
        } catch (error) {
            console.error('Verify seller profile error:', error);
            set.status = 500;
            return { error: 'Server Error', message: 'ไม่สามารถยืนยันผู้ขายได้' };
        }
    }, {
        body: t.Object({
            verificationLevel: t.Optional(t.Union([t.Literal('ID'), t.Literal('BUSINESS'), t.Literal('DEALER')])),
        })
    })

    // Unverify
    .post("/:id/unverify", async ({ params, adminId, set }) => {
        try {
            const existing = await prisma.sellerProfile.findUnique({ where: { id: params.id } });
            if (!existing) {
                set.status = 404;
                return { error: 'Not Found', message: 'ไม่พบโปรไฟล์ผู้ขาย' };
            }

            const updated = await prisma.sellerProfile.update({
                where: { id: params.id },
                data: {
                    isVerified: false,
                    verifiedAt: null,
                    verificationLevel: "NONE",
                }
            });

            if (adminId) {
                await logAdminAction({
                    adminId,
                    action: 'SELLER_PROFILE_UNVERIFY',
                    targetType: 'SELLER_PROFILE',
                    targetId: params.id,
                    note: `ยกเลิกการยืนยันร้าน "${existing.shopName}"`,
                });
            }

            return { message: 'ยกเลิกการยืนยันเรียบร้อย', seller: updated };
        } catch (error) {
            console.error('Unverify seller profile error:', error);
            set.status = 500;
            return { error: 'Server Error', message: 'ไม่สามารถยกเลิกการยืนยันได้' };
        }
    });
