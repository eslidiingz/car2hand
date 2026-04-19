/**
 * Web Push service — wraps node-web-push with Car2Hand-specific helpers.
 *
 * - Lazily configures VAPID once from env
 * - sendToUser()   → all of the user's subscriptions (fan-out)
 * - sendToAll()    → broadcast (admin-only callers)
 * - cleanupGone()  → removes 404/410 subscriptions so we don't retry forever
 *
 * If VAPID env vars are missing, methods become no-ops (logged once) so the
 * rest of the notification pipeline (SSE, LINE, in-app) keeps working.
 */

import webpush, { type PushSubscription as WebPushSub, WebPushError } from 'web-push';
import prisma from './db';

let configured = false;
let warnedMissing = false;

function ensureConfigured(): boolean {
  if (configured) return true;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@car2hand.app';

  if (!publicKey || !privateKey) {
    if (!warnedMissing) {
      console.warn('[web-push] VAPID keys not configured — push notifications disabled');
      warnedMissing = true;
    }
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: Record<string, unknown>;
}

async function sendToSubscription(sub: { endpoint: string; p256dh: string; auth: string }, payload: PushPayload): Promise<'ok' | 'gone' | 'error'> {
  const webSub: WebPushSub = {
    endpoint: sub.endpoint,
    keys: { p256dh: sub.p256dh, auth: sub.auth },
  };
  try {
    await webpush.sendNotification(webSub, JSON.stringify(payload), {
      TTL: 60 * 60 * 24, // 24h — drop old pushes if device is offline that long
      urgency: 'normal',
    });
    return 'ok';
  } catch (err) {
    // 404/410 = subscription is invalid / user revoked → remove it
    if (err instanceof WebPushError && (err.statusCode === 404 || err.statusCode === 410)) {
      return 'gone';
    }
    console.warn('[web-push] send failed:', err instanceof Error ? err.message : err);
    return 'error';
  }
}

/** Send to every active subscription owned by userId. Returns count delivered. */
export async function sendToUser(userId: string, payload: PushPayload): Promise<number> {
  if (!ensureConfigured()) return 0;

  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subs.length === 0) return 0;

  let delivered = 0;
  const goneIds: string[] = [];

  await Promise.all(
    subs.map(async (sub) => {
      const result = await sendToSubscription(sub, payload);
      if (result === 'ok') {
        delivered++;
        // Fire-and-forget touch — not critical if this fails
        prisma.pushSubscription.update({
          where: { id: sub.id },
          data: { lastUsedAt: new Date() },
        }).catch(() => undefined);
      } else if (result === 'gone') {
        goneIds.push(sub.id);
      }
    }),
  );

  if (goneIds.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: goneIds } } });
  }

  return delivered;
}

/** Broadcast to every active subscription in the DB. Admin-only callers. */
export async function sendToAll(payload: PushPayload): Promise<number> {
  if (!ensureConfigured()) return 0;

  const subs = await prisma.pushSubscription.findMany();
  if (subs.length === 0) return 0;

  let delivered = 0;
  const goneIds: string[] = [];

  await Promise.all(
    subs.map(async (sub) => {
      const result = await sendToSubscription(sub, payload);
      if (result === 'ok') delivered++;
      else if (result === 'gone') goneIds.push(sub.id);
    }),
  );

  if (goneIds.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: goneIds } } });
  }

  return delivered;
}

export function isConfigured(): boolean {
  return ensureConfigured();
}

export function getPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY || null;
}
