import React, { useState } from 'react';
import { Cycle } from '@/lib/cycles';
import { Plus, Trash2 } from 'lucide-react';
import { RangeEditor } from './RangeEditor';
import { cn } from '@/lib/utils';

interface CycleManagerProps {
  cycles: Cycle[];
  onAddCycle: (cycle: Cycle) => void;
  onRemoveCycle: (cycleId: string) => void;
  onUpdateCycle: (cycleId: string, cycle: Partial<Cycle>) => void;
}

const formatDuration = (ms: number | null) => {
  if (!ms) return 'Custom';
  const hours = ms / (60 * 60 * 1000);
  const days = ms / (24 * 60 * 60 * 1000);
  const months = ms / (30 * 24 * 60 * 60 * 1000);
  
  if (months >= 1 && ms % (30 * 24 * 60 * 60 * 1000) === 0) {
    return `${Math.round(months)}mo`;
  }
  if (days >= 1 && ms % (24 * 60 * 60 * 1000) === 0) {
    return `${Math.round(days)}d`;
  }
  if (hours >= 1 && ms % (60 * 60 * 1000) === 0) {
    return `${Math.round(hours)}h`;
  }
  return `${Math.round(ms / (60 * 1000))}m`;
};

export function CycleManager({
  cycles,
  onAddCycle,
  onRemoveCycle,
  onUpdateCycle,
}: CycleManagerProps) {
  const [isAddingRange, setIsAddingRange] = useState(false);

  const handleSaveRange = (duration: number) => {
    const newCycle: Cycle = {
      id: `cycle-${Math.random().toString(36).substring(2, 9)}`,
      name: formatDuration(duration),
      durationMs: duration,
      color: 'blue',
    };
    onAddCycle(newCycle);
    setIsAddingRange(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {cycles.map((cycle) => (
        <div
          key={cycle.id}
          className="group relative inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-700/50 rounded-full text-xs font-medium text-blue-700 dark:text-blue-400 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
        >
          <span>{cycle.name}</span>
          <button
            onClick={() => onRemoveCycle(cycle.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-blue-600 dark:text-blue-400 hover:text-red-500 dark:hover:text-red-400"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}

      {isAddingRange ? (
        <RangeEditor
          onSave={handleSaveRange}
          onCancel={() => setIsAddingRange(false)}
        />
      ) : (
        <button
          onClick={() => setIsAddingRange(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-900/30 border border-gray-300 dark:border-gray-700/50 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-gray-200 transition-colors cursor-pointer"
          title="Add range"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
