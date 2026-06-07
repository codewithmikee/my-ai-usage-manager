import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Cycle } from '@/lib/cycles';
import { DateTimePicker } from './DateTimePicker';
import { Switch } from '@/components/ui/switch';

interface AddSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycles: Cycle[];
  onAddSession: (cycleId: string, availableAt: number | null, isReached: boolean) => void;
}

export function AddSessionModal({ open, onOpenChange, cycles, onAddSession }: AddSessionModalProps) {
  const [selectedCycleId, setSelectedCycleId] = useState<string>(cycles[0]?.id || '');
  const [availableAt, setAvailableAt] = useState<number | null>(null);
  const [isReached, setIsReached] = useState(false);

  const handleAdd = () => {
    if (!selectedCycleId) return;
    onAddSession(selectedCycleId, availableAt, isReached);
    setSelectedCycleId(cycles[0]?.id || '');
    setAvailableAt(null);
    setIsReached(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Session Range</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Range selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground block">Select Range</label>
            <div className="flex flex-wrap gap-2">
              {cycles.map((cycle) => (
                <button
                  key={cycle.id}
                  onClick={() => setSelectedCycleId(cycle.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                    selectedCycleId === cycle.id
                      ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-150 dark:hover:bg-white/10'
                  }`}
                >
                  {cycle.name}
                </button>
              ))}
            </div>
          </div>

          {/* Availability section */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Mark as Reached
              </label>
              <Switch
                checked={isReached}
                onCheckedChange={setIsReached}
              />
            </div>

            {isReached && (
              <DateTimePicker
                value={availableAt}
                onChange={setAvailableAt}
                label="Available At"
                showClear={true}
              />
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!selectedCycleId}
          >
            Add Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
