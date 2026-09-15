import { requestWidgetUpdate } from 'react-native-android-widget';

import { loadTimers, loadWidgetBindings } from '@/store/storage';
import { TimerWidget, UnboundWidget } from '@/widgets/timer-widget';
import { WIDGET_NAMES, variantOf } from '@/widgets/widget-variants';

/**
 * The Android half of `refreshTimerWidgets`. Only ever reached through that
 * guard, so it may import the widget library directly.
 */
export async function refreshAndroidWidgets(): Promise<void> {
  const [bindings, timers] = await Promise.all([loadWidgetBindings(), loadTimers()]);
  // One instant for the whole sweep, so two widgets showing the same timer
  // cannot come out a second apart.
  const now = Date.now();

  await Promise.all(
    WIDGET_NAMES.map((widgetName) =>
      requestWidgetUpdate({
        widgetName,
        renderWidget: ({ widgetId }) => {
          const variant = variantOf(widgetName);
          const binding = bindings[String(widgetId)];
          const timer = binding && timers.find((candidate) => candidate.id === binding.timerId);
          return timer ? (
            <TimerWidget timer={timer} now={now} variant={variant} />
          ) : (
            <UnboundWidget variant={variant} />
          );
        },
      }).catch((error: unknown) => {
        // A widget that will not redraw is no reason to fail the save that
        // triggered this, so it is logged the way the storage layer logs.
        console.warn('[time-since] failed to refresh widget', widgetName, error);
      })
    )
  );
}
