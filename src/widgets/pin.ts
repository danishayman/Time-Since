import { WIDGETS_SUPPORTED } from '@/widgets/platform';
import type { WidgetName } from '@/widgets/widget-variants';

/**
 * Asks the launcher to put a widget on the home screen, so the widgets screen
 * can offer the four styles directly instead of sending the user off to hunt
 * through the launcher's own picker.
 *
 * Resolves `false` when the launcher will not take widgets this way — several
 * third-party launchers, and every launcher before Android 8, refuse — which is
 * the caller's cue to explain the long-press route instead. A `true` only means
 * the launcher accepted the request, not that the user confirmed the prompt.
 */
export async function pinTimerWidget(widgetName: WidgetName): Promise<boolean> {
  if (!WIDGETS_SUPPORTED) {
    return false;
  }
  // Required, not imported: see `platform.ts`.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { pinAndroidWidget } = require('@/widgets/pin-android') as {
    pinAndroidWidget: (widgetName: WidgetName) => Promise<boolean>;
  };
  return pinAndroidWidget(widgetName);
}
