import type { SortMode } from '@/types/settings';
import type { Timer } from '@/types/timer';
import { signedElapsedMs } from '@/utils/elapsed';

/**
 * Translates a drag inside one visible run of timers — a category section, or a
 * filtered list — into the pair of indices the store's `reorderTimers` needs.
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

/**
 * Orders the home list for display.
 *
 * Only `manual` reflects `Timer.order`; every other mode is derived here and
 * never written back, so switching away and back restores the arrangement the
 * user dragged. The input array is not mutated.
 */
export function sortTimers(timers: Timer[], mode: SortMode, now: number): Timer[] {
  switch (mode) {
    case 'manual':
      // Already ordered by `order` — the store keeps it that way.
      return timers;

    case 'newest':
      return [...timers].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

    case 'oldest':
      return [...timers].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));

    case 'label':
      return [...timers].sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })
      );

    case 'longest':
      // Absolute, so a countdown sorts by how far away it is rather than
      // sinking below every count-up because its elapsed value is negative.
      return [...timers].sort(
        (a, b) => Math.abs(signedElapsedMs(b, now)) - Math.abs(signedElapsedMs(a, now))
      );
  }
}
