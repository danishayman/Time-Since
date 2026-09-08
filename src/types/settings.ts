import { DEFAULT_COLOR } from '@/constants/palette';
import type { TimerFormat } from '@/types/timer';
import { DEFAULT_FORMAT } from '@/utils/format-duration';

/** Which palette the app paints with. `system` follows the device. */
export type ThemePreference = 'system' | 'light' | 'dark';

export type ClockFormat = '24h' | '12h';

/** Field order used when rendering a date, independent of the clock format. */
export type DateOrder = 'dmy' | 'mdy' | 'ymd';

/**
 * How the home list is ordered. `manual` is the stored drag order; every other
 * mode is derived at render time and leaves `Timer.order` untouched, so
 * switching back to `manual` restores the arrangement the user dragged.
 */
export type SortMode = 'manual' | 'newest' | 'oldest' | 'label' | 'longest';

export type Settings = {
  theme: ThemePreference;
  /** Also drives the clock interval: hiding seconds drops the ticker to a minute. */
  showSeconds: boolean;
  clockFormat: ClockFormat;
  dateOrder: DateOrder;
  /** Applied to timers created from now on, not retroactively. */
  defaultFormat: TimerFormat;
  defaultColor: string;
  sortMode: SortMode;
  /** Id of the category the home list is filtered to, or `null` for all of them. */
  categoryFilter: string | null;
  /** Whether the unfiltered home list is broken into per-category sections. */
  groupByCategory: boolean;
  haptics: boolean;
};

/**
 * Deliberately reproduces the behaviour the app had before settings existed, so
 * an install that has never opened this screen sees no change.
 */
export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  showSeconds: true,
  clockFormat: '24h',
  dateOrder: 'dmy',
  defaultFormat: DEFAULT_FORMAT,
  defaultColor: DEFAULT_COLOR,
  sortMode: 'manual',
  categoryFilter: null,
  groupByCategory: true,
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

export const SORT_LABELS: Record<SortMode, string> = {
  manual: 'Manual',
  newest: 'Recently added',
  oldest: 'Oldest added',
  label: 'A to Z',
  longest: 'Longest running',
};
