import type { DurationUnit, TimerFormat } from '@/types/timer';

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;

/**
 * Unit lengths for display purposes. Deliberately fixed rather than
 * calendar-accurate so that `formatDuration` stays pure and deterministic:
 * the same duration always renders the same string regardless of when it is
 * read or which timezone the device is in.
 *
 * The cost is that twelve months fall five days short of a year, so selecting
 * years *and* months drifts against a calendar. That is the usual trade in
 * elapsed-time apps, and the one this app already made for years.
 */
export const DAYS_PER_YEAR = 365;
export const DAYS_PER_MONTH = 30;
export const DAYS_PER_WEEK = 7;

/** Largest to smallest. Units always render in this order, never the tap order. */
export const UNIT_ORDER: DurationUnit[] = ['years', 'months', 'weeks', 'days', 'time'];

const UNIT_SECONDS: Record<Exclude<DurationUnit, 'time'>, number> = {
  years: DAYS_PER_YEAR * SECONDS_PER_DAY,
  months: DAYS_PER_MONTH * SECONDS_PER_DAY,
  weeks: DAYS_PER_WEEK * SECONDS_PER_DAY,
  days: SECONDS_PER_DAY,
};

const UNIT_SUFFIX: Record<Exclude<DurationUnit, 'time'>, string> = {
  years: 'y',
  months: 'mo',
  weeks: 'w',
  days: 'd',
};

/** Full names, for the format picker. */
export const UNIT_LABELS: Record<DurationUnit, string> = {
  years: 'Years',
  months: 'Months',
  weeks: 'Weeks',
  days: 'Days',
  time: 'Hours, minutes and seconds',
};

/** What a brand new timer counts in, and the fallback for an empty selection. */
export const DEFAULT_FORMAT: TimerFormat = ['days', 'time'];

/**
 * What each of the formats that predated multi-select showed, so a timer stored
 * by an older build keeps counting in roughly the units its owner chose.
 *
 * `auto` is the inexact one: it swapped to years + days past a year and showed
 * days + time below it, and no fixed selection does both. It maps to the sub-
 * year reading, which is what almost every timer was showing.
 */
const LEGACY_FORMATS: Record<string, TimerFormat> = {
  auto: ['days', 'time'],
  'days-time': ['days', 'time'],
  'years-days': ['years', 'days'],
};

/**
 * Coerces anything read from storage, a backup file, or a picker into a usable
 * format: known units only, always largest-first, never empty.
 */
export function normalizeFormat(value: unknown): TimerFormat {
  if (typeof value === 'string') {
    return LEGACY_FORMATS[value] ?? DEFAULT_FORMAT;
  }
  if (!Array.isArray(value)) {
    return DEFAULT_FORMAT;
  }
  const selected = UNIT_ORDER.filter((unit) => value.includes(unit));
  return selected.length > 0 ? selected : DEFAULT_FORMAT;
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

/**
 * Formats a duration in milliseconds for the timer badge.
 *
 * Each selected unit takes what it can from the duration and passes the
 * remainder down, so `['weeks', 'days']` renders 20 days as `2w 6d`. Units the
 * user did not pick are never carved out — with only `time` selected, two days
 * reads `48:00:00`.
 *
 * Every selected unit is rendered even when it is still zero, so the badge says
 * exactly what was ticked and its width does not jump as the timer grows.
 *
 * The sign is ignored — a countdown passes its remaining time in as a negative
 * value and gets the same string back, with the caller supplying the
 * since/until wording.
 *
 * ```
 * formatDuration(1_654_474_000, ['days', 'time'])    // '19d 03:54:34'
 * formatDuration(732_780_000_000, ['years', 'days']) // '23y 60d'
 * formatDuration(1_728_000_000, ['weeks', 'days'])   // '2w 6d'
 * ```
 */
export function formatDuration(ms: number, format: TimerFormat = DEFAULT_FORMAT): string {
  const units = normalizeFormat(format);
  let remaining = Math.floor(Math.abs(ms) / MS_PER_SECOND);

  return units
    .map((unit) => {
      if (unit === 'time') {
        const hours = Math.floor(remaining / SECONDS_PER_HOUR);
        const minutes = Math.floor((remaining % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
        return `${pad(hours)}:${pad(minutes)}:${pad(remaining % SECONDS_PER_MINUTE)}`;
      }

      const size = UNIT_SECONDS[unit];
      const value = Math.floor(remaining / size);
      remaining -= value * size;
      return `${value}${UNIT_SUFFIX[unit]}`;
    })
    .join(' ');
}
