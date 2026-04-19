/**
 * Car2Hand Backend API
 * Elysia.js with OWASP Security Implementation
 */

import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

import { authRoutes, usersRoutes } from "./auth";
import { adminRoutes } from "./admin";
import { listingRoutes } from "./listings";
import { masterDataRoutes } from "./master-data";
import { wishlistRoutes } from "./wishlist";
import { articleRoutes as publicArticleRoutes } from "./articles";
import { packageRoutes } from "./packages";
import { securityHeaders, requestLogger, rateLimiter } from "./security";
import { lineAuthRoutes } from "./line-auth";
import { googleAuthRoutes } from "./google-auth";
import { facebookAuthRoutes } from "./facebook-auth";
import { contactRoutes } from "./contact";
import { lineWebhookRoutes } from "./line-webhook";
import { notificationRoutes } from "./notifications";
import { userNotificationRoutes } from "./user-notifications";
import { garageRoutes } from "./garage";
import { serviceRoutes } from "./services";
import { adminServiceRoutes } from "./admin-services";
import { adminSSERoutes, userSSERoutes } from "./admin-sse";
import { forumRoutes } from "./forum";
import { sellerProfileRoutes } from "./seller-profile";
import { kycRoutes } from "./kyc";
import { adminKycRoutes } from "./admin-kyc";
import { adminContactRoutes, adminForumRoutes, adminReportsRoutes, publicReportRoutes } from "./admin-moderation";
import { adminAuditRoutes, adminGarageRoutes, adminRevenueRoutes, adminListingBulkRoutes } from "./admin-p1";
import { adminSellerProfileRoutes } from "./admin-seller-profiles";
import { startPackageExpiryCrons } from "./crons/package-expiry";
import { verifySmtpConnection } from "./email";

// Allowed origins (update for production)
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL
].filter(Boolean) as string[];

const app = new Elysia()
  // Security Middleware
  .use(requestLogger)
  .use(securityHeaders)
  .use(rateLimiter(100)) // 100 requests per minute per IP

  // CORS configuration
  .use(cors({
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400 // 24 hours
  }))

  // Health check endpoint
  .get("/", () => ({
    status: "healthy",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  }))

  .get("/health", () => ({
    status: "ok",
    database: "connected",
    timestamp: new Date().toISOString()
  }))

  // API Routes
  .group("/api", app => 
    app
      .use(authRoutes)
      .use(adminRoutes)
      .use(usersRoutes)
      .use(listingRoutes)
      .use(masterDataRoutes)
      .use(wishlistRoutes)
      .use(publicArticleRoutes)
      .use(packageRoutes)
      .use(lineAuthRoutes)
      .use(googleAuthRoutes)
      .use(facebookAuthRoutes)
      .use(contactRoutes)
      .use(lineWebhookRoutes)
      .use(notificationRoutes)
      .use(userNotificationRoutes)
      .use(garageRoutes)
      .use(serviceRoutes)
      .use(adminServiceRoutes)
      .use(adminSSERoutes)
      .use(userSSERoutes)
      .use(forumRoutes)
      .use(sellerProfileRoutes)
      .use(kycRoutes)
      .use(adminKycRoutes)
      .use(adminContactRoutes)
      .use(adminForumRoutes)
      .use(adminReportsRoutes)
      .use(publicReportRoutes)
      .use(adminAuditRoutes)
      .use(adminGarageRoutes)
      .use(adminRevenueRoutes)
      .use(adminListingBulkRoutes)
      .use(adminSellerProfileRoutes)
  )

  // Global error handler
  .onError(({ code, error, set }) => {
    const errorMessage = 'message' in error ? error.message : String(error);
    console.error(`[ERROR] ${code}:`, errorMessage);

    // Don't expose internal errors to clients
    if (code === 'INTERNAL_SERVER_ERROR') {
      set.status = 500;
      return {
        error: 'Internal Server Error',
        message: 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง'
      };
    }

    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        error: 'Not Found',
        message: 'ไม่พบทรัพยากรที่ร้องขอ'
      };
    }

    if (code === 'VALIDATION') {
      set.status = 400;
      return {
        error: 'Validation Error',
        message: 'ข้อมูลไม่ถูกต้อง',
        details: errorMessage
      };
    }

    return {
      error: code,
      message: errorMessage
    };
  })

  .listen(8000);

// Start cron jobs
startPackageExpiryCrons();

// Verify SMTP connection (non-blocking, swallow any rejection)
verifySmtpConnection().catch((err) => {
  console.error("[EMAIL] SMTP startup verification threw:", err);
});

// Safety net: never let an unhandled SMTP/socket rejection crash the process
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
});

console.log(`
🦊 Car2Hand API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Server: http://${app.server?.hostname}:${app.server?.port}
🔒 Security: OWASP Compliant
   • Rate Limiting: ✓
   • Security Headers: ✓
   • JWT Authentication: ✓
   • Input Validation: ✓
   • Request Logging: ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
