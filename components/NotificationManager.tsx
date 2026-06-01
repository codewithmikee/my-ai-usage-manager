import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { isPast } from 'date-fns';

export function NotificationManager() {
  const products = useStore((state) => state.products);
  const markNotified = useStore((state) => state.markNotified);
  const markNextResetNotified = useStore((state) => state.markNextResetNotified);

  useEffect(() => {
    const checkNotifications = () => {
      if (Notification.permission !== 'granted') return;

      products.forEach((product) => {
        product.accounts.forEach((account) => {
          // 1. Hard Availability Locks
          if (
            account.availableAt !== null &&
            isPast(account.availableAt) &&
            !account.notified
          ) {
            new Notification(`${product.name} is Ready`, {
              body: `${account.name} is now available to use.`,
              icon: '/favicon.ico',
            });

            markNotified(product.id, account.id);
          }

          // 2. Scheduled Background Reset Cycles
          if (
            account.nextResetAt !== undefined &&
            account.nextResetAt !== null &&
            isPast(account.nextResetAt) &&
            !account.nextResetNotified
          ) {
            new Notification(`${product.name} Cycle Reset`, {
              body: `The background usage cycle for ${account.name} has reset!`,
              icon: '/favicon.ico',
            });

            markNextResetNotified(product.id, account.id);
          }
        });
      });
    };

    checkNotifications();
    const intervalId = setInterval(checkNotifications, 10000);

    return () => clearInterval(intervalId);
  }, [products, markNotified, markNextResetNotified]);

  return null;
}
