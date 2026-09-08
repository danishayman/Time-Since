import type { DisplayFormat } from '@/types/timer';

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;

/**
 * Days in a year for display purposes. Deliberately fixed rather than
 * calendar-accurate so that `formatDuration` stays pure and deterministic:
 * the same duration always renders the same string regardless of when it is
 * read or which timezone the device is in.
 */
export const DAYS_PER_YEAR = 365;

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

/**
 * Formats a duration in milliseconds for the timer badge.
 *
 * The sign is ignored — a countdown passes its remaining time in as a negative
 * value and gets the same string back, with the caller supplying the
 * since/until wording.
 *
 * ```
 * formatDuration(1_654_474_000)              // '19d 03:54:34'
 * formatDuration(732_780_000_000)            // '23y 60d'
 * formatDuration(1_654_474_000, 'years-days') // '0y 19d'
 * ```
 */
export function formatDuration(ms: number, format: DisplayFormat = 'auto'): string {
  const totalSeconds = Math.floor(Math.abs(ms) / MS_PER_SECOND);
  const days = Math.floor(totalSeconds / SECONDS_PER_DAY);

  const resolved = format === 'auto' ? (days >= DAYS_PER_YEAR ? 'years-days' : 'days-time') : format;

  if (resolved === 'years-days') {
    const years = Math.floor(days / DAYS_PER_YEAR);
    return `${years}y ${days - years * DAYS_PER_YEAR}d`;
  }

  const hours = Math.floor((totalSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR);
  const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;

  return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/** Human label for the format picker on the detail screen. */
export const FORMAT_LABELS: Record<DisplayFormat, string> = {
  auto: 'Automatic',
  'days-time': 'Days + time',
  'years-days': 'Years + days',
};
