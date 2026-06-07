import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

type TimeUnit = 'minutes' | 'hours' | 'days' | 'months';

interface RangeEditorProps {
  onSave: (duration: number) => void;
  onCancel: () => void;
}

const unitToMs: Record<TimeUnit, number> = {
  minutes: 60 * 1000,
  hours: 60 * 60 * 1000,
  days: 24 * 60 * 60 * 1000,
  months: 30 * 24 * 60 * 60 * 1000,
};

export function RangeEditor({
  onSave,
  onCancel,
}: RangeEditorProps) {
  const [amount, setAmount] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<TimeUnit>('hours');

  const handleSave = () => {
    if (!amount) return;
    const numAmount = parseInt(amount, 10);
    if (numAmount <= 0) return;
    const durationMs = numAmount * unitToMs[selectedUnit];
    onSave(durationMs);
  };

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min="1"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0"
        autoFocus
        className="w-16 px-2 py-1.5 text-xs rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100"
      />

      <select
        value={selectedUnit}
        onChange={(e) => setSelectedUnit(e.target.value as TimeUnit)}
        className="px-2 py-1.5 text-xs rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100"
      >
        <option value="minutes">min</option>
        <option value="hours">h</option>
        <option value="days">d</option>
        <option value="months">mo</option>
      </select>

      <button
        onClick={handleSave}
        disabled={!amount}
        className="p-1.5 rounded text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Save"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onCancel}
        className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
        title="Cancel"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
