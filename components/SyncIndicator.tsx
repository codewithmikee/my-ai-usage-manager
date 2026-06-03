import { Cloud, CloudCheck, CloudOff } from 'lucide-react';
import { useSyncStore } from '@/lib/syncStore';
import { cn } from '@/lib/utils';

export function SyncIndicator() {
  const status = useSyncStore((s) => s.status);

  const label = {
    idle: 'Synced',
    syncing: 'Syncing…',
    synced: 'Synced',
    error: 'Sync error',
  }[status];

  return (
    <div
      title={label}
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all duration-300 select-none',
        status === 'syncing' && 'text-blue-500 dark:text-blue-400',
        status === 'synced' && 'text-emerald-600 dark:text-emerald-400',
        status === 'error' && 'text-red-500 dark:text-red-400',
        status === 'idle' && 'text-gray-300 dark:text-white/20',
      )}
    >
      {status === 'syncing' && (
        <Cloud className="w-3.5 h-3.5 animate-pulse" />
      )}
      {(status === 'synced' || status === 'idle') && (
        <CloudCheck className="w-3.5 h-3.5" />
      )}
      {status === 'error' && (
        <CloudOff className="w-3.5 h-3.5" />
      )}
      <span className={cn(
        'hidden sm:inline transition-opacity duration-300',
        status === 'idle' ? 'opacity-0' : 'opacity-100'
      )}>
        {label}
      </span>
    </div>
  );
}
