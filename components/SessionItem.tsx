import React, { useState } from 'react';
import { SessionItem as SessionItemType } from '@/lib/store';
import { Cycle } from '@/lib/cycles';
import { formatDistanceToNow, isPast } from 'date-fns';
import { X, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateTimePicker } from './DateTimePicker';
import { ConfirmDialog } from './ConfirmDialog';

interface SessionItemProps {
  cycleId: string;
  session: SessionItemType;
  cycle: Cycle | undefined;
  onToggle: () => void;
  onRemove: () => void;
  onUpdateTime: (timestamp: number | null) => void;
  onEditClick?: () => void;
}

export function SessionItem({
  cycleId,
  session,
  cycle,
  onToggle,
  onRemove,
  onUpdateTime,
  onEditClick,
}: SessionItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isReached = session.state === 'reached';
  const isExpired = isReached && session.availableAt && isPast(session.availableAt);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all border',
        isReached && !isExpired
          ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-700/50 text-amber-700 dark:text-amber-400'
          : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-400'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Status indicator and cycle name */}
      <button
        onClick={onToggle}
        className="inline-flex items-center gap-1 cursor-pointer hover:opacity-75 transition-opacity"
        title="Click to toggle"
      >
        <div
          className={cn(
            'w-1.5 h-1.5 rounded-full flex-shrink-0',
            isReached && !isExpired ? 'bg-amber-500' : 'bg-emerald-500'
          )}
        />
        <span className="whitespace-nowrap">{cycle?.name || cycleId}</span>
      </button>

      {/* Time display */}
      {isReached && session.availableAt && (
        <span className="text-[10px] whitespace-nowrap flex-shrink-0">
          {isExpired ? '✓' : formatDistanceToNow(session.availableAt, { addSuffix: true })}
        </span>
      )}

      {/* Edit/Delete actions (shown on hover) */}
      {isHovered && (
        <div className="inline-flex items-center gap-0.5 ml-0.5">
          <Popover>
            <PopoverTrigger>
              <button
                className={cn(
                  'p-0.5 rounded transition-colors',
                  isReached && !isExpired
                    ? 'text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-950/50'
                    : 'text-emerald-600 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-950/50'
                )}
                title="Edit time"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="end">
              <DateTimePicker
                value={session.availableAt}
                onChange={onUpdateTime}
                label={`Available At (${cycle?.name || cycleId})`}
                showClear={true}
              />
            </PopoverContent>
          </Popover>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className={cn(
              'p-0.5 rounded transition-colors',
              isReached && !isExpired
                ? 'text-amber-600 hover:text-red-600 hover:bg-red-100 dark:text-amber-400 dark:hover:text-red-400 dark:hover:bg-red-950/20'
                : 'text-emerald-600 hover:text-red-600 hover:bg-red-100 dark:text-emerald-400 dark:hover:text-red-400 dark:hover:bg-red-950/20'
            )}
            title="Remove session"
          >
            <X className="w-3 h-3" />
          </button>

          <ConfirmDialog
            open={showDeleteConfirm}
            onOpenChange={setShowDeleteConfirm}
            title="Remove Session"
            description={`Are you sure you want to remove ${cycle?.name || cycleId}? This action cannot be undone.`}
            confirmLabel="Remove"
            isDangerous
            onConfirm={onRemove}
          />
        </div>
      )}
    </div>
  );
}
