/**
 * KYC (Know Your Customer) — Seller verification workflow
 *
 * 3 tiers, orthogonal to paid packages:
 *   - ID       : บัตร ปชช + เซลฟี่ถือบัตร → badge "ยืนยันบุคคล"
 *   - BUSINESS : + ทะเบียนพาณิชย์/ภ.พ.20 + หลักฐานที่อยู่ → badge "ร้านรับรอง"
 *   - DEALER   : + หนังสือแต่งตั้งจากค่ายรถ → badge "ดีลเลอร์รับรอง"
 *
 * Flow:
 *   POST /kyc/submit   — user uploads docs (type + images)
 *   GET  /kyc/me       — user sees own submissions + current verification level
 *   POST /kyc/cancel   — user cancels PENDING submission
 *
 * Admin endpoints live in admin.ts under /admin/kyc prefix.
 *
 * ShowroomType rule:
 *   INDIVIDUAL  — allowed for anyone
 *   TENT        — requires active BUSINESS-level verification
 *   DEALER      — requires active DEALER-level verification
 */

import { Elysia, t } from "elysia";
import prisma from "./db";
import { jwtPlugin, isTokenBlacklisted, JWTPayload } from "./jwt";
import {
    uploadFile,
    generateFilename,
    isValidImageType,
    isValidFileSize,
} from "./storage";
import { pushNotification } from "./admin-sse";

export type KycType = "ID" | "BUSINESS" | "DEALER";
export type KycStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

/* ─── Upload helpers ──────────────────────────────────────────────── */

const MAX_DOC_SIZE = 8 * 1024 * 1024; // 8 MB per doc (KYC docs can be large scans)

async function uploadDoc(file: File, userId: string, slot: string): Promise<string> {
    if (!file || file.size === 0) throw new Error("MISSING_FILE");
    if (!isValidImageType(file.type)) throw new Error("INVALID_FILE_TYPE");
    if (!isValidFileSize(file.size, MAX_DOC_SIZE)) throw new Error("FILE_TOO_LARGE");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = generateFilename(file.name);
    const objectPath = `kyc/${userId}/${slot}/${filename}`;
    return uploadFile(objectPath, buffer, file.type);
}

/* ─── Validation ──────────────────────────────────────────────────── */

function validateSubmission(type: KycType, data: {
    fullName?: string;
    idNumber?: string;
    idCardImage?: string;
    selfieImage?: string;
    businessName?: string;
    taxId?: string;
    businessCertImage?: string;
    addressProofImage?: string;
    dealerAppointmentDoc?: string;
}): string | null {
    // Identity is required for every tier
    if (!data.fullName?.trim()) return "กรุณากรอกชื่อ-นามสกุล";
    if (!data.idNumber?.match(/^\d{13}$/)) return "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก";
    if (!data.idCardImage) return "กรุณาอัปโหลดรูปบัตรประชาชน";
    if (!data.selfieImage) return "กรุณาอัปโหลดรูปเซลฟี่ถือบัตร";

    if (type === "BUSINESS" || type === "DEALER") {
        if (!data.businessName?.trim()) return "กรุณากรอกชื่อร้าน/บริษัท";
        if (!data.taxId?.trim()) return "กรุณากรอกเลขทะเบียนพาณิชย์/ผู้เสียภาษี";
        if (!data.businessCertImage) return "กรุณาอัปโหลดหนังสือรับรอง/ทะเบียนพาณิชย์";
        if (!data.addressProofImage) return "กรุณาอัปโหลดหลักฐานที่อยู่ร้าน";
    }
    if (type === "DEALER" && !data.dealerAppointmentDoc) {
        return "กรุณาอัปโหลดหนังสือแต่งตั้งจากค่ายรถ";
    }
    return null;
}

/* ─── Routes ──────────────────────────────────────────────────────── */

