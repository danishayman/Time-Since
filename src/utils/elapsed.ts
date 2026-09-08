import type { ClockFormat, DateOrder } from '@/types/settings';
import type { Direction, Timer } from '@/types/timer';

/**
 * Elapsed milliseconds for a timer at a given instant.
 *
 * Negative while `startDateTime` is still in the future, which is what makes a
 * countdown flip to a count-up on its own the moment the event arrives — there
 * is no separate countdown branch anywhere in the app.
 *
 * The value is derived entirely from stored timestamps, never from an
 * incrementing counter, so it stays correct across backgrounding and restarts.
 */
export function signedElapsedMs(timer: Timer, now: number): number {
  if (!timer.runningSince) {
    return timer.accumulatedMs;
  }
  return timer.accumulatedMs + (now - Date.parse(timer.runningSince));
}

export function directionOf(timer: Timer, now: number): Direction {
  return signedElapsedMs(timer, now) < 0 ? 'until' : 'since';
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

export type TimestampOptions = {
  withSeconds?: boolean;
  clockFormat?: ClockFormat;
  dateOrder?: DateOrder;
};

/**
 * A wall-clock timestamp for display. Kept pure and defaulted to the format the
 * app used before it was configurable, so tests and non-React callers do not
 * have to reach for the settings store; screens use `useTimestampFormatter`
 * instead, which binds the user's choices in.
 */
export function formatTimestamp(iso: string, options: TimestampOptions = {}): string {
  const { withSeconds = true, clockFormat = '24h', dateOrder = 'dmy' } = options;
  const date = new Date(iso);

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();

  const datePart =
    dateOrder === 'mdy'
      ? `${month}/${day}/${year}`
      : dateOrder === 'ymd'
        ? `${year}-${month}-${day}`
        : `${day}/${month}/${year}`;

  const hours = date.getHours();
  const seconds = withSeconds ? `:${pad(date.getSeconds())}` : '';

  if (clockFormat === '12h') {
    const suffix = hours < 12 ? 'AM' : 'PM';
    // Midnight and noon are 12, not 0.
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${datePart} ${hour12}:${pad(date.getMinutes())}${seconds} ${suffix}`;
  }

  return `${datePart} ${pad(hours)}:${pad(date.getMinutes())}${seconds}`;
}
