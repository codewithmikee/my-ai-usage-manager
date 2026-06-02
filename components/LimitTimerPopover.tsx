import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarClock, Clock, Check, X } from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { Input } from '@/components/ui/input';

interface LimitTimerPopoverProps {
  availableAt: number | null;
  onSetTime: (timestamp: number | null) => void;
  children: React.ReactNode;
  title?: string;
  clearLabel?: string;
}

export function LimitTimerPopover({ availableAt, onSetTime, children, title = "Set Availability Time", clearLabel = "Mark Available" }: LimitTimerPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Format for datetime-local input: YYYY-MM-DDThh:mm
  const formatDatetimeLocal = (date: Date) => {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  const addTime = (minutes: number) => {
    onSetTime(Date.now() + minutes * 60000);
    setIsOpen(false);
  };

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const date = new Date(e.target.value);
    onSetTime(date.getTime());
  };

  const clearTimer = () => {
    onSetTime(null);
    setIsOpen(false);
  };
  
  const isAvailable = availableAt === null || isPast(availableAt);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 max-w-[calc(100vw-2rem)]" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">{title}</h4>
            {availableAt !== null && (
              <Button variant="ghost" size="sm" className="h-auto p-1 px-2 text-xs text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:text-green-400 dark:hover:bg-green-950/50" onClick={clearTimer}>
                {clearLabel}
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => addTime(15)}>+15m</Button>
            <Button variant="outline" size="sm" onClick={() => addTime(60)}>+1h</Button>
            <Button variant="outline" size="sm" onClick={() => addTime(180)}>+3h</Button>
            <Button variant="outline" size="sm" onClick={() => addTime(4 * 60)}>+4h</Button>
            <Button variant="outline" size="sm" onClick={() => addTime(12 * 60)}>+12h</Button>
            <Button variant="outline" size="sm" onClick={() => addTime(24 * 60)}>+24h</Button>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Custom Time</label>
            <Input 
              type="datetime-local" 
              value={availableAt ? formatDatetimeLocal(new Date(availableAt)) : ''}
              onChange={handleCustomDateChange}
            />
          </div>
          
          {availableAt && !isAvailable && (
            <div className="text-xs text-center text-muted-foreground bg-muted p-2 rounded-md">
              Available in {formatDistanceToNow(availableAt)}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
