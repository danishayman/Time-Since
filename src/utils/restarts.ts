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

export type RestartStats = {
  /** How many times the timer has been restarted. */
  count: number;
  /** What the timer reads now, i.e. how long the current run has lasted. */
  currentMs: number;
  /**
   * The longest run so far, the current one included — a streak you are still
   * on should be able to be your best one.
   */
  longestMs: number;
};

/**
 * Summarises a timer's restart history.
 *
 * Runs are compared by absolute length so a spell spent counting down towards a
 * future event ranks by how far away it was, rather than sinking below every
 * count-up because its reading was negative. This matches how `sortTimers` used
 * to rank timers and how `formatDuration` renders them.
 */
export function restartStats(timer: Timer, now: number): RestartStats {
  const currentMs = signedElapsedMs(timer, now);
  const longestMs = timer.restarts.reduce(
    (longest, restart) => (Math.abs(restart.lastedMs) > Math.abs(longest) ? restart.lastedMs : longest),
    currentMs
  );

  return { count: timer.restarts.length, currentMs, longestMs };
}
