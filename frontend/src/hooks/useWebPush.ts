"use client";

import { useCallback, useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

interface UseWebPushResult {
  /** True if the browser supports Notification + PushManager + Service Worker. */
  supported: boolean;
  /** Current OS notification permission. */
  permission: PermissionState;
  /** True if this device is currently subscribed on the server. */
  subscribed: boolean;
  /** Initial async probe finished. Avoids flicker in UI. */
  ready: boolean;
  /** Pending network call — disable buttons while true. */
  busy: boolean;
  /** Prompt the user + register subscription with backend. */
  subscribe: () => Promise<boolean>;
  /** Remove subscription both locally and on backend. */
  unsubscribe: () => Promise<boolean>;
  /** Fires a server-side test push to the current user's subscriptions. */
  sendTest: () => Promise<boolean>;
}

/** Convert a URL-safe base64 VAPID key to the Uint8Array the Push API expects. */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    return parsed.token || parsed.accessToken || null;
  } catch {
    return null;
  }
}

async function authFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = getAuthToken();
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });
}

/**
 * Web Push subscription lifecycle hook.
 *
 * Usage:
 *   const { supported, subscribed, subscribe, unsubscribe } = useWebPush();
 *   <button onClick={subscribed ? unsubscribe : subscribe}>
 *     {subscribed ? 'ปิดการแจ้งเตือน' : 'เปิดการแจ้งเตือน'}
 *   </button>
 */
export function useWebPush(): UseWebPushResult {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<PermissionState>('default');
  const [subscribed, setSubscribed] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  // Initial probe: detect support + existing subscription
  useEffect(() => {
    let cancelled = false;

    async function probe() {
      if (typeof window === 'undefined') return;
      const hasAll =
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;

      if (!hasAll) {
        if (!cancelled) {
          setSupported(false);
          setPermission('unsupported');
          setReady(true);
        }
        return;
      }

      setSupported(true);
      setPermission(Notification.permission as PermissionState);

      try {
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        if (!cancelled) setSubscribed(!!existing);
      } catch {
        if (!cancelled) setSubscribed(false);
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    probe();

    // Rotate: backend may ask us to re-subscribe if keys change
    function onMessage(event: MessageEvent) {
      if (event.data?.type === 'PUSH_SUBSCRIPTION_CHANGED') {
        probe();
      }
    }
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', onMessage);
    }

    return () => {
      cancelled = true;
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', onMessage);
      }
    };
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!supported || !VAPID_PUBLIC_KEY) return false;
    setBusy(true);
    try {
      // Ensure the SW is registered and active
      const reg = await navigator.serviceWorker.ready;

      // Ask for permission if we haven't already
      let perm = Notification.permission;
      if (perm === 'default') {
        perm = await Notification.requestPermission();
        setPermission(perm as PermissionState);
      }
      if (perm !== 'granted') return false;

      // Reuse existing subscription if possible (avoids churn on the push endpoint)
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        // Cast through BufferSource — TS strict mode rejects `Uint8Array<ArrayBufferLike>`
        // vs the PushSubscriptionOptions.applicationServerKey signature which expects
        // `Uint8Array<ArrayBuffer>`. Runtime behavior is identical.
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
        });
      }

      // Send to backend — tie this endpoint to current user
      const json = sub.toJSON();
      const res = await authFetch('/notifications/push/subscribe', {
        method: 'POST',
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
        }),
      });
      if (!res.ok) {
        // Backend rejected — roll back the browser subscription to avoid ghost state
        await sub.unsubscribe().catch(() => undefined);
        return false;
      }
      setSubscribed(true);
      return true;
    } catch (err) {
      console.warn('[useWebPush] subscribe failed:', err);
      return false;
    } finally {
      setBusy(false);
    }
  }, [supported]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!supported) return false;
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe().catch(() => undefined);
        // Best-effort — server cleanup
        await authFetch('/notifications/push/unsubscribe', {
          method: 'POST',
          body: JSON.stringify({ endpoint }),
        }).catch(() => undefined);
      }
      setSubscribed(false);
      return true;
    } finally {
      setBusy(false);
    }
  }, [supported]);

  const sendTest = useCallback(async (): Promise<boolean> => {
    const res = await authFetch('/notifications/push/test', { method: 'POST' });
    return res.ok;
  }, []);

  return { supported, permission, subscribed, ready, busy, subscribe, unsubscribe, sendTest };
}
