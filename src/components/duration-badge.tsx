import { StyleSheet, Text, View } from 'react-native';

import { contrastingTextColor, mixColors } from '@/constants/palette';
import { Spacing, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Timer } from '@/types/timer';
import { signedElapsedMs } from '@/utils/elapsed';
import { formatDuration } from '@/utils/format-duration';
import { useNow } from '@/utils/ticker';

type Props = {
  timer: Timer;
  size?: 'row' | 'detail';
};

/**
 * How much of the timer's colour a stopped badge keeps; the rest is the screen
 * behind it. Fading the fill alone, and then choosing the text colour for the
 * faded fill, keeps the "dimmed means stopped" reading without dimming the
 * digits — an opacity over the whole badge took them below 3:1.
 */
const STOPPED_FILL = 0.55;

/**
 * The only component in the app that subscribes to the one-second clock.
 * Keeping the subscription here means a tick re-renders this badge alone, not
 * the row around it and not the list.
 */
export function DurationBadge({ timer, size = 'row' }: Props) {
  const theme = useTheme();
  const now = useNow();
  const text = formatDuration(signedElapsedMs(timer, now), timer.format);
  const fill = timer.isRunning
    ? timer.color
    : mixColors(timer.color, theme.background, STOPPED_FILL);

  return (
    <View
      style={[styles.badge, size === 'detail' && styles.badgeDetail, { backgroundColor: fill }]}>
      <Text
        style={[
          styles.text,
          size === 'detail' && styles.textDetail,
          { color: contrastingTextColor(fill) },
        ]}
        // The fade is the only thing on the row that says a timer is stopped,
        // and a screen reader cannot see it.
        accessibilityLabel={timer.isRunning ? undefined : `${text}, stopped`}
        numberOfLines={1}
        // A duration has nowhere sensible to wrap and losing its last digits
        // misreports it, so at the largest text sizes it shrinks just enough
        // to fit the width instead.
        adjustsFontSizeToFit
        minimumFontScale={0.5}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    alignSelf: 'flex-start',
    // Never wider than the space it sits in, so the text has a width to fit.
    maxWidth: '100%',
  },
  badgeDetail: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 4,
    borderRadius: Spacing.two + 2,
    alignSelf: 'center',
  },
  text: {
    fontSize: Type.body.fontSize,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  textDetail: {
    fontSize: Type.title.fontSize,
  },
});
