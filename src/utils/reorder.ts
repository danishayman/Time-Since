import type { Timer } from '@/types/timer';

/**
 * Translates a drag inside one visible run of timers — a category-filtered
 * list — into the pair of indices the store's `reorderTimers` needs.
 *
 * The run is always a subsequence of the stored array, so moving the dragged
 * timer to the stored position of whichever timer it was dropped on puts it in
 * the right place relative to the rest of its run, and leaves every timer
 * outside the run in the same relative order as before.
 *
 * Returns `null` when either end cannot be located, which should only happen if
 * the run has gone stale mid-gesture.
 */
export function globalReorderIndices(
  timers: Timer[],
  run: Timer[],
  from: number,
  to: number
): { from: number; to: number } | null {
  const fromTimer = run[from];
  const toTimer = run[to];
  if (!fromTimer || !toTimer) {
    return null;
  }

  const globalFrom = timers.indexOf(fromTimer);
  const globalTo = timers.indexOf(toTimer);
  if (globalFrom < 0 || globalTo < 0) {
    return null;
  }

  return { from: globalFrom, to: globalTo };
}
