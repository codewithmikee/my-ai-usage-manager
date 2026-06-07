import { useEffect } from 'react';
import { useStore } from './store';

export function useAppTicker() {
  const clearExpiredLimits = useStore((state) => state.clearExpiredLimits);
  const showCountdown = useStore((state) => state.settings.showCountdown);

  useEffect(() => {
    // Tick every second if showing countdown, otherwise every minute is enough
    // But clearExpiredLimits should probably run every second to be responsive
    const intervalTime = showCountdown ? 1000 : 1000; 
    
    const interval = setInterval(() => {
      clearExpiredLimits();
    }, intervalTime);

    return () => clearInterval(interval);
  }, [clearExpiredLimits, showCountdown]);
}
