/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettings } from '@/store/settings-context';

/**
 * The scheme actually painted: the user's override when they have set one,
 * otherwise whatever the device reports.
 *
 * `useColorScheme` resolves to `null` before the device value is known, which
 * is why this branches on `'dark'` rather than trusting the value as a key.
 */
export function useResolvedScheme(): 'light' | 'dark' {
  const { settings } = useSettings();
  const deviceScheme = useColorScheme();

  if (settings.theme !== 'system') {
    return settings.theme;
  }
  return deviceScheme === 'dark' ? 'dark' : 'light';
}

export function useTheme() {
  return Colors[useResolvedScheme()];
}