export const kycRoutes = new Elysia({ prefix: "/kyc" })
    .use(jwtPlugin())

    // Get the current user's KYC state — verification level + submission history
    .get("/me", async ({ jwt, request, set }) => {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Unauthorized" }; }
        const token = authHeader.substring(7);
        if (isTokenBlacklisted(token)) { set.status = 401; return { error: "Unauthorized" }; }
        const payload = await jwt.verify(token) as JWTPayload | false;
        if (!payload) { set.status = 401; return { error: "Unauthorized" }; }

        const [profile, submissions] = await Promise.all([
            prisma.sellerProfile.findUnique({
                where: { userId: payload.userId },
                select: {
                    isVerified: true,
                    verifiedAt: true,
                    verificationLevel: true,
                    showroomType: true,
                },
            }),
            prisma.kycSubmission.findMany({
                where: { userId: payload.userId },
                orderBy: { submittedAt: "desc" },
                take: 10,
                select: {
                    id: true,
                    type: true,
                    status: true,
                    submittedAt: true,
                    reviewedAt: true,
                    reviewNote: true,
                    requestedShowroom: true,
                },
            }),
        ]);

        return {
            verificationLevel: profile?.verificationLevel || "NONE",
            isVerified: profile?.isVerified || false,
            verifiedAt: profile?.verifiedAt || null,
            showroomType: profile?.showroomType || "INDIVIDUAL",
            submissions,
            // Convenience: is there an active PENDING submission?
            hasPending: submissions.some((s) => s.status === "PENDING"),
        };
    })

    // Submit a new KYC request. Uses multipart/form-data because we upload images.
    .post("/submit", async ({ jwt, request, set }) => {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Unauthorized" }; }
        const token = authHeader.substring(7);
        if (isTokenBlacklisted(token)) { set.status = 401; return { error: "Unauthorized" }; }
        const payload = await jwt.verify(token) as JWTPayload | false;
        if (!payload) { set.status = 401; return { error: "Unauthorized" }; }

        // Block if there's already a PENDING submission — force cancel-then-resubmit
        const existingPending = await prisma.kycSubmission.findFirst({
            where: { userId: payload.userId, status: "PENDING" },
            select: { id: true },
        });
        if (existingPending) {
            set.status = 409;
            return { error: "PENDING_EXISTS", message: "คุณมีคำขอยืนยันที่กำลังรอการตรวจสอบอยู่แล้ว" };
        }

        const form = await request.formData();
        const type = String(form.get("type") || "").toUpperCase() as KycType;
        if (!["ID", "BUSINESS", "DEALER"].includes(type)) {
            set.status = 400; return { error: "INVALID_TYPE", message: "ประเภทไม่ถูกต้อง" };
        }

        const fullName = String(form.get("fullName") || "").trim();
        const idNumber = String(form.get("idNumber") || "").trim();
        const businessName = String(form.get("businessName") || "").trim() || undefined;
        const taxId = String(form.get("taxId") || "").trim() || undefined;
        const requestedShowroom = (String(form.get("requestedShowroom") || "").toUpperCase() || undefined) as
            | "INDIVIDUAL" | "TENT" | "DEALER" | undefined;

        // Guard: requested showroom must match the verification tier's permissions
        if (requestedShowroom === "TENT" && type === "ID") {
            set.status = 400; return { error: "INVALID_SHOWROOM", message: "ต้องยืนยันระดับ BUSINESS ขึ้นไปเพื่อเป็นเต็นท์" };
        }
        if (requestedShowroom === "DEALER" && type !== "DEALER") {
            set.status = 400; return { error: "INVALID_SHOWROOM", message: "ต้องยืนยันระดับ DEALER เพื่อเป็นดีลเลอร์" };
        }

        // Upload images sequentially — if any fail we abort before writing DB
        let idCardImage: string | undefined,
            selfieImage: string | undefined,
            businessCertImage: string | undefined,
            addressProofImage: string | undefined,
            dealerAppointmentDoc: string | undefined;

        try {
            const idCard = form.get("idCardImage") as File | null;
            const selfie = form.get("selfieImage") as File | null;
            if (idCard && idCard.size > 0) idCardImage = await uploadDoc(idCard, payload.userId, "id-card");
            if (selfie && selfie.size > 0) selfieImage = await uploadDoc(selfie, payload.userId, "selfie");

            if (type !== "ID") {
                const businessCert = form.get("businessCertImage") as File | null;
                const addressProof = form.get("addressProofImage") as File | null;
                if (businessCert && businessCert.size > 0) businessCertImage = await uploadDoc(businessCert, payload.userId, "business-cert");
                if (addressProof && addressProof.size > 0) addressProofImage = await uploadDoc(addressProof, payload.userId, "address-proof");
            }
            if (type === "DEALER") {
                const dealerDoc = form.get("dealerAppointmentDoc") as File | null;
                if (dealerDoc && dealerDoc.size > 0) dealerAppointmentDoc = await uploadDoc(dealerDoc, payload.userId, "dealer-doc");
            }
        } catch (err) {
            set.status = 400;
            const msg = err instanceof Error ? err.message : "UPLOAD_FAILED";
            return { error: msg, message: msg === "INVALID_FILE_TYPE" ? "รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WebP)"
                : msg === "FILE_TOO_LARGE" ? "ไฟล์ต้องไม่เกิน 8MB" : "อัปโหลดไฟล์ไม่สำเร็จ" };
        }

        const validationError = validateSubmission(type, {
            fullName, idNumber, idCardImage, selfieImage,
            businessName, taxId, businessCertImage, addressProofImage, dealerAppointmentDoc,
        });
        if (validationError) {
            set.status = 400;
            return { error: "VALIDATION_ERROR", message: validationError };
        }

        const submission = await prisma.kycSubmission.create({
            data: {
                userId: payload.userId,
                type,
                status: "PENDING",
                fullName,
                idNumber,
                idCardImage,
                selfieImage,
                businessName,
                taxId,
                businessCertImage,
                addressProofImage,
                dealerAppointmentDoc,
                requestedShowroom: requestedShowroom as never,
            },
            select: { id: true, type: true, status: true, submittedAt: true },
        });

        return { message: "ยื่นคำขอเรียบร้อย รอผู้ดูแลตรวจสอบภายใน 1-3 วันทำการ", submission };
    })

    // Cancel a PENDING submission (user changed their mind or uploaded wrong docs)
    .post("/cancel/:id", async ({ jwt, request, set, params }) => {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Unauthorized" }; }
        const token = authHeader.substring(7);
        const payload = await jwt.verify(token) as JWTPayload | false;
        if (!payload) { set.status = 401; return { error: "Unauthorized" }; }

        const updated = await prisma.kycSubmission.updateMany({
            where: { id: params.id, userId: payload.userId, status: "PENDING" },
            data: { status: "CANCELLED" },
        });
        if (updated.count === 0) {
            set.status = 404;
            return { error: "NOT_FOUND", message: "ไม่พบคำขอที่กำลังรอการตรวจสอบ" };
        }
        return { message: "ยกเลิกคำขอเรียบร้อย" };
    });

