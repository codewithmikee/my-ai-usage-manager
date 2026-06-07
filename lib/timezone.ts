import { formatInTimeZone } from 'date-fns-tz';
import { format } from 'date-fns';

export const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Dubai',
  'Australia/Sydney',
];

export function formatTimestamp(timestamp: number, timezone: string, mode: 'system' | 'manual') {
  if (mode === 'system') {
    return format(timestamp, 'h:mm a');
  }
  return formatInTimeZone(timestamp, timezone, 'h:mm a zzz');
}

export function formatTimestampFull(timestamp: number, timezone: string, mode: 'system' | 'manual') {
  if (mode === 'system') {
    return format(timestamp, 'MMM d, h:mm a');
  }
  return formatInTimeZone(timestamp, timezone, 'MMM d, h:mm a zzz');
}
