/**
 * Email Service
 * Wraps nodemailer with the project's SMTP env vars and provides
 * helpers for sending transactional emails (password reset, etc.)
 *
 * Required env vars:
 *   SMTP_SERVER    — smtp host (e.g. smtp.gmail.com)
 *   SMTP_PORT      — smtp port (e.g. 465 or 587)
 *   SMTP_USERNAME  — smtp auth username (usually full email address)
 *   SMTP_PASSWORD  — smtp auth password / app password
 *
 * Optional:
 *   EMAIL_FROM     — display "From" address (defaults to SMTP_USERNAME)
 *   EMAIL_FROM_NAME — display name (defaults to "Car2Hand")
 */

import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;
let smtpReady = false;

function getTransporter(): Transporter | null {
    if (transporter) return transporter;

    const host = process.env.SMTP_SERVER;
    const port = Number(process.env.SMTP_PORT);
    const user = process.env.SMTP_USERNAME;
    const pass = process.env.SMTP_PASSWORD;

    if (!host || !port || !user || !pass) {
        console.warn("[EMAIL] SMTP not configured — emails will be logged only.");
        return null;
    }

    transporter = nodemailer.createTransport({
        host,
        port,
        // 465 = implicit TLS, others (587/25) start plain and STARTTLS upgrade
        secure: port === 465,
        auth: { user, pass },
    });

    smtpReady = true;
    return transporter;
}

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
    const t = getTransporter();
    const fromName = process.env.EMAIL_FROM_NAME || "Car2Hand";
    const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USERNAME || "noreply@car2hand.com";
    const from = `${fromName} <${fromAddress}>`;

    if (!t) {
        // No SMTP configured — log to console instead so dev still works
        console.log(`[EMAIL] (no SMTP) → ${to}\n  Subject: ${subject}\n  ${text || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}`);
        return { sent: false, reason: "smtp-not-configured" };
    }

    try {
        const info = await t.sendMail({
            from,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
        });
        console.log(`[EMAIL] sent to ${to} — id=${info.messageId}`);
        return { sent: true, messageId: info.messageId };
    } catch (err) {
        console.error(`[EMAIL] failed to send to ${to}:`, err);
        return { sent: false, reason: "send-failed", error: err };
    }
}

/**
 * Renders the password-reset email (HTML) used by /auth/forgot-password.
 */
