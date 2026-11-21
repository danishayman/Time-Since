import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    border: '#E4E4E9',
    // The outline of a text field. `border` is a separator and too faint to mark
    // where a field is on its own; this clears 3:1 against the screen.
    fieldBorder: '#868993',
    // Deep enough to clear 4.5:1 for the destructive row labels, on the screen
    // and on the pressed-row grey.
    danger: '#C4372A',
    // The one colour that means "this can be tapped" wherever plain text would
    // not say so: links, the back chevron, a switch that is on. Deep enough to
    // read as text on both `background` and `backgroundElement`.
    tint: '#1F66D1',
  },
  // A soft charcoal rather than pure black: OLED black makes the badge colours
  // glare and shows smearing as the list scrolls. Each surface steps about ten
  // points lighter than the one below it, which is enough separation to read
  // without turning into visible banding.
  dark: {
    text: '#ffffff',
    background: '#16171A',
    backgroundElement: '#232529',
    backgroundSelected: '#2F3238',
    textSecondary: '#B0B4BA',
    border: '#2C2E33',
    fieldBorder: '#6B6F78',
    danger: '#FF6B5E',
    tint: '#5A9BF8',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * The type scale. Each role takes its platform's own size: the iOS text styles
 * (Body 17, Title 3 20, …) on iPhone and the Material 3 roles (Body Large 16,
 * Title Large 22, …) on Android, so text sits where a native app's would.
 * Every size scales with the system text-size setting.
 */
const ios = Platform.OS === 'ios';

export const Type = {
  /** Screen-level emphasis: an empty list's message. iOS Title 1 / M3 Headline Small. */
  title: ios ? { fontSize: 28, lineHeight: 34 } : { fontSize: 24, lineHeight: 32 },
  /** Section headings and the timer's name on its own screen. iOS Title 3 / M3 Title Large. */
  heading: ios ? { fontSize: 20, lineHeight: 25 } : { fontSize: 22, lineHeight: 28 },
  /** Row labels, inputs, anything read as the main line. iOS Body / M3 Body Large. */
  body: ios ? { fontSize: 17, lineHeight: 22 } : { fontSize: 16, lineHeight: 24 },
  /** Descriptions, values and footers. iOS Subheadline / M3 Body Medium. */
  secondary: ios ? { fontSize: 15, lineHeight: 20 } : { fontSize: 14, lineHeight: 20 },
  /** The category name over a timer. iOS Caption 2 / M3 Label Small. */
  caption: ios ? { fontSize: 11, lineHeight: 13 } : { fontSize: 11, lineHeight: 16 },
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/**
 * The widest a screen's content is allowed to run. Below this — every phone —
 * nothing changes; on a tablet or an unfolded foldable the content stays a
 * centred column instead of stretching rows across the whole display.
 */
export const MaxContentWidth = 640;
