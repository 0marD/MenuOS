'use client';

import { useEffect } from 'react';
import { savePushSubscription } from '@/lib/push/actions';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export function PushSubscriber() {
  useEffect(() => {
    if (!VAPID_PUBLIC_KEY || !('serviceWorker' in navigator) || !('PushManager' in window)) return;

    async function subscribe() {
      try {
        const reg = await navigator.serviceWorker.ready;

        // Check if already subscribed
        const existing = await reg.pushManager.getSubscription();
        if (existing) {
          // Refresh registration in DB
          await savePushSubscription({
            endpoint: existing.endpoint,
            keys: {
              p256dh: btoa(String.fromCharCode(...new Uint8Array(existing.getKey('p256dh')!))),
              auth: btoa(String.fromCharCode(...new Uint8Array(existing.getKey('auth')!))),
            },
          });
          return;
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const uint8 = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        // Ensure plain ArrayBuffer (not SharedArrayBuffer) for PushManager
        const appKey = new Uint8Array(uint8).buffer as ArrayBuffer;
        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: appKey,
        });

        await savePushSubscription({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(
              String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!)),
            ),
            auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
          },
        });
      } catch {
        // Non-critical — push notifications are enhancement only
      }
    }

    subscribe();

    return () => {
      // Optionally remove subscription on unmount (logout)
      // navigator.serviceWorker.ready.then(reg =>
      //   reg.pushManager.getSubscription().then(sub => {
      //     if (sub) { removePushSubscription(sub.endpoint); sub.unsubscribe(); }
      //   })
      // );
    };
  }, []);

  return null;
}
