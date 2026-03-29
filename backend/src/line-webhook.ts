/**
 * LINE Webhook Handler
 * Receives and processes LINE platform events (no auth required)
 */

import { Elysia } from "elysia";
import prisma from "./db";
import { getLineSettings } from "./line";
import { createHmac } from "crypto";

export const lineWebhookRoutes = new Elysia({ prefix: "/line" })
    .post("/webhook", async ({ request, set }) => {
        const body = await request.text();
        const signature = request.headers.get('x-line-signature');

        // Validate signature
        const settings = await getLineSettings();
        if (!settings.channelSecret) { set.status = 400; return { message: "LINE not configured" }; }

        const hash = createHmac('SHA256', settings.channelSecret)
            .update(body)
            .digest('base64');

        if (hash !== signature) { set.status = 403; return { message: "Invalid signature" }; }

        const data = JSON.parse(body);

        // Handle events
        for (const event of data.events || []) {
            if (event.type === 'follow') {
                console.log(`[LINE Webhook] New follower: ${event.source.userId}`);
            } else if (event.type === 'unfollow') {
                console.log(`[LINE Webhook] Unfollowed: ${event.source.userId}`);
            }
        }

        return { status: 'ok' };
    });
