import {
  registerWidgetConfigurationScreen,
  registerWidgetTaskHandler,
} from 'react-native-android-widget';

import { WidgetConfigurationScreen } from '@/widgets/widget-configuration-screen';
import { widgetTaskHandler } from '@/widgets/widget-task-handler';

/**
 * Hooks the app up to the home screen.
 *
 * Both registrations have to happen at module scope, before React renders: the
 * task handler is what Android calls into when a widget is added, updated,
 * resized, tapped or removed — which can happen with the app closed, on a
 * headless JavaScript runtime that starts at this file — and the configuration
 * screen is the activity the launcher opens when a widget is placed. Neither can
 * wait for a component to mount.
 */
registerWidgetTaskHandler(widgetTaskHandler);
registerWidgetConfigurationScreen(WidgetConfigurationScreen);
