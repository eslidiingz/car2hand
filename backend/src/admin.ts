/**
 * Admin Routes
 * Separate from User routes to ensure complete data isolation
 */

import { Elysia, t } from "elysia";
import prisma from "./db";
import { jwtPlugin, generateAccessToken, authGuard } from "./jwt";
import { adminLoginSchema, validateInput } from "./validation";
import { authRateLimiter } from "./security";
import { getUserPackage, getListingExpiryDate } from "./config/packages";
import { testLineConnection } from "./line";

export const adminRoutes = new Elysia({ prefix: "/admin" })
    .use(jwtPlugin())
    .use(authRateLimiter)

    // Admin Login
    .post("/login", async ({ body, set, jwt }) => {
        try {
            // Validate input
            const validatedData = validateInput(adminLoginSchema, body);
            const { username, password, rememberMe } = validatedData;

            // Find admin by username
            const admin = await prisma.admin.findUnique({
                where: { username }
            });

            // timing attack prevention
            const dummyHash = await Bun.password.hash('dummy-password-for-timing');
            const passwordToVerify = admin?.password || dummyHash;

            const isPasswordValid = await Bun.password.verify(password, passwordToVerify);

            if (!admin || !isPasswordValid) {
                set.status = 401;
                return {
                    error: 'Authentication Failed',
                    message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
                };
            }

            // Generate JWT token
            const accessToken = await generateAccessToken(jwt.sign, admin.id, admin.username);

            return {
                message: "เข้าสู่ระบบ Admin สำเร็จ",
                admin: {
                    id: admin.id,
                    username: admin.username,
                    fullName: admin.fullName,
                    createdAt: admin.createdAt
                },
                accessToken,
                expiresIn: rememberMe ? '30d' : '7d'
            };
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'status' in error && (error as { status: number }).status === 400) {
                set.status = 400;
                return error;
            }

            console.error('Admin Login error:', error);
            set.status = 500;
            return {
                error: 'Server Error',
                message: "เกิดข้อผิดพลาดในระบบ"
            };
        }
    }, {
        body: t.Object({
            username: t.String(),
            password: t.String(),
            rememberMe: t.Optional(t.Boolean())
        })
    })

    // Category Management
    .group("/categories", (app) => app
        .derive(async ({ jwt, headers, set }) => {
            const authHeader = headers['authorization'];
            if (!authHeader?.startsWith('Bearer ')) {
                set.status = 401;
                return { authError: 'Unauthorized', message: 'กรุณาเข้าสู่ระบบ' };
            }

            const token = authHeader.slice(7).trim();
            const payload = await jwt.verify(token);

            if (!payload) {
                set.status = 401;
                return { authError: 'Invalid Token', message: 'Token ไม่ถูกต้องหรือหมดอายุ' };
            }

            return { adminId: (payload as any).userId };
        })
        .onBeforeHandle(({ adminId, set }) => {
            if (!adminId) {
                set.status = 401;
                return { error: 'Unauthorized', message: 'Token ไม่ถูกต้องหรือหมดอายุ' };
            }
        })
        .get("/", async () => {
            return await prisma.articleCategory.findMany({
                orderBy: { name: 'asc' }
            });
        })
        .post("/", async ({ body, set }) => {
            try {
                const { categorySchema, validateInput } = await import("./validation");
                const validatedData = validateInput(categorySchema, body);

                // Check if slug exists
                const existing = await prisma.articleCategory.findUnique({
                    where: { slug: validatedData.slug }
                });
                if (existing) {
                    set.status = 400;
                    return { error: 'Bad Request', message: 'Slug นี้ถูกใช้งานแล้ว' };
                }

                return await prisma.articleCategory.create({ data: validatedData });
            } catch (error: any) {
                if (error.status === 400) {
                    set.status = 400;
                    return error;
                }
                set.status = 500;
                return { error: 'Server Error', message: 'ไม่สามารถสร้างหมวดหมู่ได้' };
            }
        }, {
            body: t.Object({
                name: t.String(),
                slug: t.String()
            })
        })
        .patch("/:id", async ({ params: { id }, body, set }) => {
            try {
                const { categorySchema, validateInput } = await import("./validation");
                const validatedData = validateInput(categorySchema.partial(), body);

                if (validatedData.slug) {
                    const existing = await prisma.articleCategory.findFirst({
                        where: {
                            slug: validatedData.slug,
                            id: { not: id }
                        }
                    });
                    if (existing) {
                        set.status = 400;
                        return { error: 'Bad Request', message: 'Slug นี้ถูกใช้งานแล้ว' };
                    }
                }

                return await prisma.articleCategory.update({
                    where: { id },
                    data: validatedData
                });
            } catch (error: any) {
                if (error.status === 400) {
                    set.status = 400;
                    return error;
                }
                set.status = 500;
                return { error: 'Server Error', message: 'ไม่สามารถแก้ไขหมวดหมู่ได้' };
            }
        }, {
            body: t.Object({
                name: t.Optional(t.String()),
                slug: t.Optional(t.String())
            })
        })
        .delete("/:id", async ({ params: { id }, set }) => {
            try {
                const count = await prisma.article.count({ where: { categoryId: id } });
                if (count > 0) {
                    set.status = 400;
                    return { error: 'Bad Request', message: 'ไม่สามารถลบหมวดหมู่ที่มีบทความอยู่ได้' };
                }
                await prisma.articleCategory.delete({ where: { id } });
                return { message: 'ลบหมวดหมู่สำเร็จ' };
            } catch (error) {
                set.status = 500;
                return { error: 'Server Error', message: 'ไม่สามารถลบหมวดหมู่ได้' };
            }
        })
    )

    // Protected Admin Routes
    .group("/posts", (app) => app
        .derive(async ({ jwt, headers, set }) => {
            const authHeader = headers['authorization'];
            if (!authHeader?.startsWith('Bearer ')) {
                set.status = 401;
                return { authError: 'Unauthorized', message: 'กรุณาเข้าสู่ระบบ' };
            }

            const token = authHeader.slice(7).trim();
            const payload = await jwt.verify(token);

            if (!payload) {
                set.status = 401;
                return { authError: 'Invalid Token', message: 'Token ไม่ถูกต้องหรือหมดอายุ' };
            }

            return { adminId: (payload as any).userId };
        })
        .onBeforeHandle(({ adminId, set }) => {
            if (!adminId) {
                set.status = 401;
                return { error: 'Unauthorized', message: 'Token ไม่ถูกต้องหรือหมดอายุ' };
            }
        })

        // Upload image for post
        .post("/upload", async ({ body: { file }, set }) => {
            try {
                const { uploadArticleImage, isValidImageType, isValidFileSize } = await import("./storage");

                if (!file) {
                    set.status = 400;
                    return { error: 'Bad Request', message: 'กรุณาเลือกไฟล์ที่ต้องการอัพโหลด' };
                }

                if (!isValidImageType(file.type)) {
                    set.status = 400;
                    return { error: 'Bad Request', message: 'ประเภทไฟล์ไม่ถูกต้อง (รองรับเฉพาะ JPEG, PNG, WebP, GIF)' };
                }

                if (!isValidFileSize(file.size)) {
                    set.status = 400;
                    return { error: 'Bad Request', message: 'ขนาดไฟล์ใหญ่เกินไป (สูงสุด 10MB)' };
                }

                const buffer = Buffer.from(await file.arrayBuffer());
                const url = await uploadArticleImage({
                    buffer,
                    originalname: file.name,
                    mimetype: file.type
                });

                return { url };
            } catch (error) {
                console.error('Upload image error:', error);
                set.status = 500;
                return { error: 'Server Error', message: 'ไม่สามารถอัพโหลดรูปภาพได้' };
            }
        }, {
            body: t.Object({
                file: t.File()
            })
        })

        // Create new article
        .post("/", async ({ body, adminId, set }) => {
            try {
                const { articleSchema, validateInput } = await import("./validation");
                const { uploadArticleImage, isValidImageType, isValidFileSize } = await import("./storage");

                const b = body as any;
                let postData: any = {
                    title: b.title,
                    content: b.content,
                    excerpt: b.excerpt === "" ? null : b.excerpt,
                    categoryId: b.categoryId,
                    status: b.status,
                    featuredImage: b.featuredImage === "" ? null : b.featuredImage
                };

                const imageFile = b.imageFile;

                // Handle file upload if present
                if (b.tags !== undefined) {
                    // tags comes as JSON string from FormData
                    postData.tags = typeof b.tags === 'string' ? JSON.parse(b.tags) : (b.tags || []);
                }
                if (b.isFeatured !== undefined) {
                    postData.isFeatured = b.isFeatured === 'true' || b.isFeatured === true;
                }

                if (imageFile instanceof File) {
                    if (!isValidImageType(imageFile.type) || !isValidFileSize(imageFile.size)) {
                        set.status = 400;
                        return { error: 'Bad Request', message: 'ไฟล์รูปภาพไม่ถูกต้องหรือใหญ่เกินไป' };
                    }
                    const buffer = Buffer.from(await imageFile.arrayBuffer());
                    const url = await uploadArticleImage({
                        buffer,
                        originalname: imageFile.name,
                        mimetype: imageFile.type
                    });
                    postData.featuredImage = url;
                }

                // Validate cleaned data
                const validatedData = validateInput(articleSchema, postData);

                // Generate slug
                let slug = validatedData.title
                    .toLowerCase()
                    .replace(/[^a-z0-9\u0E00-\u0E7F]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');

                if (!slug) slug = 'article-' + Date.now();

                // Check slug uniqueness
                let finalSlug = slug;
                let counter = 1;
                while (await prisma.article.findUnique({ where: { slug: finalSlug } })) {
                    finalSlug = `${slug}-${counter}`;
                    counter++;
                }

                const post = await prisma.article.create({
                    data: {
                        ...validatedData,
                        slug: finalSlug,
                        authorId: adminId as string
                    }
                });

                return post;
            } catch (error: any) {
                if (error.status === 400) {
                    set.status = 400;
                    return error;
                }
                console.error('Create article error:', error);
                set.status = 500;
                return { error: 'Server Error', message: error.message || 'ไม่สามารถสร้างบทความได้' };
            }
        }, {
            body: t.Object({
                title: t.String(),
                content: t.String(),
                categoryId: t.String(),
                excerpt: t.Optional(t.String()),
                status: t.Optional(t.String()),
                featuredImage: t.Optional(t.String()),
                imageFile: t.Optional(t.File()),
                tags: t.Optional(t.Any()),
                isFeatured: t.Optional(t.Any()),
            })
        })

        // Get all posts
        .get("/", async ({ query }) => {
            const { page = '1', limit = '10' } = query;
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const take = parseInt(limit);

            const [posts, total] = await Promise.all([
                prisma.article.findMany({
                    skip,
                    take,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        category: {
                            select: { name: true }
                        },
                        author: {
                            select: { fullName: true }
                        }
                    }
                }),
                prisma.article.count()
            ]);

            return {
                posts,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / take)
                }
            };
        })

        // Get single post
        .get("/:id", async ({ params: { id }, set }) => {
            try {
                const post = await prisma.article.findUnique({
                    where: { id },
                    include: {
                        category: {
                            select: { name: true }
                        },
                        author: {
                            select: { fullName: true }
                        }
                    }
                });

                if (!post) {
                    set.status = 404;
                    return { error: 'Not Found', message: 'ไม่พบบทความ' };
                }

                return post;
            } catch (error) {
                set.status = 500;
                return { error: 'Server Error', message: 'เกิดข้อผิดพลาดในการดึงข้อมูลบทความ' };
            }
        })

        // Update article
        .patch("/:id", async ({ params: { id }, body, set }) => {
            try {
                const { articleSchema, validateInput } = await import("./validation");
                const { uploadArticleImage, isValidImageType, isValidFileSize } = await import("./storage");

                const existingPost = await prisma.article.findUnique({ where: { id } });
                if (!existingPost) {
                    set.status = 404;
                    return { error: 'Not Found', message: 'ไม่พบสื่อที่ต้องการแก้ไข' };
                }

                const b = body as any;
                let postData: any = {};
                if (b.title !== undefined) postData.title = b.title;
                if (b.content !== undefined) postData.content = b.content;
                if (b.categoryId !== undefined) postData.categoryId = b.categoryId;
                if (b.status !== undefined) postData.status = b.status;
                if (b.excerpt !== undefined) postData.excerpt = b.excerpt === "" ? null : b.excerpt;
                if (b.featuredImage !== undefined) postData.featuredImage = b.featuredImage === "" ? null : b.featuredImage;
                if (b.tags !== undefined) postData.tags = typeof b.tags === 'string' ? JSON.parse(b.tags) : (b.tags || []);
                if (b.isFeatured !== undefined) postData.isFeatured = b.isFeatured === 'true' || b.isFeatured === true;

                const imageFile = b.imageFile;

                // Handle file upload if present in multipart
                if (imageFile instanceof File) {
                    if (!isValidImageType(imageFile.type) || !isValidFileSize(imageFile.size)) {
                        set.status = 400;
                        return { error: 'Bad Request', message: 'ไฟล์รูปภาพไม่ถูกต้องหรือใหญ่เกินไป' };
                    }
                    const buffer = Buffer.from(await imageFile.arrayBuffer());
                    const url = await uploadArticleImage({
                        buffer,
                        originalname: imageFile.name,
                        mimetype: imageFile.type
                    });
                    postData.featuredImage = url;
                }

                const validatedData = validateInput(articleSchema.partial(), postData);
                let updateData: any = { ...validatedData };

                // If title changed, regenerate slug
                if (validatedData.title && validatedData.title !== existingPost.title) {
                    let slug = validatedData.title
                        .toLowerCase()
                        .replace(/[^a-z0-9\u0E00-\u0E7F]/g, '-')
                        .replace(/-+/g, '-')
                        .replace(/^-|-$/g, '');

                    let finalSlug = slug;
                    let counter = 1;
                    while (await prisma.article.findFirst({
                        where: {
                            slug: finalSlug,
                            id: { not: id }
                        }
                    })) {
                        finalSlug = `${slug}-${counter}`;
                        counter++;
                    }
                    updateData.slug = finalSlug;
                }

                const post = await prisma.article.update({
                    where: { id },
                    data: updateData
                });

                return post;
            } catch (error: any) {
                if (error.status === 400) {
                    set.status = 400;
                    return error;
                }
                console.error('Update article error:', error);
                set.status = 500;
                return { error: 'Server Error', message: error.message || 'ไม่สามารถแก้ไขบทความได้' };
            }
        }, {
            body: t.Object({
                title: t.Optional(t.String()),
                content: t.Optional(t.String()),
                categoryId: t.Optional(t.String()),
                excerpt: t.Optional(t.String()),
                status: t.Optional(t.String()),
                featuredImage: t.Optional(t.String()),
                imageFile: t.Optional(t.File()),
                tags: t.Optional(t.Any()),
                isFeatured: t.Optional(t.Any()),
            })
        })

        // Delete post
        .delete("/:id", async ({ params: { id }, set }) => {
            try {
                const article = await prisma.article.findUnique({
                    where: { id },
                    select: { featuredImage: true }
                });

                if (!article) {
                    set.status = 404;
                    return { error: 'Not Found', message: 'ไม่พบบทความที่ต้องการลบ' };
                }

                // Delete image from MinIO if it exists and is internal
                if (article.featuredImage) {
                    try {
                        const { deleteFile, BUCKET } = await import("./storage");

                        // Check if the URL points to our MinIO instance
                        const bucketStr = `/${BUCKET}/`;
                        if (article.featuredImage.includes(bucketStr)) {
                            const objectPath = article.featuredImage.split(bucketStr)[1];
                            if (objectPath) {
                                await deleteFile(objectPath);
                            }
                        }
                    } catch (storageError) {
                        console.error('Failed to delete article image from storage:', storageError);
                        // We continue with database deletion even if storage deletion fails
                    }
                }

                await prisma.article.delete({
                    where: { id }
                });

                return { message: "ลบบทความและรูปภาพเรียบร้อยแล้ว" };
            } catch (error) {
                console.error('Delete article error:', error);
                set.status = 500;
                return { error: 'Server Error', message: 'ไม่สามารถลบบทความได้' };
            }
        })
    )

    // =============================================
    // Listing Management - จัดการประกาศขาย
    // =============================================
    .group("/listings", (app) => app
        .derive(async ({ jwt, headers, set }) => {
            const authHeader = headers['authorization'];
            if (!authHeader?.startsWith('Bearer ')) {
                set.status = 401;
                return { authError: 'Unauthorized', message: 'กรุณาเข้าสู่ระบบ' };
            }

            const token = authHeader.slice(7).trim();
            const payload = await jwt.verify(token);

            if (!payload) {
                set.status = 401;
                return { authError: 'Invalid Token', message: 'Token ไม่ถูกต้องหรือหมดอายุ' };
            }

            return { adminId: (payload as any).userId };
        })
        .onBeforeHandle(({ adminId, set }) => {
            if (!adminId) {
                set.status = 401;
                return { error: 'Unauthorized', message: 'กรุณาเข้าสู่ระบบ' };
            }
        })

        // ดึงรายการประกาศทั้งหมด (filter by status, search, pagination)
        .get("/", async ({ query }) => {
            const { status, search, page = '1', limit = '20' } = query;
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const take = parseInt(limit);

            const where: any = {};
            if (status) where.status = status;
            if (search) {
                where.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { user: { fullName: { contains: search, mode: 'insensitive' } } },
                    { user: { email: { contains: search, mode: 'insensitive' } } },
                ];
            }

            const [listings, total] = await Promise.all([
                prisma.vehicleListing.findMany({
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
                                currentPackage: { select: { name: true, slug: true } }
                            }
                        },
                        images: { orderBy: { order: 'asc' } },
                    }
                }),
                prisma.vehicleListing.count({ where })
            ]);

            return {
                listings,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: take,
                    totalPages: Math.ceil(total / take)
                }
            };
        })

        // อนุมัติประกาศ
        .post("/:id/approve", async ({ params: { id }, set }) => {
            try {
                const listing = await prisma.vehicleListing.findUnique({
                    where: { id }
                });

                if (!listing) {
                    set.status = 404;
                    return { error: 'Not Found', message: 'ไม่พบประกาศนี้' };
                }

                if (listing.status !== 'PENDING') {
                    set.status = 400;
                    return { error: 'Bad Request', message: 'สามารถอนุมัติได้เฉพาะประกาศที่รอตรวจสอบเท่านั้น' };
                }

                // ดึง package ของ user เพื่อคำนวณวันหมดอายุตามแพ็กเกจ
                const userPkg = await getUserPackage(listing.userId);
                const expiredAt = getListingExpiryDate(userPkg.listingDurationDays);

                const updated = await prisma.vehicleListing.update({
                    where: { id },
                    data: {
                        status: 'ACTIVE',
                        publishedAt: new Date(),
                        expiredAt
                    }
                });

                return { message: 'อนุมัติประกาศสำเร็จ', listing: updated };
            } catch (error) {
                console.error('Approve listing error:', error);
                set.status = 500;
                return { error: 'Server Error', message: 'ไม่สามารถอนุมัติประกาศได้' };
            }
        })

        // ปฏิเสธประกาศ
        .post("/:id/reject", async ({ params: { id }, body, set }) => {
            try {
                const listing = await prisma.vehicleListing.findUnique({
                    where: { id }
                });

                if (!listing) {
                    set.status = 404;
                    return { error: 'Not Found', message: 'ไม่พบประกาศนี้' };
                }

                if (listing.status !== 'PENDING') {
                    set.status = 400;
                    return { error: 'Bad Request', message: 'สามารถปฏิเสธได้เฉพาะประกาศที่รอตรวจสอบเท่านั้น' };
                }

                const { reason } = body as { reason?: string };

                const updated = await prisma.vehicleListing.update({
                    where: { id },
                    data: {
                        status: 'SUSPENDED',
                        adminNote: reason || 'ประกาศไม่ผ่านการตรวจสอบ'
                    }
                });

                return { message: 'ปฏิเสธประกาศเรียบร้อย', listing: updated };
            } catch (error) {
                console.error('Reject listing error:', error);
                set.status = 500;
                return { error: 'Server Error', message: 'ไม่สามารถปฏิเสธประกาศได้' };
            }
        })

        // ดึงรายการต่ออายุรออนุมัติ
        .get("/renewals", async ({ query }) => {
            const { status = 'PENDING', page = '1', limit = '20' } = query;
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const take = parseInt(limit);

            const where: any = {};
            if (status) where.status = status;

            const [renewals, total] = await Promise.all([
                prisma.listingRenewal.findMany({
                    where,
                    skip,
                    take,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: { select: { id: true, fullName: true, email: true } },
                        listing: { select: { id: true, title: true, brand: true, model: true, year: true } }
                    }
                }),
                prisma.listingRenewal.count({ where })
            ]);

            return {
                renewals,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: take,
                    totalPages: Math.ceil(total / take)
                }
            };
        })

        // อนุมัติต่ออายุ
        .post("/renewals/:id/approve", async ({ params: { id }, set }) => {
            try {
                const renewal = await prisma.listingRenewal.findUnique({
                    where: { id },
                    include: { listing: true }
                });

                if (!renewal) {
                    set.status = 404;
                    return { error: 'Not Found', message: 'ไม่พบรายการต่ออายุนี้' };
                }

                if (renewal.status !== 'PENDING') {
                    set.status = 400;
                    return { error: 'Bad Request', message: 'รายการนี้ถูกดำเนินการแล้ว' };
                }

                // ต่ออายุ 30 วัน (Basic package)
                const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                await prisma.$transaction([
                    prisma.listingRenewal.update({
                        where: { id },
                        data: { status: 'APPROVED', reviewedAt: new Date() }
                    }),
                    prisma.vehicleListing.update({
                        where: { id: renewal.listingId },
                        data: { status: 'ACTIVE', publishedAt: new Date(), expiredAt: newExpiry }
                    })
                ]);

                return { message: 'อนุมัติต่ออายุประกาศสำเร็จ' };
            } catch (error) {
                console.error('Approve renewal error:', error);
                set.status = 500;
                return { error: 'Server Error', message: 'ไม่สามารถอนุมัติได้' };
            }
        })

        // ปฏิเสธต่ออายุ
        .post("/renewals/:id/reject", async ({ params: { id }, body, set }) => {
            try {
                const renewal = await prisma.listingRenewal.findUnique({
                    where: { id }
                });

                if (!renewal) {
                    set.status = 404;
                    return { error: 'Not Found', message: 'ไม่พบรายการต่ออายุนี้' };
                }

                if (renewal.status !== 'PENDING') {
                    set.status = 400;
                    return { error: 'Bad Request', message: 'รายการนี้ถูกดำเนินการแล้ว' };
                }

                await prisma.listingRenewal.update({
                    where: { id },
                    data: {
                        status: 'REJECTED',
                        adminNote: (body as any)?.reason || null,
                        reviewedAt: new Date()
                    }
                });

                return { message: 'ปฏิเสธการต่ออายุเรียบร้อย' };
            } catch (error) {
                console.error('Reject renewal error:', error);
                set.status = 500;
                return { error: 'Server Error', message: 'ไม่สามารถปฏิเสธได้' };
            }
        })

        // Toggle featured
        .put("/:id/featured", async ({ params: { id }, set }) => {
            try {
                const listing = await prisma.vehicleListing.findUnique({ where: { id } });
                if (!listing) { set.status = 404; return { error: 'ไม่พบประกาศ' }; }
                const updated = await prisma.vehicleListing.update({
                    where: { id },
                    data: { isFeatured: !listing.isFeatured }
                });
                return { message: updated.isFeatured ? 'ตั้งเป็นประกาศแนะนำแล้ว' : 'ยกเลิกประกาศแนะนำแล้ว', listing: updated };
            } catch (error) {
                set.status = 500;
                return { error: 'Server Error' };
            }
        })

        // Toggle premium
        .put("/:id/premium", async ({ params: { id }, set }) => {
            try {
                const listing = await prisma.vehicleListing.findUnique({ where: { id } });
                if (!listing) { set.status = 404; return { error: 'ไม่พบประกาศ' }; }
                const updated = await prisma.vehicleListing.update({
                    where: { id },
                    data: { isPremium: !listing.isPremium }
                });
                return { message: updated.isPremium ? 'ตั้งเป็นประกาศพรีเมียมแล้ว' : 'ยกเลิกประกาศพรีเมียมแล้ว', listing: updated };
            } catch (error) {
                set.status = 500;
                return { error: 'Server Error' };
            }
        })
    )

    // User Management
    .group("/users", (app) => app
        .derive(async ({ jwt, headers, set }) => {
            const authHeader = headers['authorization'];
            if (!authHeader?.startsWith('Bearer ')) {
                set.status = 401;
                return { authError: 'Unauthorized', message: 'กรุณาเข้าสู่ระบบ' };
            }

            const token = authHeader.slice(7).trim();
            const payload = await jwt.verify(token);

            if (!payload) {
                set.status = 401;
                return { authError: 'Invalid Token', message: 'Token ไม่ถูกต้องหรือหมดอายุ' };
            }

            return { adminId: (payload as any).userId };
        })
        .onBeforeHandle(({ adminId, set }) => {
            if (!adminId) {
                set.status = 401;
                return { error: 'Unauthorized', message: 'กรุณาเข้าสู่ระบบ' };
            }
        })

        .get("/", async ({ query }) => {
            const { search, page = '1', limit = '20' } = query;
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const take = parseInt(limit);

            const where: any = {};
            if (search) {
                where.OR = [
                    { fullName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { phoneNumber: { contains: search } },
                ];
            }

            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where,
                    skip,
                    take,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phoneNumber: true,
                        isActive: true,
                        createdAt: true,
                        currentPackage: { select: { name: true, slug: true } },
                        _count: { select: { listings: true } },
                    }
                }),
                prisma.user.count({ where })
            ]);

            return {
                users,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: take,
                    totalPages: Math.ceil(total / take)
                }
            };
        })

        .get("/:id", async ({ params: { id }, set }) => {
            try {
                const user = await prisma.user.findUnique({
                    where: { id },
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phoneNumber: true,
                        isActive: true,
                        createdAt: true,
                        currentPackage: { select: { name: true, slug: true } },
                        _count: { select: { listings: true } },
                    }
                });
                if (!user) {
                    set.status = 404;
                    return { error: 'Not Found', message: 'ไม่พบผู้ใช้งาน' };
                }
                return user;
            } catch (error) {
                set.status = 500;
                return { error: 'Server Error', message: 'ไม่สามารถดึงข้อมูลผู้ใช้งานได้' };
            }
        })

        .put("/:id/toggle-status", async ({ params: { id }, set }) => {
            try {
                const user = await prisma.user.findUnique({ where: { id } });
                if (!user) {
                    set.status = 404;
                    return { error: 'Not Found', message: 'ไม่พบผู้ใช้งาน' };
                }
                const updated = await prisma.user.update({
                    where: { id },
                    data: { isActive: !user.isActive },
                    select: { id: true, isActive: true }
                });
                return { message: updated.isActive ? 'เปิดการใช้งานแล้ว' : 'ปิดการใช้งานแล้ว', user: updated };
            } catch (error) {
                set.status = 500;
                return { error: 'Server Error', message: 'ไม่สามารถเปลี่ยนสถานะได้' };
            }
        })
    )

    // Package Management (CRUD + Transactions)
    .group("/packages", (app) => app
        .derive(async ({ jwt, headers, set }) => {
            const authHeader = headers['authorization'];
            if (!authHeader?.startsWith('Bearer ')) {
                set.status = 401;
                return { authError: 'Unauthorized', message: 'กรุณาเข้าสู่ระบบ' };
            }

            const token = authHeader.slice(7).trim();
            const payload = await jwt.verify(token);

            if (!payload) {
                set.status = 401;
                return { authError: 'Invalid Token', message: 'Token ไม่ถูกต้องหรือหมดอายุ' };
            }

            return { adminId: (payload as any).userId };
        })
        .onBeforeHandle(({ adminId, set }) => {
            if (!adminId) {
                set.status = 401;
                return { error: 'Unauthorized', message: 'Token ไม่ถูกต้องหรือหมดอายุ' };
            }
        })

        // =============================================
        // Package CRUD - จัดการ Master Data แพ็กเกจ
        // =============================================

        // ดึงรายการแพ็กเกจทั้งหมด (รวม inactive)
        .get("/", async () => {
            const packages = await prisma.package.findMany({
                orderBy: { sortOrder: 'asc' },
                include: {
                    _count: { select: { users: true, transactions: true } }
                }
            });
            return { packages };
        })

        // สร้างแพ็กเกจใหม่
        .post("/", async ({ body, set }) => {
            try {
                const pkg = await prisma.package.create({
                    data: {
                        name: body.name,
                        nameTh: body.nameTh,
                        slug: body.slug,
                        description: body.description,
                        targetAudience: body.targetAudience,
                        price: body.price,
                        maxListings: body.maxListings,
                        maxPhotosPerListing: body.maxPhotosPerListing,
                        listingDurationDays: body.listingDurationDays,
                        autoBumpPerDay: body.autoBumpPerDay ?? 0,
                        badge: body.badge,
                        searchPriority: body.searchPriority ?? 'normal',
                        features: body.features ?? [],
                        sortOrder: body.sortOrder ?? 0,
                        isActive: body.isActive ?? true,
                    }
                });
                return { message: 'สร้างแพ็กเกจสำเร็จ', package: pkg };
            } catch (error: any) {
                if (error?.code === 'P2002') {
                    set.status = 400;
                    return { error: 'Duplicate', message: 'ชื่อหรือ slug ซ้ำกับแพ็กเกจที่มีอยู่แล้ว' };
                }
                console.error('Create package error:', error);
                set.status = 500;
                return { error: 'Server Error', message: 'ไม่สามารถสร้างแพ็กเกจได้' };
            }
        }, {
            body: t.Object({
                name: t.String(),
                nameTh: t.String(),
                slug: t.String(),
                description: t.Optional(t.String()),
                targetAudience: t.Optional(t.String()),
                price: t.Number(),
                maxListings: t.Number(),
                maxPhotosPerListing: t.Number(),
                listingDurationDays: t.Number(),
                autoBumpPerDay: t.Optional(t.Number()),
                badge: t.Optional(t.String()),
                searchPriority: t.Optional(t.String()),
                features: t.Optional(t.Array(t.String())),
                sortOrder: t.Optional(t.Number()),
                isActive: t.Optional(t.Boolean()),
            })
        })

        // อัพเดทแพ็กเกจ
        .put("/:id", async ({ params: { id }, body, set }) => {
            try {
                const pkg = await prisma.package.update({
                    where: { id },
                    data: {
                        name: body.name,
                        nameTh: body.nameTh,
                        slug: body.slug,
                        description: body.description,
                        targetAudience: body.targetAudience,
                        price: body.price,
                        maxListings: body.maxListings,
                        maxPhotosPerListing: body.maxPhotosPerListing,
                        listingDurationDays: body.listingDurationDays,
                        autoBumpPerDay: body.autoBumpPerDay,
                        manualBumpPerDay: body.manualBumpPerDay,
                        badge: body.badge,
                        searchPriority: body.searchPriority,
                        features: body.features,
                        sortOrder: body.sortOrder,
                        isActive: body.isActive,
                    }
                });
                return { message: 'อัพเดทแพ็กเกจสำเร็จ', package: pkg };
            } catch (error: any) {
                if (error?.code === 'P2025') {
                    set.status = 404;
                    return { error: 'Not Found', message: 'ไม่พบแพ็กเกจ' };
                }
                console.error('Update package error:', error);
                set.status = 500;
                return { error: 'Server Error', message: 'ไม่สามารถอัพเดทแพ็กเกจได้' };
            }
        }, {
            body: t.Object({
                name: t.Optional(t.String()),
                nameTh: t.Optional(t.String()),
                slug: t.Optional(t.String()),
                description: t.Optional(t.Nullable(t.String())),
                targetAudience: t.Optional(t.Nullable(t.String())),
                price: t.Optional(t.Number()),
                maxListings: t.Optional(t.Number()),
                maxPhotosPerListing: t.Optional(t.Number()),
                listingDurationDays: t.Optional(t.Number()),
                autoBumpPerDay: t.Optional(t.Number()),
                manualBumpPerDay: t.Optional(t.Number()),
                badge: t.Optional(t.Nullable(t.String())),
                searchPriority: t.Optional(t.String()),
                features: t.Optional(t.Array(t.String())),
                sortOrder: t.Optional(t.Number()),
                isActive: t.Optional(t.Boolean()),
            })
        })

        // ลบแพ็กเกจ (soft delete = set isActive = false)
        .delete("/:id", async ({ params: { id }, set }) => {
            try {
                // ตรวจสอบว่ามี user ที่ใช้ package นี้อยู่ไหม
                const usersCount = await prisma.user.count({
                    where: { currentPackageId: id }
                });

                if (usersCount > 0) {
                    // Soft delete เท่านั้น เพราะยังมี user อยู่
                    await prisma.package.update({
                        where: { id },
                        data: { isActive: false }
                    });
                    return { message: `ปิดการใช้งานแพ็กเกจสำเร็จ (มีผู้ใช้งาน ${usersCount} คน จึงไม่สามารถลบถาวรได้)` };
                }

                await prisma.package.delete({ where: { id } });
                return { message: 'ลบแพ็กเกจสำเร็จ' };
            } catch (error: any) {
                if (error?.code === 'P2025') {
                    set.status = 404;
                    return { error: 'Not Found', message: 'ไม่พบแพ็กเกจ' };
                }
                console.error('Delete package error:', error);
                set.status = 500;
                return { error: 'Server Error', message: 'ไม่สามารถลบแพ็กเกจได้' };
            }
        })

        // =============================================
        // Transaction Management - จัดการคำขออัพเกรด
        // =============================================

        // ดึงรายการ transaction ทั้งหมด (filter by status)
        .get("/transactions", async ({ query }) => {
            const { status, page = '1', limit = '20' } = query;
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const take = parseInt(limit);

            const where: any = {};
            if (status) where.status = status;

            const [transactions, total] = await Promise.all([
                prisma.packageTransaction.findMany({
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
                                currentPackageId: true,
                                currentPackage: {
                                    select: { name: true, slug: true }
                                }
                            }
                        },
                        package: {
                            select: { id: true, name: true, nameTh: true, slug: true, price: true, listingDurationDays: true }
                        }
                    }
                }),
                prisma.packageTransaction.count({ where })
            ]);

            return {
                transactions,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / take)
                }
            };
        })

        // อนุมัติรายการ
        .post("/transactions/:id/approve", async ({ params: { id }, set }) => {
            try {
                const transaction = await prisma.packageTransaction.findUnique({
                    where: { id },
                    include: { package: true }
                });

                if (!transaction) {
                    set.status = 404;
                    return { error: 'Not Found', message: 'ไม่พบรายการนี้' };
                }

                if (transaction.status !== 'PENDING') {
                    set.status = 400;
                    return { error: 'Bad Request', message: 'รายการนี้ถูกตรวจสอบแล้ว' };
                }

                // ดึงข้อมูล user ปัจจุบัน
                const currentUser = await prisma.user.findUnique({
                    where: { id: transaction.userId },
                    select: { packageExpiresAt: true, lineUserId: true }
                });

                // คำนวณ packageExpiresAt จากระยะเวลาของ package
                const durationDays = transaction.package.listingDurationDays;
                let packageExpiresAt: Date | null = null;
                if (durationDays !== -1) {
                    if ((transaction as any).transactionType === 'RENEWAL' && currentUser?.packageExpiresAt) {
                        // ต่ออายุ: เพิ่ม 30 วันจากวันหมดอายุเดิม
                        packageExpiresAt = new Date(currentUser.packageExpiresAt.getTime() + 30 * 24 * 60 * 60 * 1000);
                    } else {
                        // อัพเกรด: เริ่มนับ 30 วันใหม่
                        packageExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                    }
                }

                // อัพเดท transaction + user package พร้อมกัน
                const [updatedTransaction] = await prisma.$transaction([
                    prisma.packageTransaction.update({
                        where: { id },
                        data: {
                            status: 'APPROVED',
                            reviewedAt: new Date()
                        }
                    }),
                    prisma.user.update({
                        where: { id: transaction.userId },
                        data: {
                            currentPackageId: transaction.packageId,
                            packageExpiresAt
                        }
                    })
                ]);

                // สร้าง notification แจ้งผู้ใช้
                await prisma.userNotification.create({
                    data: {
                        userId: transaction.userId,
                        title: 'แพ็กเกจได้รับการอนุมัติ',
                        message: `แพ็กเกจ ${transaction.package.name} ของคุณได้รับการอนุมัติแล้ว`,
                        type: 'PACKAGE_APPROVED',
                    }
                });

                // ส่ง LINE push notification
                if (currentUser?.lineUserId) {
                    try {
                        const { pushMessage, buildTextMessage } = await import("./line");
                        await pushMessage(currentUser.lineUserId, buildTextMessage(`แพ็กเกจ ${transaction.package.name} ของคุณได้รับการอนุมัติแล้ว`));
                    } catch {} // silent fail
                }

                return {
                    message: 'อนุมัติรายการสำเร็จ',
                    transaction: updatedTransaction
                };
            } catch (error) {
                console.error('Approve transaction error:', error);
                set.status = 500;
                return { error: 'Server Error', message: 'ไม่สามารถอนุมัติรายการได้' };
            }
        })

        // ปฏิเสธรายการ
        .post("/transactions/:id/reject", async ({ params: { id }, body, set }) => {
            try {
                const transaction = await prisma.packageTransaction.findUnique({
                    where: { id }
                });

                if (!transaction) {
                    set.status = 404;
                    return { error: 'Not Found', message: 'ไม่พบรายการนี้' };
                }

                if (transaction.status !== 'PENDING') {
                    set.status = 400;
                    return { error: 'Bad Request', message: 'รายการนี้ถูกตรวจสอบแล้ว' };
                }

                // ดึงข้อมูล package name สำหรับ notification
                const transactionWithPackage = await prisma.packageTransaction.findUnique({
                    where: { id },
                    include: { package: { select: { name: true } } }
                });

                const updatedTransaction = await prisma.packageTransaction.update({
                    where: { id },
                    data: {
                        status: 'REJECTED',
                        adminNote: (body as any).adminNote || null,
                        reviewedAt: new Date()
                    }
                });

                // สร้าง notification แจ้งผู้ใช้
                await prisma.userNotification.create({
                    data: {
                        userId: transaction.userId,
                        title: 'แพ็กเกจถูกปฏิเสธ',
                        message: `คำขอแพ็กเกจ ${transactionWithPackage?.package.name} ถูกปฏิเสธ${(body as any).adminNote ? ': ' + (body as any).adminNote : ''}`,
                        type: 'PACKAGE_REJECTED',
                    }
                });

                // ส่ง LINE push notification
                const rejectedUser = await prisma.user.findUnique({
                    where: { id: transaction.userId },
                    select: { lineUserId: true }
                });
                if (rejectedUser?.lineUserId) {
                    try {
                        const { pushMessage, buildTextMessage } = await import("./line");
                        await pushMessage(rejectedUser.lineUserId, buildTextMessage(`คำขอแพ็กเกจ ${transactionWithPackage?.package.name} ถูกปฏิเสธ${(body as any).adminNote ? ': ' + (body as any).adminNote : ''}`));
                    } catch {} // silent fail
                }

                return {
                    message: 'ปฏิเสธรายการเรียบร้อย',
                    transaction: updatedTransaction
                };
            } catch (error) {
                console.error('Reject transaction error:', error);
                set.status = 500;
                return { error: 'Server Error', message: 'ไม่สามารถปฏิเสธรายการได้' };
            }
        }, {
            body: t.Object({
                adminNote: t.Optional(t.String())
            })
        })
    )

    // =============================================
    // System Settings - ตั้งค่าระบบ
    // =============================================
    .group("/settings", (app) => app
        .derive(async ({ jwt, headers, set }) => {
            const authHeader = headers['authorization'];
            if (!authHeader?.startsWith('Bearer ')) {
                set.status = 401;
                return { authError: 'Unauthorized', message: 'กรุณาเข้าสู่ระบบ' };
            }

            const token = authHeader.slice(7).trim();
            const payload = await jwt.verify(token);

            if (!payload) {
                set.status = 401;
                return { authError: 'Invalid Token', message: 'Token ไม่ถูกต้องหรือหมดอายุ' };
            }

            return { adminId: (payload as any).userId };
        })
        .onBeforeHandle(({ adminId, set }) => {
            if (!adminId) {
                set.status = 401;
                return { error: 'Unauthorized', message: 'Token ไม่ถูกต้องหรือหมดอายุ' };
            }
        })

        // ดึงการตั้งค่าทั้งหมด (หรือตาม prefix)
        .get("/", async ({ query }) => {
            const { prefix } = query;
            const where: any = {};
            if (prefix) {
                where.key = { startsWith: prefix };
            }

            const settings = await prisma.systemSetting.findMany({ where });

            // Convert to object { key: value }
            const result: Record<string, string> = {};
            for (const s of settings) {
                result[s.key] = s.value;
            }
            return result;
        })

        // อัพเดทการตั้งค่า (batch upsert)
        .put("/", async ({ body, set }) => {
            try {
                const entries = body as Record<string, string>;
                const operations = Object.entries(entries).map(([key, value]) =>
                    prisma.systemSetting.upsert({
                        where: { key },
                        create: { key, value },
                        update: { value }
                    })
                );

                await prisma.$transaction(operations);
                return { message: 'บันทึกการตั้งค่าสำเร็จ' };
            } catch (error) {
                console.error('Update settings error:', error);
                set.status = 500;
                return { error: 'Server Error', message: 'ไม่สามารถบันทึกการตั้งค่าได้' };
            }
        })

        // อัพโหลด QR Code สำหรับการชำระเงิน
        .post("/upload-qr", async ({ body: { file }, set }) => {
            try {
                const { uploadFile, isValidImageType, isValidFileSize } = await import("./storage");

                if (!file) {
                    set.status = 400;
                    return { error: 'Bad Request', message: 'กรุณาเลือกไฟล์ QR Code' };
                }

                if (!isValidImageType(file.type)) {
                    set.status = 400;
                    return { error: 'Bad Request', message: 'ประเภทไฟล์ไม่ถูกต้อง (รองรับเฉพาะ JPEG, PNG, WebP)' };
                }

                if (!isValidFileSize(file.size)) {
                    set.status = 400;
                    return { error: 'Bad Request', message: 'ขนาดไฟล์ใหญ่เกินไป (สูงสุด 10MB)' };
                }

                const buffer = Buffer.from(await file.arrayBuffer());
                const ext = file.name.split('.').pop() || 'png';
                const filename = `settings/payment-qr-${Date.now()}.${ext}`;

                const url = await uploadFile(filename, buffer, file.type);

                // บันทึก URL ลง settings
                await prisma.systemSetting.upsert({
                    where: { key: 'payment.qrCodeImage' },
                    create: { key: 'payment.qrCodeImage', value: url },
                    update: { value: url }
                });

                return { url, message: 'อัพโหลด QR Code สำเร็จ' };
            } catch (error) {
                console.error('Upload QR code error:', error);
                set.status = 500;
                return { error: 'Server Error', message: 'ไม่สามารถอัพโหลด QR Code ได้' };
            }
        }, {
            body: t.Object({
                file: t.File()
            })
        })

        // ทดสอบ LINE Connection
        .post("/line/test", async ({ set }) => {
            const result = await testLineConnection();
            if (!result.success) { set.status = 400; }
            return result;
        })
    );