/* ─── Shared helper: apply an approved KYC to SellerProfile ──────── */

export async function applyKycApproval(submissionId: string, reviewerId: string, note?: string) {
    const sub = await prisma.kycSubmission.findUnique({ where: { id: submissionId } });
    if (!sub) throw new Error("SUBMISSION_NOT_FOUND");
    if (sub.status !== "PENDING") throw new Error("ALREADY_REVIEWED");

    // Ensure a seller profile exists (auto-create minimal one if not)
    const existing = await prisma.sellerProfile.findUnique({ where: { userId: sub.userId } });
    const shopName = sub.businessName || sub.fullName || "ร้านของฉัน";

    await prisma.$transaction([
        prisma.kycSubmission.update({
            where: { id: submissionId },
            data: {
                status: "APPROVED",
                reviewedAt: new Date(),
                reviewedBy: reviewerId,
                reviewNote: note,
            },
        }),
        existing
            ? prisma.sellerProfile.update({
                where: { userId: sub.userId },
                data: {
                    isVerified: true,
                    verifiedAt: new Date(),
                    verificationLevel: sub.type, // ID | BUSINESS | DEALER
                    ...(sub.requestedShowroom ? { showroomType: sub.requestedShowroom } : {}),
                },
            })
            : prisma.sellerProfile.create({
                data: {
                    userId: sub.userId,
                    shopName,
                    isVerified: true,
                    verifiedAt: new Date(),
                    verificationLevel: sub.type,
                    showroomType: sub.requestedShowroom || "INDIVIDUAL",
                },
            }),
    ]);

    // Notify the user (SSE + Web Push)
    const badgeLabel = sub.type === "ID" ? "ยืนยันบุคคล" : sub.type === "BUSINESS" ? "ร้านรับรอง" : "ดีลเลอร์รับรอง";
    await pushNotification(sub.userId, {
        title: "ยืนยันตัวตนสำเร็จ 🎉",
        message: `บัญชีของคุณได้รับการยืนยันระดับ "${badgeLabel}" แล้ว`,
        type: "KYC_APPROVED",
        url: "/profile/verify",
    });
    await prisma.userNotification.create({
        data: {
            userId: sub.userId,
            title: "ยืนยันตัวตนสำเร็จ",
            message: `บัญชีของคุณได้รับการยืนยันระดับ "${badgeLabel}" แล้ว`,
            type: "KYC_APPROVED",
        },
    });
}

export async function applyKycRejection(submissionId: string, reviewerId: string, reason: string) {
    const sub = await prisma.kycSubmission.findUnique({ where: { id: submissionId } });
    if (!sub) throw new Error("SUBMISSION_NOT_FOUND");
    if (sub.status !== "PENDING") throw new Error("ALREADY_REVIEWED");

    await prisma.kycSubmission.update({
        where: { id: submissionId },
        data: {
            status: "REJECTED",
            reviewedAt: new Date(),
            reviewedBy: reviewerId,
            reviewNote: reason,
        },
    });

    await pushNotification(sub.userId, {
        title: "คำขอยืนยันตัวตนไม่ผ่าน",
        message: reason.length > 100 ? reason.slice(0, 97) + "..." : reason,
        type: "KYC_REJECTED",
        url: "/profile/verify",
    });
    await prisma.userNotification.create({
        data: {
            userId: sub.userId,
            title: "คำขอยืนยันตัวตนไม่ผ่าน",
            message: reason,
            type: "KYC_REJECTED",
        },
    });
}
