import React from 'react';
import { useStore } from '@/lib/store';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Settings, Globe, Check, Trash2, ShieldAlert } from 'lucide-react';
import { COMMON_TIMEZONES } from '@/lib/timezone';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { toast } from 'sonner';
import TimezoneSelect, { type ITimezoneOption } from 'react-timezone-select';

export function SettingsPopover() {
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);
  const cleanupLegacyFields = useStore((state) => state.cleanupLegacyFields);
  const products = useStore((state) => state.products);

  const hasLegacyFields = products.some(p => p.accounts.some(a => 'availableAt' in a));

  const currentTime = Date.now();
  const displayTime = settings.timezoneMode === 'system' 
    ? format(currentTime, 'h:mm a')
    : formatInTimeZone(currentTime, settings.timezone, 'h:mm a');

  const handleTimezoneChange = (timezone: ITimezoneOption) => {
    updateSettings({ 
      timezoneMode: 'manual', 
      timezone: timezone.value 
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-950 dark:hover:text-gray-50 transition-colors cursor-pointer flex items-center justify-center h-8 w-8">
          <Settings className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold">Settings</h3>
            <p className="text-[11px] text-gray-500">Configure your display preferences.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3 h-3" />
                Timezone
              </label>
              
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => updateSettings({ timezoneMode: 'system' })}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors border text-left",
                    settings.timezoneMode === 'system' 
                      ? "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 font-medium" 
                      : "bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400"
                  )}
                >
                  <span className="flex flex-col">
                    <span>System Default</span>
                    <span className="text-[10px] opacity-60 font-normal">Follow your device clock</span>
                  </span>
                  {settings.timezoneMode === 'system' && <Check className="w-4 h-4 text-emerald-500" />}
                </button>

                <div className="relative group">
                  <div className={cn(
                    "rounded-lg overflow-hidden border transition-all",
                    settings.timezoneMode === 'manual' ? "border-gray-200 dark:border-white/10" : "border-transparent hover:border-gray-100 dark:hover:border-white/5"
                  )}>
                    <TimezoneSelect
                      value={settings.timezone}
                      onChange={handleTimezoneChange}
                      styles={{
                        control: (base) => ({
                          ...base,
                          backgroundColor: 'transparent',
                          border: 'none',
                          boxShadow: 'none',
                          fontSize: '14px',
                          cursor: 'pointer',
                          minHeight: '36px',
                        }),
                        menu: (base) => ({
                          ...base,
                          backgroundColor: 'var(--background, white)',
                          border: '1px solid var(--border, #e5e7eb)',
                          fontSize: '14px',
                          zIndex: 100,
                        }),
                        option: (base, { isFocused }) => ({
                          ...base,
                          backgroundColor: isFocused ? 'var(--accent, #f3f4f6)' : 'transparent',
                          color: 'inherit',
                          cursor: 'pointer',
                        }),
                        singleValue: (base) => ({
                          ...base,
                          color: 'inherit',
                        }),
                        input: (base) => ({
                          ...base,
                          color: 'inherit',
                        })
                      }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 px-1">
                Currently {displayTime} in {settings.timezoneMode === 'system' ? 'your zone' : settings.timezone}
              </p>
            </div>

            {hasLegacyFields && (
              <div className="pt-2 border-t border-gray-100 dark:border-white/5">
                <div className="bg-amber-50/50 dark:bg-amber-500/5 rounded-xl p-3 border border-amber-100 dark:border-amber-900/20">
                  <div className="flex items-start gap-2.5 mb-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-amber-900 dark:text-amber-400 uppercase tracking-tight">Data Migration</p>
                      <p className="text-[10px] text-amber-700/80 dark:text-amber-500/80 leading-relaxed mt-0.5">
                        Your data has been migrated to the new cycles system. You can now safely remove legacy timer fields.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Permanently remove legacy data fields? This cannot be undone.')) {
                        cleanupLegacyFields();
                        toast.success('Legacy data fields removed');
                      }
                    }}
                    className="w-full py-1.5 bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-500 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    Clean up legacy data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
