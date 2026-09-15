import { requestPinWidget } from 'react-native-android-widget';

import type { WidgetName } from '@/widgets/widget-variants';

/**
 * The Android half of `pinTimerWidget`. Only ever reached through that guard,
 * so it may import the widget library directly.
 */
export async function pinAndroidWidget(widgetName: WidgetName): Promise<boolean> {
  return requestPinWidget({ widgetName });
}