export function renderPasswordResetEmail(opts: {
    fullName: string;
    resetUrl: string;
    expiryMinutes: number;
}) {
    const { fullName, resetUrl, expiryMinutes } = opts;
    const safeName = escapeHtml(fullName || "ผู้ใช้งาน");

    const html = `<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>รีเซ็ตรหัสผ่าน Car2Hand</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F6F8;font-family:'Helvetica Neue',Arial,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F8;padding:40px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 20px rgba(15,52,96,0.08);">
                    <tr>
                        <td style="background:linear-gradient(135deg,#0F3460 0%,#1a4f8a 100%);padding:32px 32px 24px 32px;text-align:center;color:#ffffff;">
                            <div style="font-size:28px;font-weight:700;letter-spacing:-0.5px;">Car<span style="color:#FF6B35;">2</span>Hand</div>
                            <p style="margin:8px 0 0 0;font-size:14px;opacity:0.85;">รถมือสองที่คุณมั่นใจ</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px;">
                            <h1 style="margin:0 0 16px 0;font-size:22px;color:#0F3460;">รีเซ็ตรหัสผ่านของคุณ</h1>
                            <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#4b5563;">
                                สวัสดี <strong style="color:#1f2937;">${safeName}</strong>
                            </p>
                            <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#4b5563;">
                                เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชี Car2Hand ของคุณ
                                คลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่
                            </p>
                            <div style="text-align:center;margin:32px 0;">
                                <a href="${resetUrl}"
                                   style="display:inline-block;background-color:#0F3460;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:12px;font-size:15px;font-weight:600;box-shadow:0 4px 12px rgba(15,52,96,0.2);">
                                    ตั้งรหัสผ่านใหม่
                                </a>
                            </div>
                            <p style="margin:0 0 8px 0;font-size:13px;color:#6b7280;line-height:1.6;">
                                หรือคัดลอกลิงก์นี้ไปวางในเบราว์เซอร์:
                            </p>
                            <p style="margin:0 0 24px 0;font-size:12px;word-break:break-all;color:#0F3460;">
                                <a href="${resetUrl}" style="color:#0F3460;">${escapeHtml(resetUrl)}</a>
                            </p>
                            <div style="background-color:#FEF3C7;border:1px solid #FCD34D;border-radius:12px;padding:14px 16px;margin:24px 0 0 0;">
                                <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">
                                    ⏰ <strong>ลิงก์นี้จะหมดอายุภายใน ${expiryMinutes} นาที</strong><br>
                                    หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน สามารถละเลยอีเมลนี้ได้ — บัญชีของคุณยังคงปลอดภัย
                                </p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:#F9FAFB;padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;">
                            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
                                อีเมลฉบับนี้ถูกส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ<br>
                                © ${new Date().getFullYear()} Car2Hand. สงวนลิขสิทธิ์.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    const text = `สวัสดี ${fullName || "ผู้ใช้งาน"}

เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชี Car2Hand ของคุณ
คลิกลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่:

${resetUrl}

ลิงก์นี้จะหมดอายุภายใน ${expiryMinutes} นาที
หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน สามารถละเลยอีเมลนี้ได้

— Car2Hand`;

    return { html, text };
}

/**
 * Renders the delete-account verification email used by /users/me/delete-account/request.
 */
export function renderDeleteAccountEmail(opts: {
    fullName: string;
    code: string;
    expiryMinutes: number;
}) {
    const { fullName, code, expiryMinutes } = opts;
    const safeName = escapeHtml(fullName || "ผู้ใช้งาน");
    const safeCode = escapeHtml(code);

    const html = `<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>ยืนยันการลบบัญชี Car2Hand</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F6F8;font-family:'Helvetica Neue',Arial,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F8;padding:40px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 20px rgba(15,52,96,0.08);">
                    <tr>
                        <td style="background:linear-gradient(135deg,#0F3460 0%,#1a4f8a 100%);padding:32px 32px 24px 32px;text-align:center;color:#ffffff;">
                            <div style="font-size:28px;font-weight:700;letter-spacing:-0.5px;">Car<span style="color:#FF6B35;">2</span>Hand</div>
                            <p style="margin:8px 0 0 0;font-size:14px;opacity:0.85;">รถมือสองที่คุณมั่นใจ</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px;">
                            <h1 style="margin:0 0 16px 0;font-size:22px;color:#dc2626;">⚠️ ยืนยันการลบบัญชีของคุณ</h1>
                            <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#4b5563;">
                                สวัสดี <strong style="color:#1f2937;">${safeName}</strong>
                            </p>
                            <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#4b5563;">
                                เราได้รับคำขอลบบัญชี Car2Hand ของคุณ
                                กรุณานำรหัสด้านล่างไปกรอกในระบบเพื่อยืนยัน
                            </p>
                            <div style="text-align:center;margin:32px 0;">
                                <div style="display:inline-block;background-color:#F4F6F8;border:2px dashed #0F3460;border-radius:16px;padding:20px 32px;">
                                    <p style="margin:0 0 6px 0;font-size:11px;color:#6b7280;letter-spacing:1px;text-transform:uppercase;font-weight:600;">รหัสยืนยัน</p>
                                    <p style="margin:0;font-size:36px;font-weight:700;color:#0F3460;letter-spacing:8px;font-family:'Courier New',monospace;">${safeCode}</p>
                                </div>
                            </div>
                            <div style="background-color:#FEE2E2;border:1px solid #FCA5A5;border-radius:12px;padding:14px 16px;margin:24px 0;">
                                <p style="margin:0;font-size:13px;color:#991B1B;line-height:1.6;">
                                    🚨 <strong>การลบบัญชีไม่สามารถย้อนกลับได้</strong><br>
                                    ข้อมูลทั้งหมดของคุณ รวมถึงประกาศ รถ และข้อความในชุมชน จะถูกลบอย่างถาวร
                                </p>
                            </div>
                            <div style="background-color:#FEF3C7;border:1px solid #FCD34D;border-radius:12px;padding:14px 16px;margin:0 0 0 0;">
                                <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">
                                    ⏰ <strong>รหัสนี้จะหมดอายุภายใน ${expiryMinutes} นาที</strong><br>
                                    หากคุณไม่ได้เป็นผู้ขอลบบัญชี กรุณาเปลี่ยนรหัสผ่านทันทีและละเลยอีเมลนี้
                                </p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:#F9FAFB;padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;">
                            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
                                อีเมลฉบับนี้ถูกส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ<br>
                                © ${new Date().getFullYear()} Car2Hand. สงวนลิขสิทธิ์.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    const text = `สวัสดี ${fullName || "ผู้ใช้งาน"}

เราได้รับคำขอลบบัญชี Car2Hand ของคุณ
รหัสยืนยันสำหรับลบบัญชีคือ:

  ${code}

รหัสนี้จะหมดอายุภายใน ${expiryMinutes} นาที

การลบบัญชีไม่สามารถย้อนกลับได้
หากคุณไม่ได้เป็นผู้ขอลบบัญชี กรุณาเปลี่ยนรหัสผ่านทันทีและละเลยอีเมลนี้

— Car2Hand`;

    return { html, text };
}

