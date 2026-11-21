import { Platform, Switch, type SwitchProps } from 'react-native';

import { mixColors } from '@/constants/palette';
import { useTheme } from '@/hooks/use-theme';

/**
 * The platform switch, coloured with the app's tint when it is on instead of the
 * system green on iOS or the stock accent on Android.
 *
 * Each platform keeps its own anatomy: iOS has a white thumb on a solid track,
 * so only the track is tinted; Android's thumb carries the colour and its track
 * is a paler wash of the same one.
 */
export function ThemedSwitch({ value, ...rest }: SwitchProps) {
  const theme = useTheme();

  if (Platform.OS === 'android') {
    return (
      <Switch
        value={value}
        thumbColor={value ? theme.tint : undefined}
        trackColor={{ true: mixColors(theme.tint, theme.background, 0.45) }}
        {...rest}
      />
    );
  }

  return <Switch value={value} trackColor={{ true: theme.tint }} {...rest} />;
}
