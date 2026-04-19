"use client";

import { useEffect } from 'react';

/**
 * Registers the root-scoped service worker for PWA + Web Push.
 *
 * - Only runs in production to avoid caching issues during dev
 *   (set NEXT_PUBLIC_ENABLE_SW=true to force it in dev)
 * - Silent failure — if the browser blocks SW, the app still works
 *   (SSE fallback covers realtime notifications)
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const enabledInDev = process.env.NEXT_PUBLIC_ENABLE_SW === 'true';
    if (process.env.NODE_ENV !== 'production' && !enabledInDev) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      } catch (err) {
        // Non-fatal — log but don't throw
        console.warn('[SW] registration failed:', err);
      }
    };

    // Register after the window load event so we don't compete with initial paint
    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
    }
  }, []);

  return null;
}
