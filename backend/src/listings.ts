import { Elysia, t } from "elysia";
import prisma from "./db";
import { uploadListingImages, deleteListingImages, deleteFile, isValidImageType, isValidFileSize, ensureBucket, uploadFile, processImage, generateFilename, buildListingImagePath, getPublicUrl } from "./storage";

// Ensure bucket exists on startup
ensureBucket().catch(console.error);

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
                    ownerCount: listingData.ownerCount ?? 1,
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
            ownerCount: t.Optional(t.Number()),
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

        // ตรวจสอบจำนวนรูป
        if (existingImages.length + images.length > 24) {
            set.status = 400;
            return { message: `สามารถอัพโหลดได้สูงสุด 24 รูป (ปัจจุบันมี ${existingImages.length} รูป)` };
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
            const updatedListing = await prisma.vehicleListing.update({
                where: { id },
                data: {
                    price,
                    status: "ACTIVE",
                    expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 วัน
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
                message: "เผยแพร่ประกาศสำเร็จ",
                listing: updatedListing
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
                    ownerCount: updateData.ownerCount ?? 1,
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
            ownerCount: t.Optional(t.Number()),
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

        // เพิ่ม view count เฉพาะเมื่อคนดูไม่ใช่เจ้าของประกาศ
        if (!viewerId || viewerId !== listing.userId) {
            await prisma.vehicleListing.update({
                where: { id },
                data: { viewCount: { increment: 1 } }
            });
        }

        return { listing };
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
            status: status
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
                orderBy: { createdAt: 'desc' },
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
    });
