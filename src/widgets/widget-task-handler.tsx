import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import {
  loadTimers,
  loadWidgetBindings,
  saveTimers,
  unbindWidget,
  type WidgetBindings,
} from '@/store/storage';
import type { Timer } from '@/types/timer';
import { applyRestart } from '@/utils/restarts';
import { RESTART_CLICK_ACTION, TimerWidget, UnboundWidget } from '@/widgets/timer-widget';
import { variantOf } from '@/widgets/widget-variants';

/**
 * Handles every home screen widget event for the app.
 *
 * This runs in a headless JavaScript task inside the app's own process, not in a
 * separate native extension, which is the reason the widgets need no copy of the
 * data: `loadTimers` reads the very same `AsyncStorage` key the app writes, and
 * the elapsed-time and formatting helpers are already pure. Nothing is mirrored
 * anywhere, so a widget cannot go out of step with the app's own idea of a timer.
 *
 * Registered in the root `index.js`, which is why `package.json` points `main`
 * at that file instead of straight at `expo-router/entry`.
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
  const { widgetInfo, widgetAction, renderWidget } = props;
  const variant = variantOf(widgetInfo.widgetName);

  switch (widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const [bindings, timers] = await Promise.all([loadWidgetBindings(), loadTimers()]);
      const timer = resolve(bindings, widgetInfo.widgetId, timers);
      renderWidget(
        timer ? (
          <TimerWidget timer={timer} now={Date.now()} variant={variant} />
        ) : (
          <UnboundWidget variant={variant} />
        )
      );
      break;
    }

    case 'WIDGET_CLICK': {
      if (props.clickAction !== RESTART_CLICK_ACTION) {
        // Opening the app and opening a timer are both handled natively by the
        // library's OPEN_APP and OPEN_URI actions, which never reach here.
        break;
      }

      const timerId = props.clickActionData?.timerId;
      if (typeof timerId !== 'string') {
        break;
      }

      // Read, restart and write the whole list, because that is how the app
      // stores it. The app re-reads the key whenever it comes back to the
      // foreground, so a restart tapped here is not overwritten by whatever
      // state a backgrounded app is still holding.
      const timers = await loadTimers();
      const now = Date.now();
      let restarted: Timer | undefined;
      const next = timers.map((timer) => {
        if (timer.id !== timerId) {
          return timer;
        }
        restarted = applyRestart(timer, now);
        return restarted;
      });

      if (!restarted) {
        break;
      }
      await saveTimers(next);
      renderWidget(<TimerWidget timer={restarted} now={now} variant={variant} />);
      break;
    }

    case 'WIDGET_DELETED':
      await unbindWidget(widgetInfo.widgetId);
      break;
  }
}

/**
 * The timer a widget instance is pointed at, or nothing when it has not been
 * configured yet or the timer it pointed at has since been deleted. Both cases
 * render the placeholder rather than failing — a deleted timer must not leave a
 * crashing widget behind on the home screen.
 */
function resolve(
  bindings: WidgetBindings,
  widgetId: number,
  timers: Timer[]
): Timer | undefined {
  const binding = bindings[String(widgetId)];
  if (!binding) {
    return undefined;
  }
  return timers.find((timer) => timer.id === binding.timerId);
}
