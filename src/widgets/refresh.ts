import { WIDGETS_SUPPORTED } from '@/widgets/platform';

/**
 * Redraws every widget on the home screen from what is currently in storage.
 *
 * Android will not let a widget update itself on a clock: `updatePeriodMillis`
 * has a thirty minute floor, and that is the only automatic refresh the widgets
 * get. This is the other half — the app pushing a fresh draw at the moments it
 * knows something changed, after a save and on returning to the foreground — so
 * a widget is never stale by more than the time since the app was last touched,
 * rather than by up to half an hour.
 *
 * Cheap when no widgets are placed: the implementation asks Android for the
 * placed instances first and draws nothing when there are none.
 */
export async function refreshTimerWidgets(): Promise<void> {
  if (!WIDGETS_SUPPORTED) {
    return;
  }
  // Required, not imported: see `platform.ts`.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { refreshAndroidWidgets } = require('@/widgets/refresh-android') as {
    refreshAndroidWidgets: () => Promise<void>;
  };
  return refreshAndroidWidgets();
}
