import type { Restart } from '@/types/timer';

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
