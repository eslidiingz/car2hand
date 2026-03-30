/**
 * User Notification Routes
 * API สำหรับระบบแจ้งเตือนผู้ใช้
 */

import { Elysia, t } from "elysia";
import prisma from "./db";
import { jwtPlugin, isTokenBlacklisted, JWTPayload } from "./jwt";

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
    });
