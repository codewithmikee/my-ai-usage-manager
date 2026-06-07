import React from 'react';
import { cn } from '@/lib/utils';

interface CycleChipProps {
  name: string;
  color: 'amber' | 'violet' | 'blue' | 'rose' | 'emerald';
  countdown?: string;
  onClick?: () => void;
  className?: string;
}

export function CycleChip({ name, color, countdown, onClick, className }: CycleChipProps) {
  const colorClasses = {
    amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-900/30',
    violet: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-900/30',
    blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-900/30',
    rose: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-900/30',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-900/30',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'px-2 py-0.5 rounded-md border text-[10px] font-semibold transition-all flex items-center gap-1.5 select-none',
        colorClasses[color],
        onClick ? 'cursor-pointer hover:brightness-95 active:scale-95' : 'cursor-default',
        className
      )}
    >
      <span className="opacity-70 uppercase tracking-tight">{name}</span>
      {countdown && (
        <>
          <span className="w-1 h-1 rounded-full bg-current opacity-30" />
          <span className="font-mono">{countdown}</span>
        </>
      )}
    </button>
  );
}
