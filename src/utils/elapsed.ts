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

/** `DD/MM/YYYY HH:mm:ss`, as shown in the detail screen footer. */
export function formatTimestamp(iso: string, withSeconds = true): string {
  const date = new Date(iso);
  const day = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  return withSeconds ? `${day} ${time}:${pad(date.getSeconds())}` : `${day} ${time}`;
}
