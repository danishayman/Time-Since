
/** Which palette the app paints with. `system` follows the device. */
export type ThemePreference = 'system' | 'light' | 'dark';

export type ClockFormat = '24h' | '12h';

/** Field order used when rendering a date, independent of the clock format. */
export type DateOrder = 'dmy' | 'mdy' | 'ymd';

export type Settings = {
  theme: ThemePreference;
  clockFormat: ClockFormat;
  dateOrder: DateOrder;
  /**
   * Whether categories appear anywhere in the app. Turning this off hides the
   * chips, captions and pickers but keeps every timer's `categoryId`, so
   * turning it back on restores exactly what was there.
   */
  categoriesEnabled: boolean;
  /** Id of the category the home list is filtered to, or `null` for all of them. */
  categoryFilter: string | null;
  haptics: boolean;
};

/**
 * Deliberately reproduces the behaviour the app had before settings existed, so
 * an install that has never opened this screen sees no change.
 */
export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  clockFormat: '24h',
  dateOrder: 'dmy',
  categoriesEnabled: true,
  categoryFilter: null,
  haptics: true,
};

export const THEME_LABELS: Record<ThemePreference, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

export const CLOCK_LABELS: Record<ClockFormat, string> = {
  '24h': '24-hour',
  '12h': '12-hour',
};

export const DATE_ORDER_LABELS: Record<DateOrder, string> = {
  dmy: 'DD/MM/YYYY',
  mdy: 'MM/DD/YYYY',
  ymd: 'YYYY-MM-DD',
};
