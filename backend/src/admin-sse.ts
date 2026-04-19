/**
 * SSE (Server-Sent Events)
 * Real-time push for admin pending counts and user notifications
 */

import { Elysia } from "elysia";
import { jwtPlugin } from "./jwt";
import prisma from "./db";

// ============================================================
// Admin SSE — broadcast pending counts to all admin clients
// ============================================================

const adminClients = new Set<ReadableStreamDefaultController>();

export function broadcastAdminEvent(event: string, data: object) {
    const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    const encoded = new TextEncoder().encode(msg);
    for (const controller of adminClients) {
        try { controller.enqueue(encoded); }
        catch { adminClients.delete(controller); }
    }
}

export async function getAndBroadcastPendingCounts() {
    const [pendingListings, pendingUpgrades, pendingRenewals] = await Promise.all([
        prisma.vehicleListing.count({ where: { status: 'PENDING' } }),
        prisma.packageTransaction.count({ where: { status: 'PENDING' } }),
        prisma.listingRenewal.count({ where: { status: 'PENDING' } }),
    ]);
    broadcastAdminEvent('pending-update', { pendingListings, pendingUpgrades, pendingRenewals });
}

// ============================================================
// User SSE — push notifications to specific users
// ============================================================

const userClients = new Map<string, Set<ReadableStreamDefaultController>>();

/**
 * Send SSE event to a specific user (all their connected tabs)
 */
export function sendUserEvent(userId: string, event: string, data: object) {
    const controllers = userClients.get(userId);
    if (!controllers) return;
    const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    const encoded = new TextEncoder().encode(msg);
    for (const controller of controllers) {
        try { controller.enqueue(encoded); }
        catch { controllers.delete(controller); }
    }
    if (controllers.size === 0) userClients.delete(userId);
}

/**
 * Fetch unread count and push to a specific user
 */
export async function pushUnreadCount(userId: string) {
    const unreadCount = await prisma.userNotification.count({
        where: { userId, isRead: false }
    });
    sendUserEvent(userId, 'unread-count', { unreadCount });
}

/**
 * Push a new notification event + updated unread count to a user.
 * Delivery channels (fan-out):
 *   1. SSE (if tab is open) — instant in-app badge
 *   2. Web Push (if user subscribed) — OS-level alert even if tab closed
 */
export async function pushNotification(userId: string, notification: { title: string; message: string; type: string; url?: string }) {
    const unreadCount = await prisma.userNotification.count({
        where: { userId, isRead: false }
    });
    sendUserEvent(userId, 'new-notification', { ...notification, unreadCount });

    // Lazy import to avoid circular deps and keep web-push optional.
    // sendToUser() silently returns 0 if VAPID is not configured.
    try {
        const { sendToUser } = await import('./web-push-service');
        await sendToUser(userId, {
            title: notification.title,
            body: notification.message,
            tag: notification.type,
            url: notification.url || '/',
            data: { type: notification.type },
        });
    } catch (err) {
        console.warn('[pushNotification] web-push delivery failed:', err instanceof Error ? err.message : err);
    }
}

// ============================================================
// Routes
// ============================================================

export const adminSSERoutes = new Elysia({ prefix: "/admin" })
    .use(jwtPlugin())
    .get("/sse", async ({ jwt, query, set }) => {
        const token = query.token;
        if (!token) { set.status = 401; return { error: 'Unauthorized', message: 'Token required' }; }
        const payload = await jwt.verify(token);
        if (!payload) { set.status = 401; return { error: 'Unauthorized', message: 'Invalid token' }; }

        const stream = new ReadableStream({
            start(controller) {
                adminClients.add(controller);
                // Send initial counts
                Promise.all([
                    prisma.vehicleListing.count({ where: { status: 'PENDING' } }),
                    prisma.packageTransaction.count({ where: { status: 'PENDING' } }),
                    prisma.listingRenewal.count({ where: { status: 'PENDING' } }),
                ]).then(([pendingListings, pendingUpgrades, pendingRenewals]) => {
                    const msg = `event: pending-update\ndata: ${JSON.stringify({ pendingListings, pendingUpgrades, pendingRenewals })}\n\n`;
                    try { controller.enqueue(new TextEncoder().encode(msg)); } catch { /* closed */ }
                });
                // Heartbeat
                const heartbeat = setInterval(() => {
                    try { controller.enqueue(new TextEncoder().encode(": heartbeat\n\n")); }
                    catch { clearInterval(heartbeat); adminClients.delete(controller); }
                }, 30_000);
                controller.enqueue(new TextEncoder().encode("retry: 3000\n\n"));
            },
            cancel(controller) { adminClients.delete(controller); }
        });

        return new Response(stream, {
            headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' }
        });
    });

export const userSSERoutes = new Elysia({ prefix: "/notifications" })
    .use(jwtPlugin())
    .get("/sse", async ({ jwt, query, set }) => {
        const token = query.token;
        if (!token) { set.status = 401; return { error: 'Unauthorized', message: 'Token required' }; }
        const payload = await jwt.verify(token) as { userId?: string } | false;
        if (!payload || !payload.userId) { set.status = 401; return { error: 'Unauthorized', message: 'Invalid token' }; }

        const userId = payload.userId;

        const stream = new ReadableStream({
            start(controller) {
                // Register user client
                if (!userClients.has(userId)) userClients.set(userId, new Set());
                userClients.get(userId)!.add(controller);

                // Send initial unread count
                prisma.userNotification.count({ where: { userId, isRead: false } })
                    .then(unreadCount => {
                        const msg = `event: unread-count\ndata: ${JSON.stringify({ unreadCount })}\n\n`;
                        try { controller.enqueue(new TextEncoder().encode(msg)); } catch { /* closed */ }
                    });

                // Heartbeat
                const heartbeat = setInterval(() => {
                    try { controller.enqueue(new TextEncoder().encode(": heartbeat\n\n")); }
                    catch {
                        clearInterval(heartbeat);
                        const set = userClients.get(userId);
                        if (set) { set.delete(controller); if (set.size === 0) userClients.delete(userId); }
                    }
                }, 30_000);

                controller.enqueue(new TextEncoder().encode("retry: 3000\n\n"));
            },
            cancel(controller) {
                const set = userClients.get(userId);
                if (set) { set.delete(controller); if (set.size === 0) userClients.delete(userId); }
            }
        });

        return new Response(stream, {
            headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' }
        });
    });
