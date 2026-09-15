import type { Timer } from '@/types/timer';
import { signedElapsedMs } from '@/utils/elapsed';
import { formatDuration } from '@/utils/format-duration';

/**
 * The duration string for a home screen widget.
 *
 * Deliberately the app's own `formatDuration` against the timer's own `format`,
 * so a widget and the row it was created from never disagree about what a timer
 * reads.
 *
 * The catch is that a widget cannot tick. Android will not redraw one on demand
 * more than the app can arrange: `updatePeriodMillis` has a thirty minute floor
 * and `WorkManager` a fifteen minute one, so a widget shows a snapshot taken the
 * last time something refreshed it. For a format built from days and larger that
 * is invisible. For one that includes `time` the seconds are correct only at the
 * moment of the draw — `refreshTimerWidgets` narrows the gap by redrawing on
 * every save and every foreground, but it cannot close it.
 *
 * This function is the single place that decision lives: to show `HH:MM` on the
 * home screen instead of a frozen `HH:MM:SS`, rewrite the `time` unit here and
 * nothing else in the widget code has to change.
 */
export function formatForWidget(timer: Timer, now: number): string {
  return formatDuration(signedElapsedMs(timer, now), timer.format);
}
