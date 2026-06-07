import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { isPast } from 'date-fns';

export function NotificationManager() {
  const products = useStore((state) => state.products);
  const markNotified = useStore((state) => state.markNotified);

  useEffect(() => {
    const checkNotifications = () => {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      if (window.Notification.permission !== 'granted') return;

      products.forEach((product) => {
        product.accounts.forEach((account) => {
          // Iterate through all limits
          Object.entries(account.limits || {}).forEach(([cycleId, limit]) => {
            if (
              limit.until !== null &&
              isPast(limit.until) &&
              !limit.notified
            ) {
              const cycle = product.cycles.find(c => c.id === cycleId);
              const cycleName = cycle?.name || 'Limit';

              new window.Notification(`${product.name}: ${cycleName} Ready`, {
                body: `${account.name} has finished its ${cycleName.toLowerCase()} period.`,
                icon: '/favicon.ico',
              });

              markNotified(product.id, account.id, cycleId);
            }
          });

          // Legacy fallback for unmigrated data (if any remains)
          if (
            account.availableAt !== null &&
            isPast(account.availableAt) &&
            !account.notified
          ) {
             // We don't want double notifications if it was already caught by 'lock' cycle
             // but markNotified handles the legacy flag too.
             markNotified(product.id, account.id, 'lock');
          }
        });
      });
    };

    checkNotifications();
    // No need for a separate interval here if we want to be perfectly synced, 
    // but 10s is fine for battery/perf. 
    // Actually, Task 1.3 says "call clearExpiredLimits after notifying" - 
    // but the shared ticker already calls clearExpiredLimits.
    // So we should just poll for notifications.
    const intervalId = setInterval(checkNotifications, 5000);

    return () => clearInterval(intervalId);
  }, [products, markNotified]);

  return null;
}
