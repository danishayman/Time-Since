import { useWindowDimensions } from 'react-native';

/**
 * The text-size multiplier from which side-by-side rows stack instead.
 *
 * 1.6 is where iOS's accessibility sizes begin (body text at about 28 against
 * 17) and below Android's largest setting (2.0). Under it a badge and a label,
 * or a label and its value, still share a line comfortably; over it the label
 * gets squeezed to a letter or two per line.
 */
export const LARGE_TEXT_SCALE = 1.6;

/** True while the system text size is at or above `LARGE_TEXT_SCALE`. */
export function useLargeText() {
  const { fontScale } = useWindowDimensions();
  return fontScale >= LARGE_TEXT_SCALE;
}
