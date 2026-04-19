/**
 * Admin KYC moderation routes — /admin/kyc/*
 *
 * Review queue + approve/reject workflow for seller verification.
 * Mirrors the auth pattern used in admin.ts (.derive Bearer token).
 */

import { Elysia, t } from "elysia";
import prisma from "./db";
import { jwtPlugin } from "./jwt";
import { applyKycApproval, applyKycRejection } from "./kyc";
import { logAdminAction } from "./admin-p1";

export const adminKycRoutes = new Elysia({ prefix: "/admin/kyc" })
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

    // Review queue — supports status filter + basic pagination
    .get("/", async ({ authError, query, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        const status = (query.status as string || "PENDING").toUpperCase();
        const type = (query.type as string || "").toUpperCase();
        const page = parseInt((query.page as string) || "1");
        const limit = Math.min(parseInt((query.limit as string) || "20"), 100);
        const skip = (page - 1) * limit;

        const where = {
            ...(status !== "ALL" ? { status } : {}),
            ...(type && ["ID", "BUSINESS", "DEALER"].includes(type) ? { type } : {}),
        };

        const [submissions, total] = await Promise.all([
            prisma.kycSubmission.findMany({
                where,
                orderBy: { submittedAt: "desc" },
                skip,
                take: limit,
                include: {
                    user: { select: { id: true, fullName: true, email: true, phoneNumber: true, profileImage: true } },
                },
            }),
            prisma.kycSubmission.count({ where }),
        ]);

        // Pending counts by type (useful for the admin sidebar badge)
        const pendingByType = await prisma.kycSubmission.groupBy({
            by: ["type"],
            where: { status: "PENDING" },
            _count: true,
        });

        return {
            submissions,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
            pendingByType: pendingByType.reduce<Record<string, number>>((acc, r) => {
                acc[r.type] = r._count;
                return acc;
            }, {}),
        };
    })

    // Full detail for review — includes all image URLs + user history
    .get("/:id", async ({ authError, params, set }) => {
        if (authError) { set.status = 401; return { error: authError }; }
        const submission = await prisma.kycSubmission.findUnique({
            where: { id: params.id },
            include: {
                user: {
                    select: {
                        id: true, fullName: true, email: true, phoneNumber: true, profileImage: true, createdAt: true,
                        sellerProfile: { select: { shopName: true, showroomType: true, verificationLevel: true, isVerified: true } },
                    },
                },
            },
        });
        if (!submission) { set.status = 404; return { error: "NOT_FOUND" }; }

        // Also include the user's previous submissions so reviewer sees history
        const history = await prisma.kycSubmission.findMany({
            where: { userId: submission.userId, id: { not: submission.id } },
            orderBy: { submittedAt: "desc" },
            take: 5,
            select: { id: true, type: true, status: true, submittedAt: true, reviewNote: true },
        });

        return { submission, history };
    })

    // Approve — updates SellerProfile verificationLevel + badge + optional showroomType
    .post("/:id/approve", async ({ authError, adminId, params, body, set }) => {
        if (authError || !adminId) { set.status = 401; return { error: authError || "Unauthorized" }; }
        try {
            await applyKycApproval(params.id, adminId, (body as { note?: string }).note);
            await logAdminAction({ adminId, action: "KYC_APPROVE", targetType: "KYC", targetId: params.id, note: (body as { note?: string }).note });
            return { message: "อนุมัติเรียบร้อย" };
        } catch (err) {
            const msg = err instanceof Error ? err.message : "ERROR";
            set.status = msg === "SUBMISSION_NOT_FOUND" ? 404 : 400;
            return { error: msg };
        }
    }, {
        body: t.Object({ note: t.Optional(t.String()) }),
    })

    // Reject — reason is required so the user knows what to fix
    .post("/:id/reject", async ({ authError, adminId, params, body, set }) => {
        if (authError || !adminId) { set.status = 401; return { error: authError || "Unauthorized" }; }
        const reason = ((body as { reason?: string }).reason || "").trim();
        if (!reason) { set.status = 400; return { error: "MISSING_REASON", message: "กรุณาระบุเหตุผลของการปฏิเสธ" }; }
        try {
            await applyKycRejection(params.id, adminId, reason);
            await logAdminAction({ adminId, action: "KYC_REJECT", targetType: "KYC", targetId: params.id, note: reason });
            return { message: "ปฏิเสธเรียบร้อย" };
        } catch (err) {
            const msg = err instanceof Error ? err.message : "ERROR";
            set.status = msg === "SUBMISSION_NOT_FOUND" ? 404 : 400;
            return { error: msg };
        }
    }, {
        body: t.Object({ reason: t.String() }),
    });
