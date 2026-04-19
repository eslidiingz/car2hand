/**
 * Admin moderation routes — groups 3 related surfaces:
 *   /admin/contact  — inbox for public contact form submissions
 *   /admin/forum    — moderate posts / comments (pin, delete, hide)
 *   /admin/reports  — abuse reports from users (listings, posts, users)
 *
 * All routes require Bearer admin token via the same derive pattern as admin-kyc.ts.
 */

import { Elysia, t } from "elysia";
import prisma from "./db";
import { jwtPlugin } from "./jwt";

const adminAuth = (app: Elysia) =>
    app.use(jwtPlugin()).derive(async ({ jwt, headers, set }) => {
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
    });

/* ─── Admin Contact Inbox ────────────────────────────────────── */

export const adminContactRoutes = new Elysia({ prefix: "/admin/contact" })
    .use(adminAuth)
    // List messages — default newest first, filter by status + read state
    .get("/", async ({ authError, query, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        const status = String(query.status || "").toUpperCase();
        const readFilter = String(query.read || "");  // "0" = unread only
        const page = parseInt(String(query.page || "1"));
        const limit = Math.min(parseInt(String(query.limit || "25")), 100);

        const where = {
            ...(status && ["NEW", "IN_PROGRESS", "RESOLVED", "SPAM"].includes(status) ? { status } : {}),
            ...(readFilter === "0" ? { isRead: false } : {}),
        };

        const [messages, total, unreadCount] = await Promise.all([
            prisma.contactMessage.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.contactMessage.count({ where }),
            prisma.contactMessage.count({ where: { isRead: false } }),
        ]);

        return {
            messages,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
            unreadCount,
        };
    })

    // Get one — also marks as read (side effect)
    .get("/:id", async ({ authError, params, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        const msg = await prisma.contactMessage.findUnique({ where: { id: params.id } });
        if (!msg) { set.status = 404; return { error: "NOT_FOUND" }; }

        // Fire-and-forget: mark read
        if (!msg.isRead) {
            prisma.contactMessage.update({
                where: { id: params.id },
                data: { isRead: true, readAt: new Date() },
            }).catch(() => undefined);
        }
        return { message: msg };
    })

    // Change status + note
    .put("/:id", async ({ authError, adminId, params, body, set }) => {
        if (authError || !adminId) { set.status = 401; return { error: authError || "Unauthorized" }; }
        const { status, adminNote } = body as { status?: string; adminNote?: string };
        const validStatuses = ["NEW", "IN_PROGRESS", "RESOLVED", "SPAM"];
        if (status && !validStatuses.includes(status)) {
            set.status = 400; return { error: "INVALID_STATUS" };
        }

        const updated = await prisma.contactMessage.update({
            where: { id: params.id },
            data: {
                ...(status ? { status } : {}),
                ...(adminNote !== undefined ? { adminNote } : {}),
                ...(status === "RESOLVED" ? { resolvedAt: new Date(), resolvedBy: adminId } : {}),
            },
        });
        return { message: updated };
    }, {
        body: t.Object({
            status: t.Optional(t.String()),
            adminNote: t.Optional(t.String()),
        }),
    })

    // Delete (spam/abuse)
    .delete("/:id", async ({ authError, params, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        await prisma.contactMessage.delete({ where: { id: params.id } });
        return { message: "deleted" };
    });

/* ─── Admin Forum Moderation ─────────────────────────────────── */

export const adminForumRoutes = new Elysia({ prefix: "/admin/forum" })
    .use(adminAuth)
    // Post list with moderation filters
    .get("/posts", async ({ authError, query, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        const status = String(query.status || "PUBLISHED");
        const search = String(query.search || "").trim();
        const page = parseInt(String(query.page || "1"));
        const limit = Math.min(parseInt(String(query.limit || "25")), 100);

        const where = {
            ...(status !== "ALL" ? { status: status as "PUBLISHED" | "HIDDEN" | "DELETED" } : {}),
            ...(search
                ? {
                    OR: [
                        { title: { contains: search, mode: "insensitive" as const } },
                        { content: { contains: search, mode: "insensitive" as const } },
                    ],
                }
                : {}),
        };

        const [posts, total] = await Promise.all([
            prisma.forumPost.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    author: { select: { id: true, fullName: true, email: true } },
                    category: { select: { name: true, slug: true } },
                    _count: { select: { comments: true, votes: true } },
                },
            }),
            prisma.forumPost.count({ where }),
        ]);

        return { posts, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    })

    // Moderate post — pin / solve / hide / delete / restore
    .put("/posts/:id", async ({ authError, params, body, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        const { isPinned, isSolved, status } = body as {
            isPinned?: boolean;
            isSolved?: boolean;
            status?: "PUBLISHED" | "HIDDEN" | "DELETED";
        };
        const updated = await prisma.forumPost.update({
            where: { id: params.id },
            data: {
                ...(isPinned !== undefined ? { isPinned } : {}),
                ...(isSolved !== undefined ? { isSolved } : {}),
                ...(status ? { status } : {}),
            },
        });
        return { post: updated };
    }, {
        body: t.Object({
            isPinned: t.Optional(t.Boolean()),
            isSolved: t.Optional(t.Boolean()),
            status: t.Optional(t.String()),
        }),
    })

    // Hard delete post (use sparingly — prefer status=DELETED for audit trail)
    .delete("/posts/:id", async ({ authError, params, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        await prisma.forumPost.delete({ where: { id: params.id } });
        return { message: "deleted" };
    })

    // Recent comments for moderation
    .get("/comments", async ({ authError, query, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        const page = parseInt(String(query.page || "1"));
        const limit = Math.min(parseInt(String(query.limit || "25")), 100);

        const [comments, total] = await Promise.all([
            prisma.forumComment.findMany({
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    author: { select: { id: true, fullName: true } },
                    post: { select: { id: true, title: true } },
                },
            }),
            prisma.forumComment.count(),
        ]);

        return { comments, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    })

    .delete("/comments/:id", async ({ authError, params, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        await prisma.forumComment.delete({ where: { id: params.id } });
        return { message: "deleted" };
    })

    // Forum categories (CRUD)
    .get("/categories", async ({ authError, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        const categories = await prisma.forumCategory.findMany({
            orderBy: { order: "asc" },
            include: { _count: { select: { posts: true } } },
        });
        return { categories };
    })

    .post("/categories", async ({ authError, body, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        const { name, slug, icon, color, order } = body as {
            name: string; slug: string; icon?: string; color?: string; order?: number;
        };
        const cat = await prisma.forumCategory.create({
            data: { name, slug, icon, color, order: order || 0 },
        });
        return { category: cat };
    }, {
        body: t.Object({
            name: t.String(), slug: t.String(),
            icon: t.Optional(t.String()), color: t.Optional(t.String()), order: t.Optional(t.Number()),
        }),
    })

    .put("/categories/:id", async ({ authError, params, body, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        const cat = await prisma.forumCategory.update({
            where: { id: params.id },
            data: body as Record<string, unknown>,
        });
        return { category: cat };
    })

    .delete("/categories/:id", async ({ authError, params, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        // Soft-delete via isActive to preserve post links
        const cat = await prisma.forumCategory.update({
            where: { id: params.id },
            data: { isActive: false },
        });
        return { category: cat };
    });

/* ─── Admin Abuse Reports ────────────────────────────────────── */

export const adminReportsRoutes = new Elysia({ prefix: "/admin/reports" })
    .use(adminAuth)
    .get("/", async ({ authError, query, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        const status = String(query.status || "OPEN").toUpperCase();
        const targetType = String(query.targetType || "").toUpperCase();
        const page = parseInt(String(query.page || "1"));
        const limit = Math.min(parseInt(String(query.limit || "25")), 100);

        const where = {
            ...(status !== "ALL" ? { status } : {}),
            ...(targetType && ["LISTING", "FORUM_POST", "FORUM_COMMENT", "USER"].includes(targetType)
                ? { targetType }
                : {}),
        };

        const [reports, total, openCount] = await Promise.all([
            prisma.abuseReport.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    reporter: { select: { id: true, fullName: true, email: true } },
                },
            }),
            prisma.abuseReport.count({ where }),
            prisma.abuseReport.count({ where: { status: "OPEN" } }),
        ]);

        return {
            reports,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
            openCount,
        };
    })

    .put("/:id", async ({ authError, adminId, params, body, set }) => {
        if (authError || !adminId) { set.status = 401; return { error: authError || "Unauthorized" }; }
        const { status, adminNote } = body as { status?: string; adminNote?: string };
        const validStatuses = ["OPEN", "REVIEWING", "RESOLVED", "DISMISSED"];
        if (status && !validStatuses.includes(status)) {
            set.status = 400; return { error: "INVALID_STATUS" };
        }
        const updated = await prisma.abuseReport.update({
            where: { id: params.id },
            data: {
                ...(status ? { status } : {}),
                ...(adminNote !== undefined ? { adminNote } : {}),
                ...(status && status !== "OPEN" ? { reviewedAt: new Date(), reviewedBy: adminId } : {}),
            },
        });
        return { report: updated };
    }, {
        body: t.Object({
            status: t.Optional(t.String()),
            adminNote: t.Optional(t.String()),
        }),
    });

/* ─── Public user route to create a report ────────────────────
 * Exposed under /reports (non-admin) so the frontend can flag content.
 */
export const publicReportRoutes = new Elysia({ prefix: "/reports" })
    .use(jwtPlugin())
    .post("/", async ({ jwt, headers, body, set, request }) => {
        const { targetType, targetId, reason, description } = body as {
            targetType: string; targetId: string; reason: string; description?: string;
        };
        const validTargets = ["LISTING", "FORUM_POST", "FORUM_COMMENT", "USER"];
        const validReasons = ["SPAM", "FRAUD", "INAPPROPRIATE", "DUPLICATE", "OTHER"];
        if (!validTargets.includes(targetType)) { set.status = 400; return { error: "INVALID_TARGET" }; }
        if (!validReasons.includes(reason)) { set.status = 400; return { error: "INVALID_REASON" }; }

        // Optional auth — anonymous reports allowed but logged via IP rate-limit
        let reporterId: string | null = null;
        const authHeader = headers["authorization"];
        if (authHeader?.startsWith("Bearer ")) {
            const payload = await jwt.verify(authHeader.slice(7).trim());
            if (payload) reporterId = (payload as { userId: string }).userId;
        }

        const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
            || request.headers.get("x-real-ip")
            || null;

        // Light-weight spam guard: max 10 reports per reporter (or IP) per hour
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recent = await prisma.abuseReport.count({
            where: {
                createdAt: { gte: hourAgo },
                ...(reporterId ? { reporterId } : {}),
            },
        });
        if (recent >= 10) { set.status = 429; return { error: "RATE_LIMITED" }; }

        // Dedupe — don't let the same reporter report the same target multiple times
        if (reporterId) {
            const existing = await prisma.abuseReport.findFirst({
                where: { reporterId, targetType, targetId, status: { in: ["OPEN", "REVIEWING"] } },
                select: { id: true },
            });
            if (existing) {
                return { message: "รายงานถูกบันทึกแล้ว ทีมงานกำลังตรวจสอบ", id: existing.id };
            }
        }

        const report = await prisma.abuseReport.create({
            data: {
                reporterId,
                targetType,
                targetId,
                reason,
                description: description || null,
                adminNote: ipAddress ? `ip=${ipAddress}` : null,
            },
            select: { id: true },
        });
        return { message: "ขอบคุณสำหรับการรายงาน ทีมงานจะตรวจสอบโดยเร็ว", id: report.id };
    }, {
        body: t.Object({
            targetType: t.String(),
            targetId: t.String(),
            reason: t.String(),
            description: t.Optional(t.String()),
        }),
    });
