import React, { useEffect, useState } from 'react';
import { Account, useStore } from '@/lib/store';
import { EditableText } from './EditableText';
import { Trash2, Clock, RefreshCcw } from 'lucide-react';
import { LimitTimerPopover } from './LimitTimerPopover';
import { formatDistanceToNow, isPast, differenceInSeconds } from 'date-fns';
import { cn } from '@/lib/utils';

interface AccountRowProps {
  productId: string;
  account: Account;
  key?: string | number;
}

function formatCountdown(targetTime: number) {
  const diff = differenceInSeconds(targetTime, Date.now());
  if (diff <= 0) return '00:00:00';
  
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function AccountRow({ productId, account }: AccountRowProps) {
  const updateAccount = useStore((state) => state.updateAccount);
  const removeAccount = useStore((state) => state.removeAccount);
  const setAvailableAt = useStore((state) => state.setAvailableAt);
  const setNextResetAt = useStore((state) => state.setNextResetAt);
  const showCountdown = useStore((state) => state.settings?.showCountdown);

  const [tick, setTick] = useState(0);

  // Force re-render periodically to update the display
  useEffect(() => {
    // If showCountdown is true, tick every second, else every minute
    const intervalTime = showCountdown ? 1000 : 60000;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, intervalTime);
    return () => clearInterval(interval);
  }, [showCountdown]);

  const isAvailable = account.availableAt === null || isPast(account.availableAt);
  const hasNextReset = account.nextResetAt !== undefined && account.nextResetAt !== null && !isPast(account.nextResetAt);

  return (
    <div className="flex items-center px-3 py-2.5 rounded-xl transition-colors group relative bg-transparent hover:bg-gray-50/60 dark:hover:bg-white/5 justify-between">
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <div className={cn(
          "w-2 h-2 rounded-full flex-shrink-0 transition-transform duration-300 group-hover:scale-110",
          isAvailable 
            ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
            : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
        )} />
        
        <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[200px_auto] md:grid-cols-[240px_auto] lg:grid-cols-[280px_auto] items-center gap-4 min-w-0 flex-1">
          <div className="min-w-0">
            <EditableText 
              value={account.name} 
              onChange={(val) => updateAccount(productId, account.id, val)}
              textClassName={cn(
                "text-sm font-medium truncate tracking-tight transition-colors duration-200 block max-w-full", 
                isAvailable 
                  ? "text-gray-800 dark:text-gray-200" 
                  : "text-amber-700/90 dark:text-amber-500/90"
              )}
              trigger="doubleClick"
            />
          </div>

          <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
            <LimitTimerPopover 
              availableAt={account.availableAt} 
              onSetTime={(time) => setAvailableAt(productId, account.id, time)}
              title="Set Lock Restriction Time"
              clearLabel="Clear Lock"
            >
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Set Availability Lock"
              >
                <Clock className="w-3.5 h-3.5" />
              </div>
            </LimitTimerPopover>

            <LimitTimerPopover 
              availableAt={account.nextResetAt || null} 
              onSetTime={(time) => setNextResetAt(productId, account.id, time)}
              title="Set Next Cycle Reset"
              clearLabel="Clear Cycle Timer"
            >
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors cursor-pointer"
                title="Set Background Cycle Reset"
              >
                <RefreshCcw className="w-3 h-3 text-gray-400 hover:text-violet-500" />
              </div>
            </LimitTimerPopover>

            <button 
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/25 transition-colors cursor-pointer"
              onClick={(e) => {
                 e.stopPropagation();
                 removeAccount(productId, account.id);
              }}
              title="Delete Account"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
        {!isAvailable && account.availableAt ? (
          <span className="text-xs font-mono font-semibold text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 px-2.5 py-0.5 rounded-md select-none border border-amber-200/50 dark:border-amber-900/30">
            {showCountdown ? formatCountdown(account.availableAt) : formatDistanceToNow(account.availableAt)}
          </span>
        ) : (
          hasNextReset && account.nextResetAt && (
            <span className="text-xs font-mono font-medium text-violet-600 dark:text-violet-400 bg-violet-50/80 dark:bg-violet-500/10 px-2.5 py-0.5 rounded-md select-none flex items-center gap-1.5 border border-violet-100/40 dark:border-violet-900/15">
              <RefreshCcw className="w-2.5 h-2.5 animate-spin text-violet-500" style={{ animationDuration: '6s' }} />
              <span className="text-[9px] text-violet-400 dark:text-violet-500 font-bold uppercase tracking-wider">Reset in:</span>
              <span>{showCountdown ? formatCountdown(account.nextResetAt) : formatDistanceToNow(account.nextResetAt)}</span>
            </span>
          )
        )}
      </div>
    </div>
  );
}
