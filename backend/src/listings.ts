import { Elysia, t } from "elysia";
import prisma from "./db";
import { uploadListingImages, deleteListingImages, deleteFile, isValidImageType, isValidFileSize, ensureBucket, uploadFile, processImage, generateFilename, buildListingImagePath, getPublicUrl } from "./storage";
import { getUserPackage, canCreateListing, canUploadPhotos, getListingExpiryDate } from "./config/packages";

// Ensure bucket exists on startup
ensureBucket().catch(console.error);

// Auto-expire: อัปเดตสถานะประกาศที่หมดอายุเป็น EXPIRED อัตโนมัติ
async function expireListings() {
    try {
        const result = await prisma.vehicleListing.updateMany({
            where: {
                status: 'ACTIVE',
                expiredAt: { lt: new Date() }
            },
            data: { status: 'EXPIRED' }
        });
        if (result.count > 0) {
            console.log(`[Auto-Expire] อัปเดต ${result.count} ประกาศเป็น EXPIRED`);
        }
    } catch (error) {
        console.error('[Auto-Expire] Error:', error);
    }
}

// เรียกตอน startup + ทุก 1 ชม.
expireListings();
setInterval(expireListings, 60 * 60 * 1000);

// Auto-bump: ดันโพสอัตโนมัติ ทยอยดันทีละคัน + สุ่มเวลา
const AUTO_BUMP_SCHEDULES: Record<string, string[]> = {
    standard: ['20:00'],
    professional: ['08:30', '12:30', '21:00'],
    premium: ['08:00', '11:30', '15:00', '19:00', '22:00'],
};

const processedBumpSlots = new Set<string>(); // ป้องกันดันซ้ำ "slug:slotIndex:date"

async function autoBumpListings() {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const today = now.toISOString().slice(0, 10); // YYYY-MM-DD

    for (const [slug, times] of Object.entries(AUTO_BUMP_SCHEDULES)) {
        if (!times.includes(currentTime)) continue;

        const slotIndex = times.indexOf(currentTime);
        const totalSlots = times.length;
        const slotKey = `${slug}:${slotIndex}:${today}`;

        // ป้องกันรันซ้ำ slot เดิมในวันเดียวกัน
        if (processedBumpSlots.has(slotKey)) continue;
        processedBumpSlots.add(slotKey);

        try {
            // หา ACTIVE listings ของ users ที่มี package นี้
            const listings = await prisma.vehicleListing.findMany({
                where: {
                    status: 'ACTIVE',
                    user: { currentPackage: { slug } },
                    OR: [
                        { expiredAt: null },
                        { expiredAt: { gt: new Date() } }
                    ]
                },
                select: { id: true, userId: true, autoBumpSlot: true },
                orderBy: { createdAt: 'asc' }
            });

            if (listings.length === 0) continue;

            // แบ่ง listings ตาม slot
            const slotListings = listings.filter((l, idx) => {
                if (l.autoBumpSlot !== null) return l.autoBumpSlot === slotIndex;
                // ถ้าไม่ได้กำหนด → กระจายตาม index
                return idx % totalSlots === slotIndex;
            });

            if (slotListings.length === 0) continue;

            // ทยอยดันทีละคัน สุ่ม delay 0-10 นาที (600,000 ms)
            for (const listing of slotListings) {
                const delayMs = Math.floor(Math.random() * 10 * 60 * 1000);
                setTimeout(async () => {
                    try {
                        const bumpTime = new Date();
                        await prisma.vehicleListing.update({
                            where: { id: listing.id },
                            data: { bumpedAt: bumpTime }
                        });
                        await prisma.listingBumpLog.create({
                            data: { listingId: listing.id, userId: listing.userId, type: 'AUTO' }
                        });
                    } catch (err) {
                        console.error(`[Auto-Bump] Error bumping ${listing.id}:`, err);
                    }
                }, delayMs);
            }

            console.log(`[Auto-Bump] จัดคิว ${slotListings.length}/${listings.length} ประกาศ (${slug} slot ${slotIndex + 1}/${totalSlots}) เวลา ${currentTime}`);
        } catch (error) {
            console.error(`[Auto-Bump] Error (${slug}):`, error);
        }
    }
}

// เรียกทุก 1 นาที
setInterval(autoBumpListings, 60 * 1000);

