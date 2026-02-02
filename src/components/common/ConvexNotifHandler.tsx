import { useQuery } from 'convex/react';
import { useEffect, useRef, useState } from 'react';
import { api } from '../../../convex/_generated/api';

// Register service worker for notifications
async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      `${import.meta.env.BASE_URL || '/'}sw.js`,
    );
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}

// Show notification using service worker (works on mobile and desktop)
async function showNotification(title: string, options: NotificationOptions): Promise<void> {
  // Wait for the service worker to be ready
  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification(title, options);
}

export default function ConvexNotifHandler() {
  const userData = useQuery(api.home.home_get.getUserData);
  const [oldNotifTimestamp, setOldNotifTimestamp] = useState<number | null>(null);
  const swRegistered = useRef(false);

  // Register service worker on mount
  useEffect(() => {
    if (!swRegistered.current) {
      swRegistered.current = true;
      registerServiceWorker();
    }
  }, []);

  useEffect(() => {
    if (userData && userData.notification) {
      const notif = userData.notification;

      if (oldNotifTimestamp !== null) {
        // if the value changes from false to true, that's a notif
        if (notif.timestamp !== oldNotifTimestamp) {
          if ('serviceWorker' in navigator) {
            showNotification(notif.title, {
              body: notif.body,
              requireInteraction: true,
            });
          }
        }
      }
      setOldNotifTimestamp(notif.timestamp);
    }
  }, [userData]);

  return <></>;
}
