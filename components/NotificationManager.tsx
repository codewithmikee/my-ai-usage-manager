import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { isPast } from 'date-fns';

export function NotificationManager() {
  const products = useStore((state) => state.products);
  const markNotified = useStore((state) => state.markNotified);

  useEffect(() => {
    const checkNotifications = () => {
      if (Notification.permission !== 'granted') return;

      products.forEach((product) => {
        product.accounts.forEach((account) => {
          if (
            account.availableAt !== null &&
            isPast(account.availableAt) &&
            !account.notified
          ) {
            // Trigger notification
            const notification = new Notification(`${product.name} is Ready`, {
              body: `${account.name} is now available to use.`,
              icon: '/favicon.ico', // assuming there's a default favicon, or just omit
            });

            // Mark as notified so we don't trigger it again
            markNotified(product.id, account.id);
          }
        });
      });
    };

    // Check immediately on mount, and then every 20 seconds
    checkNotifications();
    const intervalId = setInterval(checkNotifications, 20000);

    return () => clearInterval(intervalId);
  }, [products, markNotified]);

  return null;
}