/**
 * Renders the contact-form email delivered to support when a user submits /contact.
 */
export function renderContactMessageEmail(opts: {
    name: string;
    email: string;
    phoneNumber?: string;
    subject: string;
    message: string;
}) {
    const { name, email, phoneNumber, subject, message } = opts;
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = phoneNumber ? escapeHtml(phoneNumber) : '-';
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

    const html = `<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>ข้อความจากฟอร์มติดต่อ — Car2Hand</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F6F8;font-family:'Helvetica Neue',Arial,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F8;padding:40px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 20px rgba(15,52,96,0.08);">
                    <tr>
                        <td style="background:linear-gradient(135deg,#0F3460 0%,#1a4f8a 100%);padding:32px 32px 24px 32px;text-align:center;color:#ffffff;">
                            <div style="font-size:28px;font-weight:700;letter-spacing:-0.5px;">Car<span style="color:#FF6B35;">2</span>Hand</div>
                            <p style="margin:8px 0 0 0;font-size:14px;opacity:0.85;">ข้อความจากฟอร์มติดต่อ</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px;">
                            <h1 style="margin:0 0 20px 0;font-size:20px;color:#0F3460;">${safeSubject}</h1>

                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9FAFB;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:16px 20px;">
                                        <table role="presentation" width="100%" cellpadding="4" cellspacing="0" style="font-size:14px;">
                                            <tr>
                                                <td style="color:#6b7280;width:110px;vertical-align:top;">ชื่อ</td>
                                                <td style="color:#1f2937;font-weight:600;"><strong>${safeName}</strong></td>
                                            </tr>
                                            <tr>
                                                <td style="color:#6b7280;vertical-align:top;">อีเมล</td>
                                                <td style="color:#1f2937;"><a href="mailto:${safeEmail}" style="color:#0F3460;text-decoration:none;">${safeEmail}</a></td>
                                            </tr>
                                            <tr>
                                                <td style="color:#6b7280;vertical-align:top;">เบอร์โทร</td>
                                                <td style="color:#1f2937;">${safePhone}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <h2 style="margin:0 0 10px 0;font-size:14px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">ข้อความ</h2>
                            <div style="font-size:15px;line-height:1.7;color:#1f2937;white-space:pre-wrap;background-color:#ffffff;border-left:4px solid #FF6B35;padding:16px 20px;border-radius:0 8px 8px 0;background-color:#FFF7F2;">
                                ${safeMessage}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:#F9FAFB;padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;">
                            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
                                กรุณาตอบกลับผ่าน "${safeEmail}" โดยตรง<br>
                                © ${new Date().getFullYear()} Car2Hand. สงวนลิขสิทธิ์.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    const text = `ข้อความจากฟอร์มติดต่อ — Car2Hand

หัวข้อ: ${subject}

ชื่อ: ${name}
อีเมล: ${email}
เบอร์โทร: ${phoneNumber || '-'}

ข้อความ:
${message}

— ส่งจากฟอร์ม /contact ของ Car2Hand`;

    return { html, text };
}

function escapeHtml(input: string): string {
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

/**
 * Verify the SMTP connection at startup. Logs status; never throws.
 */
export async function verifySmtpConnection() {
    const t = getTransporter();
    if (!t) return false;
    try {
        await t.verify();
        console.log("[EMAIL] SMTP connection verified ✓");
        return true;
    } catch (err) {
        console.error("[EMAIL] SMTP verification failed:", err);
        smtpReady = false;
        return false;
    }
}

export function isSmtpReady() {
    return smtpReady;
}
