/* Car2Hand Service Worker
 *
 * Scope: / (root)
 * Responsibilities:
 *   1. Web Push — receive push events from backend, show OS-level notifications
 *   2. Notification click — focus existing tab or open the target URL
 *   3. Lifecycle — claim clients immediately so updates take effect on first load
 *
 * No offline cache yet — we keep this minimal and focused on push.
 * Next.js app is served by the server, so full offline would require workbox setup.
 */

const SW_VERSION = 'v1.0.0';
const CACHE_NAME = `car2hand-${SW_VERSION}`;

self.addEventListener('install', (event) => {
  // Activate immediately on first install
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clean up old caches from previous versions
      const names = await caches.keys();
      await Promise.all(
        names.filter((n) => n.startsWith('car2hand-') && n !== CACHE_NAME).map((n) => caches.delete(n)),
      );
      // Claim all open tabs so the new SW controls them without a reload
      await self.clients.claim();
    })(),
  );
});

/* ─── Push handler ─────────────────────────────────────────────────────────
 * Expected payload shape (JSON):
 *   {
 *     title: string,
 *     body: string,
 *     icon?: string,     // defaults to /icons/icon-192.png
 *     badge?: string,    // defaults to /icons/badge-72.png
 *     image?: string,    // large hero image shown in notification
 *     url?: string,      // where to send the user on click
 *     tag?: string,      // groups/replaces notifications with same tag
 *     data?: object,     // anything extra — available via notification.data
 *   }
 * If payload is absent (silent push), we show a generic fallback.
 */
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: 'Car2Hand', body: event.data ? event.data.text() : 'คุณมีการแจ้งเตือนใหม่' };
  }

  const title = payload.title || 'Car2Hand';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/icons/icon-192.png',
    badge: payload.badge || '/icons/badge-72.png',
    image: payload.image,
    tag: payload.tag,
    renotify: Boolean(payload.tag),
    requireInteraction: Boolean(payload.requireInteraction),
    data: {
      url: payload.url || '/',
      ...payload.data,
    },
    lang: 'th-TH',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

/* ─── Notification click — focus or open tab ──────────────────────────── */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      // Prefer an already-open tab at the target URL
      for (const client of allClients) {
        const url = new URL(client.url);
        if (url.pathname === targetUrl || client.url.includes(targetUrl)) {
          await client.focus();
          return;
        }
      }
      // Otherwise focus any tab and navigate it
      if (allClients.length > 0) {
        const client = allClients[0];
        await client.focus();
        if ('navigate' in client) {
          await client.navigate(targetUrl);
        }
        return;
      }
      // No open tabs — open a new one
      await self.clients.openWindow(targetUrl);
    })(),
  );
});

/* Optional: handle pushsubscriptionchange (browser rotates the endpoint).
 * Ask the client to re-subscribe. The subscribe hook will replay against the backend. */
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({ type: 'window' });
      for (const client of clients) {
        client.postMessage({ type: 'PUSH_SUBSCRIPTION_CHANGED' });
      }
    })(),
  );
});
