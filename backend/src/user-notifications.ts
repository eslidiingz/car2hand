/**
 * User Notification Routes
 * API สำหรับระบบแจ้งเตือนผู้ใช้
 */

import { Elysia, t } from "elysia";
import prisma from "./db";
import { jwtPlugin, isTokenBlacklisted, JWTPayload } from "./jwt";
import { getPublicKey, isConfigured, sendToUser } from "./web-push-service";

export const userNotificationRoutes = new Elysia({ prefix: '/notifications' })
    .use(jwtPlugin())

    // Get user's notifications
    .get('/', async ({ jwt, request, set, query }) => {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) { set.status = 401; return { error: 'Unauthorized' }; }
        const token = authHeader.substring(7);
        if (isTokenBlacklisted(token)) { set.status = 401; return { error: 'Unauthorized' }; }
        const payload = await jwt.verify(token) as JWTPayload | false;
        if (!payload) { set.status = 401; return { error: 'Unauthorized' }; }

        const page = parseInt(query.page as string || '1');
        const limit = parseInt(query.limit as string || '20');
        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            prisma.userNotification.findMany({
                where: { userId: payload.userId },
                orderBy: { createdAt: 'desc' },
                skip, take: limit,
            }),
            prisma.userNotification.count({ where: { userId: payload.userId } })
        ]);

        return { notifications, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    })

    // Unread count
    .get('/unread-count', async ({ jwt, request, set }) => {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) { set.status = 401; return { count: 0 }; }
        const token = authHeader.substring(7);
        if (isTokenBlacklisted(token)) { set.status = 401; return { count: 0 }; }
        const payload = await jwt.verify(token) as JWTPayload | false;
        if (!payload) { set.status = 401; return { count: 0 }; }

        const count = await prisma.userNotification.count({
            where: { userId: payload.userId, isRead: false }
        });
        return { count };
    })

    // Mark one as read
    .put('/:id/read', async ({ params, jwt, request, set }) => {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) { set.status = 401; return { error: 'Unauthorized' }; }
        const token = authHeader.substring(7);
        const payload = await jwt.verify(token) as JWTPayload | false;
        if (!payload) { set.status = 401; return { error: 'Unauthorized' }; }

        await prisma.userNotification.updateMany({
            where: { id: params.id, userId: payload.userId },
            data: { isRead: true }
        });
        return { message: 'ok' };
    })

    // Mark all as read
    .put('/read-all', async ({ jwt, request, set }) => {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) { set.status = 401; return { error: 'Unauthorized' }; }
        const token = authHeader.substring(7);
        const payload = await jwt.verify(token) as JWTPayload | false;
        if (!payload) { set.status = 401; return { error: 'Unauthorized' }; }

        await prisma.userNotification.updateMany({
            where: { userId: payload.userId, isRead: false },
            data: { isRead: true }
        });
        return { message: 'ok' };
    })

    /* ─── Web Push Subscription ───────────────────────────────────────────
     * Public key is exposed unauthenticated (safe — it's a public key).
     * Subscribe/unsubscribe require auth because we bind to userId.
     */

    // Return the server's VAPID public key so the browser can subscribe
    .get('/push/public-key', () => {
        return { publicKey: getPublicKey(), enabled: isConfigured() };
    })

    // Register a push subscription for the current user
    .post('/push/subscribe', async ({ jwt, request, set, body }) => {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) { set.status = 401; return { error: 'Unauthorized' }; }
        const token = authHeader.substring(7);
        if (isTokenBlacklisted(token)) { set.status = 401; return { error: 'Unauthorized' }; }
        const payload = await jwt.verify(token) as JWTPayload | false;
        if (!payload) { set.status = 401; return { error: 'Unauthorized' }; }

        const { endpoint, keys } = body as { endpoint: string; keys: { p256dh: string; auth: string } };
        const userAgent = request.headers.get('user-agent') || null;

        // Upsert by endpoint — if the same device re-subscribes, update its owner
        await prisma.pushSubscription.upsert({
            where: { endpoint },
            create: {
                endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth,
                userAgent,
                userId: payload.userId,
            },
            update: {
                p256dh: keys.p256dh,
                auth: keys.auth,
                userAgent,
                userId: payload.userId,
                lastUsedAt: new Date(),
            },
        });
        return { message: 'subscribed' };
    }, {
        body: t.Object({
            endpoint: t.String(),
            keys: t.Object({
                p256dh: t.String(),
                auth: t.String(),
            }),
        }),
    })

    // Remove a push subscription (e.g. when user disables notifications or logs out)
    .post('/push/unsubscribe', async ({ jwt, request, set, body }) => {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) { set.status = 401; return { error: 'Unauthorized' }; }
        const token = authHeader.substring(7);
        const payload = await jwt.verify(token) as JWTPayload | false;
        if (!payload) { set.status = 401; return { error: 'Unauthorized' }; }

        const { endpoint } = body as { endpoint: string };
        await prisma.pushSubscription.deleteMany({
            where: { endpoint, userId: payload.userId },
        });
        return { message: 'unsubscribed' };
    }, {
        body: t.Object({ endpoint: t.String() }),
    })

    // Send a test push to the current user (useful for the "test" button in UI)
    .post('/push/test', async ({ jwt, request, set }) => {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) { set.status = 401; return { error: 'Unauthorized' }; }
        const token = authHeader.substring(7);
        const payload = await jwt.verify(token) as JWTPayload | false;
        if (!payload) { set.status = 401; return { error: 'Unauthorized' }; }

        const delivered = await sendToUser(payload.userId, {
            title: 'Car2Hand',
            body: 'การแจ้งเตือนทำงานปกติ 🎉',
            tag: 'test-push',
            url: '/',
        });
        return { delivered };
    });
