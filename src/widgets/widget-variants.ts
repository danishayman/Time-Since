import type { WidgetVariant } from '@/widgets/timer-widget';

/**
 * The four widget providers declared to Android, mapped to the style each one
 * paints. The keys must match the `name` of every entry in the
 * `react-native-android-widget` plugin block in `app.json` — that string is how
 * the launcher, the manifest and the headless task all refer to the same widget,
 * and renaming one without the other leaves a widget that renders nothing.
 */
export const WIDGET_VARIANTS = {
  TimerStandard: 'standard',
  TimerTransparentLight: 'transparent-light',
  TimerTransparentDark: 'transparent-dark',
  TimerRestart: 'restart',
} as const satisfies Record<string, WidgetVariant>;

export type WidgetName = keyof typeof WIDGET_VARIANTS;

export const WIDGET_NAMES = Object.keys(WIDGET_VARIANTS) as WidgetName[];

/** Human names, matching the labels in `app.json`, for the in-app widgets screen. */
export const WIDGET_LABELS: Record<WidgetName, string> = {
  TimerStandard: 'Standard',
  TimerTransparentLight: 'Transparent (light text)',
  TimerTransparentDark: 'Transparent (dark text)',
  TimerRestart: 'Restart',
};

/** Falls back to the plain style rather than throwing on an unknown provider. */
export function variantOf(widgetName: string): WidgetVariant {
  return WIDGET_VARIANTS[widgetName as WidgetName] ?? 'standard';
}
