import React, { useState } from 'react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface DateTimePickerProps {
  value: number | null;
  onChange: (timestamp: number | null) => void;
  label?: string;
  showClear?: boolean;
}

export function DateTimePicker({ value, onChange, label = 'Date & Time', showClear = true }: DateTimePickerProps) {
  // Format for datetime-local input: YYYY-MM-DDThh:mm
  const formatDatetimeLocal = (timestamp: number) => {
    const date = new Date(timestamp);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const date = new Date(e.target.value);
    onChange(date.getTime());
  };

  return (
    <div className="space-y-2">
      <label className="text-xs text-muted-foreground block">{label}</label>
      <div className="flex items-center gap-2">
        <Input
          type="datetime-local"
          value={value ? formatDatetimeLocal(value) : ''}
          onChange={handleChange}
          className="flex-1"
        />
        {showClear && value && (
          <button
            onClick={() => onChange(null)}
            className="p-2 rounded transition-colors text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950/20"
            title="Clear"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {value && (
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          {format(value, 'PPpp')}
        </div>
      )}
    </div>
  );
}
