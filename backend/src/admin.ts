/**
 * Admin Routes
 * Separate from User routes to ensure complete data isolation
 */

import { Elysia, t } from "elysia";
import prisma from "./db";
import { jwtPlugin, generateAccessToken, authGuard } from "./jwt";
import { adminLoginSchema, validateInput } from "./validation";
import { authRateLimiter } from "./security";

export const adminRoutes = new Elysia({ prefix: "/admin" })
    .use(jwtPlugin())
    .use(authRateLimiter)

    // Admin Login
    .post("/login", async ({ body, set, jwt }) => {
        try {
            // Validate input
            const validatedData = validateInput(adminLoginSchema, body);
            const { email, password, rememberMe } = validatedData;

            // Find admin by email
            const admin = await prisma.admin.findUnique({
                where: { email }
            });

            // timing attack prevention
            const dummyHash = await Bun.password.hash('dummy-password-for-timing');
            const passwordToVerify = admin?.password || dummyHash;

            const isPasswordValid = await Bun.password.verify(password, passwordToVerify);

            if (!admin || !isPasswordValid) {
                set.status = 401;
                return {
                    error: 'Authentication Failed',
                    message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
                };
            }

            // Generate JWT token (Same mechanism but we can add role: admin to payload if needed)
            const accessToken = await generateAccessToken(jwt.sign, admin.id, admin.email);

            return {
                message: "เข้าสู่ระบบ Admin สำเร็จ",
                admin: {
                    id: admin.id,
                    email: admin.email,
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
            email: t.String(),
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
                imageFile: t.Optional(t.File())
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
                imageFile: t.Optional(t.File())
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
    );
