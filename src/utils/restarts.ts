import type { Restart, Timer } from '@/types/timer';
import { signedElapsedMs } from '@/utils/elapsed';

/**
 * How many restarts one timer keeps. Every mutation rewrites the whole timer
 * list to storage as a single blob, so the log has to stay bounded or each save
 * gets slower forever.
 */
export const MAX_RESTARTS = 200;

/** Adds one entry, dropping the oldest once the log is full. */
export function appendRestart(restarts: Restart[], entry: Restart): Restart[] {
  return [...restarts, entry].slice(-MAX_RESTARTS);
}

/**
 * Rebases a timer on `now` and logs the run that just ended.
 *
 * Pure, and takes `now` rather than reading a clock, because it has two callers
 * on two different bases: the reducer passes the ticker's value so the badge
 * reads a clean zero rather than a fraction of a second short of it, while the
 * home screen widget — which runs in a headless task with no ticker — passes the
 * wall clock. Sharing the function is what keeps a restart tapped on the widget
 * from producing a different timer than the same tap inside the app.
 */
export function applyRestart(timer: Timer, now: number): Timer {
  const nowIso = new Date(now).toISOString();
  const entry: Restart = { at: nowIso, lastedMs: signedElapsedMs(timer, now) };
  return {
    ...timer,
    startDateTime: nowIso,
    runningSince: nowIso,
    accumulatedMs: 0,
    isRunning: true,
    restarts: appendRestart(timer.restarts, entry),
  };
}

/**
 * The longest run a timer has managed, the one it is on right now included — a
 * streak you are still going on should be able to be your best one.
 *
 * Runs are compared by absolute length so a spell spent counting down towards a
 * future event ranks by how far away it was, rather than losing to every
 * count-up because its reading was negative. The winner is returned signed, so
 * the caller still knows which it was.
 *
 * `currentMs` is passed in rather than derived here because it changes every
 * second: the caller subscribes to the clock and this stays pure.
 */
export function longestRunMs(restarts: Restart[], currentMs: number): number {
  return restarts.reduce(
    (longest, restart) =>
      Math.abs(restart.lastedMs) > Math.abs(longest) ? restart.lastedMs : longest,
    currentMs
  );
}
