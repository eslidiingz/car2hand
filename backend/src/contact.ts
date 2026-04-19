/**
 * Public Contact Form Routes
 * Accepts submissions from the /contact page and forwards them by email to support.
 */

import { Elysia, t } from "elysia";
import prisma from "./db";
import { contactSchema, validateInput } from "./validation";
import { sanitizeObject, checkRateLimit } from "./security";
import { sendEmail, renderContactMessageEmail } from "./email";

export const contactRoutes = new Elysia({ prefix: "/contact" })
    .post("/", async ({ body, set, request }) => {
        // Rate-limit: 5 submissions per 10 minutes per IP
        const rateLimitResult = checkRateLimit(request, 5);
        if (rateLimitResult) {
            set.status = rateLimitResult.status;
            return rateLimitResult.body;
        }

        try {
            const validated = validateInput(contactSchema, body);
            const sanitized = sanitizeObject(validated) as typeof validated;
            const { name, email, phoneNumber, subject, message } = sanitized;

            // Destination: admin/support inbox (fallback to SMTP user)
            const to =
                process.env.CONTACT_INBOX ||
                process.env.EMAIL_FROM ||
                process.env.SMTP_USERNAME ||
                "support@car2hand.app";

            const { html, text } = renderContactMessageEmail({
                name,
                email,
                phoneNumber,
                subject,
                message,
            });

            // Persist to DB first so admin can always see it even if email fails
            const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
                || request.headers.get("x-real-ip")
                || null;
            const userAgent = request.headers.get("user-agent");

            const record = await prisma.contactMessage.create({
                data: {
                    name,
                    email,
                    phoneNumber: phoneNumber || null,
                    subject,
                    message,
                    ipAddress,
                    userAgent,
                },
                select: { id: true },
            });

            const result = await sendEmail({
                to,
                subject: `[Car2Hand Contact] ${subject}`,
                html,
                text,
            });

            if (!result.sent) {
                console.log(`[CONTACT] fallback log — from ${email} (${name}): ${subject}\n${message}`);
            }

            return {
                message: "ส่งข้อความเรียบร้อยแล้ว เราจะติดต่อกลับภายใน 1-2 วันทำการ",
                sent: result.sent,
                id: record.id,
            };
        } catch (error: unknown) {
            if (
                typeof error === "object" &&
                error !== null &&
                "status" in error &&
                (error as { status: number }).status === 400
            ) {
                set.status = 400;
                return error;
            }
            console.error("Contact submit error:", error);
            set.status = 500;
            return {
                error: "Server Error",
                message: "เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่",
            };
        }
    }, {
        body: t.Object({
            name: t.String(),
            email: t.String(),
            phoneNumber: t.Optional(t.String()),
            subject: t.String(),
            message: t.String(),
        }),
    });