export const listingRoutes = new Elysia({ prefix: "/listings" })
    // สร้างประกาศขายใหม่
    .post("/", async ({ body, set }) => {
        const { userId, ...listingData } = body;

        // ตรวจสอบว่า user มีอยู่จริง
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            set.status = 401;
            return { message: "กรุณาเข้าสู่ระบบ" };
        }

        // ตรวจสอบ limit จำนวนประกาศตาม package
        const activeListings = await prisma.vehicleListing.count({
            where: {
                userId,
                status: { in: ['ACTIVE', 'DRAFT', 'PENDING'] }
            }
        });
        const userPkg = await getUserPackage(userId);
        if (!canCreateListing(userPkg.maxListings, activeListings)) {
            set.status = 403;
            return {
                message: `แพ็กเกจ ${userPkg.name} ลงประกาศได้สูงสุด ${userPkg.maxListings} รายการ กรุณาอัพเกรดแพ็กเกจเพื่อลงประกาศเพิ่มเติม`,
                upgradeRequired: true,
            };
        }


        try {
            const listing = await prisma.vehicleListing.create({
                data: {
                    userId,
                    vehicleType: listingData.vehicleType,
                    title: listingData.title,
                    description: listingData.description,
                    price: listingData.price,
                    brand: listingData.brand,
                    model: listingData.model,
                    subModel: listingData.subModel,
                    year: listingData.year,
                    color: listingData.color,
                    fuelType: listingData.fuelType,
                    transmission: listingData.transmission,
                    engineSize: listingData.engineSize,
                    seats: listingData.seats,
                    mileage: listingData.mileage,
                    bodyType: listingData.bodyType,
                    plateProvince: listingData.plateProvince,
                    registrationType: listingData.registrationType ?? "PERSONAL",
                    condition: listingData.condition,
                    hasAccident: listingData.hasAccident ?? false,
                    hasModified: listingData.hasModified ?? false,
                    hasWarranty: listingData.hasWarranty ?? false,
                    province: listingData.province,
                    district: listingData.district,
                    contactName: listingData.contactName,
                    contactPhone: listingData.contactPhone,
                    lineId: listingData.lineId,
                    facebookUrl: listingData.facebookUrl,
                    // Vehicle Extras
                    taxPaid: listingData.taxPaid ?? false,
                    registrationBookStatus: listingData.registrationBookStatus ?? "READY",
                    insuranceDetails: listingData.insuranceDetails,
                    warrantyDetails: listingData.warrantyDetails,
                    bsiDetails: listingData.bsiDetails,
                    gasType: listingData.gasType ?? "NONE",
                    hasSpareKey: listingData.hasSpareKey ?? false,
                    // serviceHistoryImage will be uploaded separately
                    status: "DRAFT", // เริ่มต้นเป็น draft
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            phoneNumber: true,
                        }
                    }
                }
            });

            return {
                message: "สร้างประกาศสำเร็จ",
                listing
            };
        } catch (error) {
            console.error(error);
            set.status = 500;
            return { message: "เกิดข้อผิดพลาดในการสร้างประกาศ" };
        }
    }, {
        body: t.Object({
            userId: t.String(),
            vehicleType: t.Union([t.Literal("CAR"), t.Literal("MOTORCYCLE")]),
            title: t.String(),
            description: t.Optional(t.String()),
            price: t.Number(),
            brand: t.String(),
            model: t.String(),
            subModel: t.Optional(t.String()),
            year: t.Number(),
            color: t.String(),
            fuelType: t.Union([
                t.Literal("PETROL"),
                t.Literal("DIESEL"),
                t.Literal("HYBRID"),
                t.Literal("PLUGIN_HYBRID"),
                t.Literal("EV"),
                t.Literal("LPG"),
                t.Literal("NGV")
            ]),
            transmission: t.Optional(t.Union([
                t.Literal("AUTOMATIC"),
                t.Literal("MANUAL"),
                t.Literal("CVT"),
                t.Literal("DCT"),
                t.Literal("SEMI_AUTO")
            ])),
            engineSize: t.Optional(t.Number()),
            seats: t.Optional(t.Number()),
            mileage: t.Number(),
            bodyType: t.Union([
                // รถยนต์
                t.Literal("SEDAN"),
                t.Literal("HATCHBACK"),
                t.Literal("SUV"),
                t.Literal("CROSSOVER"),
                t.Literal("MPV"),
                t.Literal("PICKUP"),
                t.Literal("COUPE"),
                t.Literal("CONVERTIBLE"),
                t.Literal("WAGON"),
                t.Literal("VAN"),
                // มอเตอร์ไซค์
                t.Literal("STANDARD"),
                t.Literal("SCOOTER"),
                t.Literal("SPORT"),
                t.Literal("NAKED"),
                t.Literal("CRUISER"),
                t.Literal("TOURING"),
                t.Literal("ADVENTURE"),
                t.Literal("DIRT"),
                t.Literal("CAFE_RACER"),
                t.Literal("UNDERBONE"),
                t.Literal("CUB")
            ]),
            plateProvince: t.Optional(t.String()),
            registrationType: t.Optional(t.Union([
                t.Literal("PERSONAL"),
                t.Literal("COMPANY")
            ])),
            condition: t.Union([
                t.Literal("EXCELLENT"),
                t.Literal("GOOD"),
                t.Literal("FAIR"),
                t.Literal("POOR")
            ]),
            hasAccident: t.Optional(t.Boolean()),
            hasModified: t.Optional(t.Boolean()),
            hasWarranty: t.Optional(t.Boolean()),
            province: t.String(),
            district: t.Optional(t.String()),
            contactName: t.Optional(t.String()),
            contactPhone: t.Optional(t.String()),
            lineId: t.Optional(t.String()),
            facebookUrl: t.Optional(t.String()),
            // Vehicle Extras
            taxPaid: t.Optional(t.Boolean()),
            registrationBookStatus: t.Optional(t.Union([
                t.Literal("READY"),
                t.Literal("FINANCED")
            ])),
            insuranceDetails: t.Optional(t.String()),
            warrantyDetails: t.Optional(t.String()),
            bsiDetails: t.Optional(t.String()),
            gasType: t.Optional(t.Union([
                t.Literal("NONE"),
                t.Literal("LPG"),
                t.Literal("NGV")
            ])),
            hasSpareKey: t.Optional(t.Boolean())
        })
    })

    // อัพโหลดรูปภาพสำหรับประกาศ
    .post("/:id/images", async ({ params, body, set }) => {
        const { id } = params;
        const { userId, images } = body;

        // ตรวจสอบ listing
        const listing = await prisma.vehicleListing.findUnique({
            where: { id }
        });

        if (!listing) {
            set.status = 404;
            return { message: "ไม่พบประกาศนี้" };
        }

        if (listing.userId !== userId) {
            set.status = 403;
            return { message: "คุณไม่มีสิทธิ์แก้ไขประกาศนี้" };
        }

        // ดึงรูปที่มีอยู่เดิม
        const existingImages = await prisma.vehicleImage.findMany({
            where: { listingId: id },
            orderBy: { order: 'asc' }
        });

        // ตรวจสอบจำนวนรูปตาม package limit
        const userPkgForPhotos = await getUserPackage(userId);
        if (!canUploadPhotos(userPkgForPhotos.maxPhotosPerListing, existingImages.length, images.length)) {
            set.status = 400;
            return {
                message: `แพ็กเกจ ${userPkgForPhotos.name} อัพโหลดได้สูงสุด ${userPkgForPhotos.maxPhotosPerListing} รูป/ประกาศ (ปัจจุบันมี ${existingImages.length} รูป)`,
                upgradeRequired: true,
            };
        }


        try {
            // อัพโหลดรูปไปยัง MinIO
            const uploadedImages = await uploadListingImages(
                userId,
                id,
                images.map((img: { buffer: string; filename: string; mimetype: string }) => ({
                    buffer: Buffer.from(img.buffer, 'base64'),
                    originalname: img.filename,
                    mimetype: img.mimetype
                }))
            );

            // คำนวณ order เริ่มต้น (ต่อจากรูปสุดท้าย)
            const startOrder = existingImages.length > 0
                ? Math.max(...existingImages.map(img => img.order)) + 1
                : 0;

            // ตรวจสอบว่ามีรูปหลักอยู่แล้วหรือไม่
            const hasPrimary = existingImages.some(img => img.isPrimary);

            // บันทึกข้อมูลรูปลง database
            await prisma.vehicleImage.createMany({
                data: uploadedImages.map((img, index) => ({
                    listingId: id,
                    url: img.url,
                    isPrimary: !hasPrimary && index === 0, // ถ้ายังไม่มีรูปหลัก ให้รูปแรกใหม่เป็นรูปหลัก
                    order: startOrder + index
                }))
            });

            // ดึงรูปทั้งหมดกลับมา
            const allImages = await prisma.vehicleImage.findMany({
                where: { listingId: id },
                orderBy: { order: 'asc' }
            });

            return {
                message: "อัพโหลดรูปภาพสำเร็จ",
                images: allImages
            };
        } catch (error) {
            console.error(error);
            set.status = 500;
            return { message: "เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ" };
        }
    }, {
        body: t.Object({
            userId: t.String(),
            images: t.Array(t.Object({
                buffer: t.String(), // base64 encoded
                filename: t.String(),
                mimetype: t.String()
            }))
        })
    })

    // อัพโหลดรูปประวัติบริการ
    .post("/:id/service-history", async ({ params, body, set }) => {
        const { id } = params;
        const { userId, image } = body;

        // ตรวจสอบ listing
        const listing = await prisma.vehicleListing.findUnique({
            where: { id }
        });

        if (!listing) {
            set.status = 404;
            return { message: "ไม่พบประกาศนี้" };
        }

        if (listing.userId !== userId) {
            set.status = 403;
            return { message: "คุณไม่มีสิทธิ์แก้ไขประกาศนี้" };
        }

        try {
            // Convert base64 to buffer
            const imageBuffer = Buffer.from(image.buffer, 'base64');

            // Process image to WebP
            const webpBuffer = await processImage(imageBuffer, {
                maxWidth: 1920,
                maxHeight: 1440,
                quality: 85
            });

            // Generate filename and path
            const baseFilename = generateFilename(image.filename);
            const webpFilename = baseFilename.replace(/\.[^.]+$/, '.webp');
            const objectPath = `${listing.userId}/listings/${id}/service-history-${webpFilename}`;

            // Upload to MinIO
            const imageUrl = await uploadFile(objectPath, webpBuffer, 'image/webp');

            // Update listing with service history image URL
            await prisma.vehicleListing.update({
                where: { id },
                data: { serviceHistoryImage: imageUrl }
            });

            return {
                message: "อัพโหลดรูปประวัติบริการสำเร็จ",
                imageUrl
            };
        } catch (error) {
            console.error(error);
            set.status = 500;
            return { message: "เกิดข้อผิดพลาดในการอัพโหลดรูป" };
        }
    }, {
        body: t.Object({
            userId: t.String(),
            image: t.Object({
                buffer: t.String(),
                filename: t.String(),
                mimetype: t.String()
            })
        })
    })

    // ลบรูปภาพเดี่ยว
    .delete("/:id/images/:imageId", async ({ params, query, set }) => {
        const { id, imageId } = params;
        const userId = query.userId;

        if (!userId) {
            set.status = 400;
            return { message: "กรุณาระบุ userId" };
        }

        // ตรวจสอบ listing
        const listing = await prisma.vehicleListing.findUnique({
            where: { id },
            include: { images: true }
        });

        if (!listing) {
            set.status = 404;
            return { message: "ไม่พบประกาศนี้" };
        }

        if (listing.userId !== userId) {
            set.status = 403;
            return { message: "คุณไม่มีสิทธิ์แก้ไขประกาศนี้" };
        }

        // หา image ที่ต้องการลบ
        const imageToDelete = listing.images.find(img => img.id === imageId);
        if (!imageToDelete) {
            set.status = 404;
            return { message: "ไม่พบรูปภาพนี้" };
        }

        try {
            // ลบจาก MinIO โดยดึง path จาก URL
            const url = new URL(imageToDelete.url);
            const objectPath = url.pathname.replace(/^\/car2hand\//, '');
            await deleteFile(objectPath);

            // ลบจาก database
            await prisma.vehicleImage.delete({
                where: { id: imageId }
            });

            // ถ้าเป็นรูปหลักและยังมีรูปอื่น ให้ตั้งรูปแรกเป็นหลักแทน
            if (imageToDelete.isPrimary && listing.images.length > 1) {
                const remainingImages = listing.images.filter(img => img.id !== imageId);
                if (remainingImages.length > 0) {
                    await prisma.vehicleImage.update({
                        where: { id: remainingImages[0].id },
                        data: { isPrimary: true }
                    });
                }
            }

            // ดึงรูปที่เหลือกลับมา
            const remainingImages = await prisma.vehicleImage.findMany({
                where: { listingId: id },
                orderBy: { order: 'asc' }
            });

            return {
                message: "ลบรูปภาพสำเร็จ",
                images: remainingImages
            };
        } catch (error) {
            console.error(error);
            set.status = 500;
            return { message: "เกิดข้อผิดพลาดในการลบรูปภาพ" };
        }
    })

    // เรียงลำดับรูปภาพใหม่
    .put("/:id/images/reorder", async ({ params, body, set }) => {
        const { id } = params;
        const { userId, imageIds } = body;

        // ตรวจสอบ listing
        const listing = await prisma.vehicleListing.findUnique({
            where: { id }
        });

        if (!listing) {
            set.status = 404;
            return { message: "ไม่พบประกาศนี้" };
        }

        if (listing.userId !== userId) {
            set.status = 403;
            return { message: "คุณไม่มีสิทธิ์แก้ไขประกาศนี้" };
        }

        try {
            // อัพเดท order และ isPrimary
            await Promise.all(imageIds.map((imageId: string, index: number) =>
                prisma.vehicleImage.update({
                    where: { id: imageId },
                    data: {
                        order: index,
                        isPrimary: index === 0
                    }
                })
            ));

            // ดึงรูปที่อัพเดทแล้วกลับมา
            const updatedImages = await prisma.vehicleImage.findMany({
                where: { listingId: id },
                orderBy: { order: 'asc' }
            });

            return {
                message: "เรียงลำดับรูปภาพสำเร็จ",
                images: updatedImages
            };
        } catch (error) {
            console.error(error);
            set.status = 500;
            return { message: "เกิดข้อผิดพลาดในการเรียงลำดับรูปภาพ" };
        }
    }, {
        body: t.Object({
            userId: t.String(),
            imageIds: t.Array(t.String())
        })
    })

    // ตั้งรูปหลัก
    .put("/:id/images/:imageId/primary", async ({ params, body, set }) => {
        const { id, imageId } = params;
        const { userId } = body;

        // ตรวจสอบ listing
        const listing = await prisma.vehicleListing.findUnique({
            where: { id },
            include: { images: true }
        });

        if (!listing) {
            set.status = 404;
            return { message: "ไม่พบประกาศนี้" };
        }

        if (listing.userId !== userId) {
            set.status = 403;
            return { message: "คุณไม่มีสิทธิ์แก้ไขประกาศนี้" };
        }

        // หา image ที่ต้องการตั้งเป็นหลัก
        const targetImage = listing.images.find(img => img.id === imageId);
        if (!targetImage) {
            set.status = 404;
            return { message: "ไม่พบรูปภาพนี้" };
        }

        try {
            // ยกเลิกรูปหลักเดิม
            await prisma.vehicleImage.updateMany({
                where: { listingId: id, isPrimary: true },
                data: { isPrimary: false }
            });

            // ตั้งรูปใหม่เป็นหลัก
            await prisma.vehicleImage.update({
                where: { id: imageId },
                data: { isPrimary: true, order: 0 }
            });

            // ดึงรูปที่อัพเดทแล้วกลับมา
            const updatedImages = await prisma.vehicleImage.findMany({
                where: { listingId: id },
                orderBy: { order: 'asc' }
            });

            return {
                message: "ตั้งรูปหลักสำเร็จ",
                images: updatedImages
            };
        } catch (error) {
            console.error(error);
            set.status = 500;
            return { message: "เกิดข้อผิดพลาดในการตั้งรูปหลัก" };
        }
    }, {
        body: t.Object({
            userId: t.String()
        })
    })

    // อัพเดทราคาและเผยแพร่ประกาศ
    .patch("/:id/publish", async ({ params, body, set }) => {
        const { id } = params;
        const { userId, price } = body;

        // ตรวจสอบ listing
        const listing = await prisma.vehicleListing.findUnique({
            where: { id },
            include: { images: true }
        });

        if (!listing) {
            set.status = 404;
            return { message: "ไม่พบประกาศนี้" };
        }

        if (listing.userId !== userId) {
            set.status = 403;
            return { message: "คุณไม่มีสิทธิ์แก้ไขประกาศนี้" };
        }

        // ตรวจสอบว่ามีรูปภาพหรือยัง
        if (listing.images.length === 0) {
            set.status = 400;
            return { message: "กรุณาอัพโหลดรูปภาพอย่างน้อย 1 รูป" };
        }

        try {
            // ตรวจสอบแพ็กเกจผู้ใช้ — Basic (Free) ต้องรอ admin อนุมัติ
            const userWithPkg = await prisma.user.findUnique({
                where: { id: userId },
                select: { currentPackage: { select: { slug: true, price: true, listingDurationDays: true } } }
            });

            const isBasicFree = !userWithPkg?.currentPackage
                || userWithPkg.currentPackage.slug === 'basic'
                || Number(userWithPkg.currentPackage.price) === 0;

            const newStatus = isBasicFree ? "PENDING" : "ACTIVE";
            const durationDays = userWithPkg?.currentPackage?.listingDurationDays ?? 30;

            const updatedListing = await prisma.vehicleListing.update({
                where: { id },
                data: {
                    price,
                    status: newStatus,
                    // ตั้ง publishedAt + expiredAt เฉพาะเมื่อ ACTIVE ทันที (แพ็กเกจที่ไม่ใช่ Basic)
                    ...(newStatus === "ACTIVE" ? {
                        publishedAt: new Date(),
                        expiredAt: getListingExpiryDate(durationDays)
                    } : {})
                },
                include: {
                    images: true,
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            phoneNumber: true,
                        }
                    }
                }
            });

            return {
                message: isBasicFree
                    ? "ส่งประกาศเพื่อรอการตรวจสอบจากผู้ดูแลระบบ"
                    : "เผยแพร่ประกาศสำเร็จ",
                listing: updatedListing,
                requiresApproval: isBasicFree
            };
        } catch (error) {
            console.error(error);
            set.status = 500;
            return { message: "เกิดข้อผิดพลาดในการเผยแพร่ประกาศ" };
        }
    }, {
        body: t.Object({
            userId: t.String(),
            price: t.Number()
        })
    })

    // อัพเดทข้อมูลประกาศ
    .put("/:id", async ({ params, body, set }) => {
        const { id } = params;
        const { userId, ...updateData } = body;

        // ตรวจสอบ listing
        const listing = await prisma.vehicleListing.findUnique({
            where: { id }
        });

        if (!listing) {
            set.status = 404;
            return { message: "ไม่พบประกาศนี้" };
        }

        if (listing.userId !== userId) {
            set.status = 403;
            return { message: "คุณไม่มีสิทธิ์แก้ไขประกาศนี้" };
        }

        try {
            const updatedListing = await prisma.vehicleListing.update({
                where: { id },
                data: {
                    vehicleType: updateData.vehicleType,
                    title: updateData.title,
                    description: updateData.description,
                    price: updateData.price,
                    brand: updateData.brand,
                    model: updateData.model,
                    subModel: updateData.subModel,
                    year: updateData.year,
                    color: updateData.color,
                    fuelType: updateData.fuelType,
                    transmission: updateData.transmission,
                    engineSize: updateData.engineSize,
                    seats: updateData.seats,
                    mileage: updateData.mileage,
                    bodyType: updateData.bodyType,
                    plateProvince: updateData.plateProvince,
                    registrationType: updateData.registrationType ?? "PERSONAL",
                    condition: updateData.condition,
                    hasAccident: updateData.hasAccident ?? false,
                    hasModified: updateData.hasModified ?? false,
                    hasWarranty: updateData.hasWarranty ?? false,
                    province: updateData.province,
                    district: updateData.district,
                    contactName: updateData.contactName,
                    contactPhone: updateData.contactPhone,
                    lineId: updateData.lineId,
                    facebookUrl: updateData.facebookUrl,
                    // Vehicle Extras
                    taxPaid: updateData.taxPaid ?? false,
                    registrationBookStatus: updateData.registrationBookStatus ?? "READY",
                    insuranceDetails: updateData.insuranceDetails,
                    warrantyDetails: updateData.warrantyDetails,
                    bsiDetails: updateData.bsiDetails,
                    gasType: updateData.gasType ?? "NONE",
                    hasSpareKey: updateData.hasSpareKey ?? false,
                },
                include: {
                    images: {
                        orderBy: { order: 'asc' }
                    },
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            phoneNumber: true,
                        }
                    }
                }
            });

            return {
                message: "อัพเดทประกาศสำเร็จ",
                listing: updatedListing
            };
        } catch (error) {
            console.error(error);
            set.status = 500;
            return { message: "เกิดข้อผิดพลาดในการอัพเดทประกาศ" };
        }
    }, {
        body: t.Object({
            userId: t.String(),
            vehicleType: t.Union([t.Literal("CAR"), t.Literal("MOTORCYCLE")]),
            title: t.String(),
            description: t.Optional(t.String()),
            price: t.Number(),
            brand: t.String(),
            model: t.String(),
            subModel: t.Optional(t.String()),
            year: t.Number(),
            color: t.String(),
            fuelType: t.Union([
                t.Literal("PETROL"),
                t.Literal("DIESEL"),
                t.Literal("HYBRID"),
                t.Literal("PLUGIN_HYBRID"),
                t.Literal("EV"),
                t.Literal("LPG"),
                t.Literal("NGV")
            ]),
            transmission: t.Optional(t.Union([
                t.Literal("AUTOMATIC"),
                t.Literal("MANUAL"),
                t.Literal("CVT"),
                t.Literal("DCT"),
                t.Literal("SEMI_AUTO")
            ])),
            engineSize: t.Optional(t.Number()),
            seats: t.Optional(t.Number()),
            mileage: t.Optional(t.Number()),
            bodyType: t.Optional(t.Union([
                t.Literal("SEDAN"),
                t.Literal("HATCHBACK"),
                t.Literal("SUV"),
                t.Literal("CROSSOVER"),
                t.Literal("MPV"),
                t.Literal("PICKUP"),
                t.Literal("COUPE"),
                t.Literal("CONVERTIBLE"),
                t.Literal("WAGON"),
                t.Literal("VAN"),
                t.Literal("STANDARD"),
                t.Literal("SCOOTER"),
                t.Literal("SPORT"),
                t.Literal("NAKED"),
                t.Literal("CRUISER"),
                t.Literal("TOURING"),
                t.Literal("ADVENTURE"),
                t.Literal("DIRT"),
                t.Literal("CAFE_RACER"),
                t.Literal("UNDERBONE"),
                t.Literal("CUB")
            ])),
            plateProvince: t.Optional(t.String()),
            registrationType: t.Optional(t.Union([
                t.Literal("PERSONAL"),
                t.Literal("COMPANY")
            ])),
            condition: t.Optional(t.Union([
                t.Literal("EXCELLENT"),
                t.Literal("GOOD"),
                t.Literal("FAIR"),
                t.Literal("POOR")
            ])),
            hasAccident: t.Optional(t.Boolean()),
            hasModified: t.Optional(t.Boolean()),
            hasWarranty: t.Optional(t.Boolean()),
            province: t.String(),
            district: t.Optional(t.String()),
            contactName: t.Optional(t.String()),
            contactPhone: t.Optional(t.String()),
            lineId: t.Optional(t.String()),
            facebookUrl: t.Optional(t.String()),
            // Vehicle Extras
            taxPaid: t.Optional(t.Boolean()),
            registrationBookStatus: t.Optional(t.Union([
                t.Literal("READY"),
                t.Literal("FINANCED")
            ])),
            insuranceDetails: t.Optional(t.String()),
            warrantyDetails: t.Optional(t.String()),
            bsiDetails: t.Optional(t.String()),
            gasType: t.Optional(t.Union([
                t.Literal("NONE"),
                t.Literal("LPG"),
                t.Literal("NGV")
            ])),
            hasSpareKey: t.Optional(t.Boolean())
        })
    })

    // ดึงประกาศตาม ID
    .get("/:id", async ({ params, query, set }) => {
        const { id } = params;
        const { viewerId } = query; // Optional: userId ของคนที่กำลังดู

        const listing = await prisma.vehicleListing.findUnique({
            where: { id },
            include: {
                images: {
                    orderBy: { order: 'asc' }
                },
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        phoneNumber: true,
                    }
                }
            }
        });

        if (!listing) {
            set.status = 404;
            return { message: "ไม่พบประกาศนี้" };
        }

        // เช็คว่าประกาศหมดอายุหรือไม่
        const isExpired = listing.status === 'EXPIRED'
            || (listing.expiredAt && new Date(listing.expiredAt) < new Date());

        // ถ้าหมดอายุและไม่ใช่เจ้าของ → return expired flag (ไม่แสดงข้อมูลรถ)
        if (isExpired && (!viewerId || viewerId !== listing.userId)) {
            return { listing: null, expired: true, message: "ประกาศนี้หมดอายุแล้ว" };
        }

        // เพิ่ม view count เฉพาะเมื่อคนดูไม่ใช่เจ้าของประกาศ และยังไม่หมดอายุ
        if (!isExpired && (!viewerId || viewerId !== listing.userId)) {
            await prisma.vehicleListing.update({
                where: { id },
                data: { viewCount: { increment: 1 } }
            });
        }

        return { listing, expired: isExpired };
    })

    // ดึงประกาศทั้งหมด (พร้อม filter)
    .get("/", async ({ query }) => {
        const {
            vehicleType,
            brand,
            minPrice,
            maxPrice,
            province,
            bodyType,
            fuelType,
            transmission,
            minEngineSize,
            maxEngineSize,
            q,
            status = "ACTIVE",
            page = "1",
            limit = "20"
        } = query as any;

        console.log('Backend received query:', query);

        const where: Record<string, any> = {
            status: status,
            // ซ่อนประกาศที่หมดอายุจากการค้นหา (เฉพาะ status ACTIVE)
            ...(status === "ACTIVE" ? {
                OR: [
                    { expiredAt: null },
                    { expiredAt: { gt: new Date() } }
                ]
            } : {})
        };

        if (vehicleType) where.vehicleType = vehicleType;

        if (bodyType) {
            const bodyList = Array.isArray(bodyType) ? bodyType : bodyType.toString().split(',');
            if (bodyList.length > 1) {
                where.bodyType = { in: bodyList };
            } else {
                where.bodyType = bodyList[0];
            }
        }

        if (fuelType) {
            const fuelList = Array.isArray(fuelType) ? fuelType : fuelType.toString().split(',');
            const orConditions: any[] = [];

            fuelList.forEach((fuel: string) => {
                const conditions: any[] = [{ fuelType: fuel }];
                // If filtering for LPG or NGV, also check the gasType field
                if (fuel === 'LPG' || fuel === 'NGV') {
                    conditions.push({ gasType: fuel });
                }
                orConditions.push(...conditions);
            });

            if (orConditions.length > 0) {
                where.OR = where.OR ? [...where.OR, ...orConditions] : orConditions;
            }
        }

        if (transmission) {
            const transList = Array.isArray(transmission) ? transmission : transmission.toString().split(',');
            const expandedTransList = [...transList];

            // If filtering for AUTOMATIC, also include CVT, DCT, and SEMI_AUTO
            if (transList.includes('AUTOMATIC')) {
                expandedTransList.push('CVT', 'DCT', 'SEMI_AUTO');
            }

            if (expandedTransList.length > 1) {
                where.transmission = { in: Array.from(new Set(expandedTransList)) };
            } else {
                where.transmission = expandedTransList[0];
            }
        }

        if (brand) {
            const brandList = Array.isArray(brand) ? brand : brand.toString().split(',');
            if (brandList.length > 1) {
                where.brand = { in: brandList };
            } else {
                where.brand = brandList[0];
            }
        }
        if (province) where.province = province;

        if (query.seats) {
            const seatCount = parseInt(query.seats.toString());
            if (!isNaN(seatCount)) {
                if (seatCount === 7) {
                    where.seats = { gte: 7 };
                } else {
                    where.seats = seatCount;
                }
            }
        }

        if (query.maxMileage) {
            const mileage = parseInt(query.maxMileage.toString());
            if (!isNaN(mileage)) {
                where.mileage = { lte: mileage };
            }
        }

        // Price filtering
        const minNum = minPrice ? parseFloat(minPrice.toString()) : null;
        const maxNum = maxPrice ? parseFloat(maxPrice.toString()) : null;

        if (minNum !== null || maxNum !== null) {
            where.price = {};
            if (minNum !== null && !isNaN(minNum)) where.price.gte = minNum;
            if (maxNum !== null && !isNaN(maxNum)) where.price.lte = maxNum;
        }

        // Year filtering
        const minYearNum = query.minYear ? parseInt(query.minYear.toString()) : null;
        const maxYearNum = query.maxYear ? parseInt(query.maxYear.toString()) : null;

        if (minYearNum !== null || maxYearNum !== null) {
            where.year = {};
            if (minYearNum !== null && !isNaN(minYearNum)) where.year.gte = minYearNum;
            if (maxYearNum !== null && !isNaN(maxYearNum)) where.year.lte = maxYearNum;
        }

        // Engine Size filtering
        const minEngineNum = minEngineSize ? parseInt(minEngineSize.toString()) : null;
        const maxEngineNum = maxEngineSize ? parseInt(maxEngineSize.toString()) : null;

        if (minEngineNum !== null || maxEngineNum !== null) {
            where.engineSize = {};
            if (minEngineNum !== null && !isNaN(minEngineNum)) where.engineSize.gte = minEngineNum;
            if (maxEngineNum !== null && !isNaN(maxEngineNum)) where.engineSize.lte = maxEngineNum;
        }

        if (q) {
            const searchTerm = q.toString();
            where.OR = [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { brand: { contains: searchTerm, mode: 'insensitive' } },
                { model: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Calculate brand stats based on other active filters (excluding the brand filter itself)
        const brandWhere = { ...where };
        delete brandWhere.brand;

        const [listings, total, brandStats] = await Promise.all([
            prisma.vehicleListing.findMany({
                where,
                include: {
                    images: {
                        where: { isPrimary: true },
                        take: 1
                    },
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                        }
                    }
                },
                orderBy: [
                    { bumpedAt: { sort: 'desc', nulls: 'last' } },
                    { createdAt: 'desc' }
                ],
                skip,
                take: parseInt(limit)
            }),
            prisma.vehicleListing.count({ where }),
            prisma.vehicleListing.groupBy({
                by: ['brand'],
                where: brandWhere,
                _count: {
                    brand: true
                }
            })
        ]);

        return {
            listings,
            brandStats: brandStats.reduce((acc: any, curr) => {
                acc[curr.brand] = curr._count.brand;
                return acc;
            }, {}),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        };
    })

    // ดึงประกาศของ user
    .get("/user/:userId", async ({ params, query }) => {
        const { userId } = params;
        const { status, page = "1", limit = "20" } = query;

        const where: Record<string, unknown> = { userId };
        if (status) where.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [listings, total] = await Promise.all([
            prisma.vehicleListing.findMany({
                where,
                include: {
                    images: {
                        where: { isPrimary: true },
                        take: 1
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.vehicleListing.count({ where })
        ]);

        return {
            listings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        };
    })

    // ลบประกาศ
    .delete("/:id", async ({ params, body, set }) => {
        const { id } = params;
        const { userId } = body;

        const listing = await prisma.vehicleListing.findUnique({
            where: { id }
        });

        if (!listing) {
            set.status = 404;
            return { message: "ไม่พบประกาศนี้" };
        }

        if (listing.userId !== userId) {
            set.status = 403;
            return { message: "คุณไม่มีสิทธิ์ลบประกาศนี้" };
        }

        try {
            // ลบรูปจาก MinIO
            await deleteListingImages(userId, id);

            // ลบจาก database (cascade จะลบ images ด้วย)
            await prisma.vehicleListing.delete({
                where: { id }
            });

            return { message: "ลบประกาศสำเร็จ" };
        } catch (error) {
            console.error(error);
            set.status = 500;
            return { message: "เกิดข้อผิดพลาดในการลบประกาศ" };
        }
    }, {
        body: t.Object({
            userId: t.String()
        })
    })

    // ต่ออายุ / รีประกาศ
    .post("/:id/renew", async ({ params, body, set }) => {
        const { id } = params;
        const { userId, paymentSlip } = body;

        // ตรวจสอบว่าเป็นเจ้าของ + สถานะ EXPIRED
        const listing = await prisma.vehicleListing.findFirst({
            where: { id, userId, status: 'EXPIRED' }
        });

        if (!listing) {
            set.status = 404;
            return { message: "ไม่พบประกาศที่หมดอายุ" };
        }

        const userPkg = await getUserPackage(userId);
        const isBasicFree = !userPkg.id || userPkg.name === 'Basic (Free)';

        if (isBasicFree) {
            // Basic user ต้องจ่าย 50 บาท เพื่อต่ออายุ
            if (!paymentSlip) {
                set.status = 400;
                return {
                    message: "ผู้ใช้แพ็กเกจ Basic ต้องชำระ 50 บาทเพื่อต่ออายุ หรือลบประกาศเดิมแล้วลงใหม่",
                    renewalPrice: 50,
                    renewalDays: 30,
                    requiresPayment: true,
                };
            }

            // ตรวจสอบว่ามี pending renewal อยู่แล้วไหม
            const existingRenewal = await prisma.listingRenewal.findFirst({
                where: { listingId: id, status: 'PENDING' }
            });
            if (existingRenewal) {
                set.status = 400;
                return { message: "มีคำขอต่ออายุรออนุมัติอยู่แล้ว" };
            }

            // สร้าง renewal record → admin ตรวจ → อนุมัติแล้วถึงต่ออายุ
            await prisma.listingRenewal.create({
                data: {
                    listingId: id,
                    userId,
                    amount: 50,
                    slipImage: paymentSlip,
                    status: 'PENDING',
                }
            });

            return {
                message: "ส่งคำขอต่ออายุประกาศแล้ว รอการตรวจสอบจาก admin",
                requiresApproval: true,
            };
        } else {
            // Paid package → repost ทันที
            const newExpiry = getListingExpiryDate(userPkg.listingDurationDays);
            await prisma.vehicleListing.update({
                where: { id },
                data: { status: 'ACTIVE', publishedAt: new Date(), expiredAt: newExpiry }
            });

            return {
                message: "รีประกาศสำเร็จ",
                listing: { status: 'ACTIVE', expiredAt: newExpiry },
            };
        }
    }, {
        body: t.Object({
            userId: t.String(),
            paymentSlip: t.Optional(t.String()),
        })
    })

    // ดันโพส (manual bump)
    .post("/:id/bump", async ({ params, body, set }) => {
        const { id } = params;
        const { userId } = body;

        // ตรวจสอบ listing
        const listing = await prisma.vehicleListing.findFirst({
            where: { id, userId, status: 'ACTIVE' }
        });

        if (!listing) {
            set.status = 404;
            return { message: "ไม่พบประกาศที่กำลังขาย" };
        }

        // ดึง user package → manualBumpPerDay
        const userPkg = await getUserPackage(userId);
        const manualLimit = (userPkg as any).manualBumpPerDay ?? 0;

        if (manualLimit <= 0) {
            set.status = 400;
            return { message: "แพ็กเกจของคุณไม่รองรับการดันโพส" };
        }

        // นับ manual bumps วันนี้ ต่อคัน (per-listing)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayBumps = await prisma.listingBumpLog.count({
            where: {
                listingId: id,
                type: 'MANUAL',
                createdAt: { gte: todayStart }
            }
        });

        if (todayBumps >= manualLimit) {
            set.status = 400;
            return {
                message: `ประกาศนี้ถูกดันโพสต์ครบ ${manualLimit} ครั้งแล้ววันนี้`,
                used: todayBumps,
                limit: manualLimit,
            };
        }

        // ดันโพส
        const now = new Date();
        await prisma.$transaction([
            prisma.vehicleListing.update({
                where: { id },
                data: { bumpedAt: now }
            }),
            prisma.listingBumpLog.create({
                data: { listingId: id, userId, type: 'MANUAL' }
            })
        ]);

        return {
            message: "ดันโพสสำเร็จ",
            bumpedAt: now,
            remaining: manualLimit - todayBumps - 1,
        };
    }, {
        body: t.Object({
            userId: t.String(),
        })
    })

    // กำหนด slot ดันโพสอัตโนมัติ
    // ดึงข้อมูล slots ของ user (จำนวนต่อ slot + ความจุ)
    .get("/bump-slots", async ({ query }) => {
        const { userId } = query;
        if (!userId) return { slots: [] };

        const userPkg = await getUserPackage(userId as string);
        const autoBump = (userPkg as any).autoBumpPerDay ?? 0;
        const maxListings = userPkg.maxListings;

        if (autoBump <= 0) return { slots: [], maxPerSlot: 0, autoBump: 0 };

        const maxPerSlot = Math.ceil(maxListings / autoBump);

        // ดึง package slug เพื่อหาตาราง slots
        const pkg = await prisma.package.findFirst({ where: { id: userPkg.id }, select: { slug: true } });
        const schedules = AUTO_BUMP_SCHEDULES[pkg?.slug || ''] || [];

        // นับ listing ในแต่ละ slot
        const slots = await Promise.all(
            schedules.map(async (time, idx) => {
                const count = await prisma.vehicleListing.count({
                    where: { userId: userId as string, autoBumpSlot: idx, status: 'ACTIVE' }
                });
                return { index: idx, time, count, maxPerSlot };
            })
        );

        // นับ listing ที่ไม่ได้กำหนด slot (null = ระบบจัดให้)
        const unassigned = await prisma.vehicleListing.count({
            where: { userId: userId as string, autoBumpSlot: null, status: 'ACTIVE' }
        });

        return { slots, maxPerSlot, autoBump, unassigned };
    })

    .put("/:id/bump-slot", async ({ params, body, set }) => {
        const { id } = params;
        const { userId, slot } = body as any;

        const listing = await prisma.vehicleListing.findFirst({
            where: { id, userId }
        });

        if (!listing) {
            set.status = 404;
            return { message: "ไม่พบประกาศ" };
        }

        // ดึง package เพื่อเช็คจำนวน slots และ maxListings
        const userPkg = await getUserPackage(userId);
        const autoBump = (userPkg as any).autoBumpPerDay ?? 0;
        const maxListings = userPkg.maxListings;

        if (autoBump <= 0) {
            set.status = 400;
            return { message: "แพ็กเกจของคุณไม่มีระบบดันโพสอัตโนมัติ" };
        }

        // ตรวจสอบว่า slot อยู่ในช่วงที่ถูกต้อง
        if (slot !== null && (slot < 0 || slot >= autoBump)) {
            set.status = 400;
            return { message: `slot ต้องอยู่ระหว่าง 0 ถึง ${autoBump - 1} หรือ null (ให้ระบบจัดให้)` };
        }

        // ตรวจสอบ slot capacity — จำกัดจำนวน listing ต่อ slot
        if (slot !== null) {
            const maxPerSlot = Math.ceil(maxListings / autoBump);

            // นับ listings ที่กำหนด slot นี้แล้ว (ไม่รวมตัวเอง)
            const currentSlotCount = await prisma.vehicleListing.count({
                where: {
                    userId,
                    autoBumpSlot: slot,
                    status: 'ACTIVE',
                    id: { not: id },
                }
            });

            if (currentSlotCount >= maxPerSlot) {
                const pkg = await prisma.package.findFirst({ where: { id: userPkg.id }, select: { slug: true } });
                const schedules = AUTO_BUMP_SCHEDULES[pkg?.slug || ''] || [];
                set.status = 400;
                return {
                    message: `Slot ${slot + 1} (${schedules[slot] || ''}) เต็มแล้ว (สูงสุด ${maxPerSlot} คัน/slot)`,
                    maxPerSlot,
                    currentCount: currentSlotCount,
                };
            }
        }

        await prisma.vehicleListing.update({
            where: { id },
            data: { autoBumpSlot: slot }
        });

        // หาเวลาของ slot + slot info
        const pkg = await prisma.package.findFirst({ where: { id: userPkg.id }, select: { slug: true } });
        const schedules = AUTO_BUMP_SCHEDULES[pkg?.slug || ''] || [];
        const slotTime = slot !== null && schedules[slot] ? schedules[slot] : 'ระบบจัดให้อัตโนมัติ';
        const maxPerSlot = Math.ceil(maxListings / autoBump);

        return {
            message: "กำหนด slot สำเร็จ",
            slot,
            scheduledTime: slotTime,
            maxPerSlot,
        };
    }, {
        body: t.Object({
            userId: t.String(),
            slot: t.Union([t.Number(), t.Null()]),
        })
    });
