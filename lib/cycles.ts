export type ZoneId = string;

export interface Cycle {
  id: string;
  name: string;
  durationMs: number | null; // null means user sets custom time
  color: 'amber' | 'violet' | 'blue' | 'rose' | 'emerald';
  icon?: string;
  resetAtTimezone?: ZoneId;
  fixedResetAt?: string; // e.g., "00:00"
}

export const PRESET_CYCLES: Record<string, Cycle[]> = {
  'claude-pro': [
    { id: '5h', name: '5h window', durationMs: 5 * 3600 * 1000, color: 'amber' },
    { id: 'weekly', name: 'Weekly', durationMs: 7 * 86400 * 1000, color: 'violet' },
  ],
  'gemini-advanced': [
    { id: 'daily', name: 'Daily', durationMs: 24 * 3600 * 1000, color: 'amber' },
  ],
  'chatgpt-plus': [
    { id: '3h', name: '3h window', durationMs: 3 * 3600 * 1000, color: 'amber' },
  ],
  'perplex-pro': [
    { id: 'daily', name: 'Daily', durationMs: 24 * 3600 * 1000, color: 'amber' },
  ],
};

export const DEFAULT_CYCLE: Cycle = {
  id: 'custom',
  name: 'Custom',
  durationMs: null,
  color: 'blue',
};
