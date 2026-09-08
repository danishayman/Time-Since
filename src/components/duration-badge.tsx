import { StyleSheet, Text, View } from 'react-native';

import { contrastingTextColor } from '@/constants/palette';
import { Spacing } from '@/constants/theme';
import type { Timer } from '@/types/timer';
import { signedElapsedMs } from '@/utils/elapsed';
import { formatDuration } from '@/utils/format-duration';
import { useNow } from '@/utils/ticker';

type Props = {
  timer: Timer;
  size?: 'row' | 'detail';
};

/**
 * The only component in the app that subscribes to the one-second clock.
 * Keeping the subscription here means a tick re-renders this badge alone, not
 * the row around it and not the list.
 */
export function DurationBadge({ timer, size = 'row' }: Props) {
  const now = useNow();
  const text = formatDuration(signedElapsedMs(timer, now), timer.format);
  const textColor = contrastingTextColor(timer.color);

  return (
    <View
      style={[
        styles.badge,
        size === 'detail' && styles.badgeDetail,
        { backgroundColor: timer.color },
        !timer.isRunning && styles.stopped,
      ]}>
      <Text
        style={[styles.text, size === 'detail' && styles.textDetail, { color: textColor }]}
        numberOfLines={1}>
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
  },
  badgeDetail: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 4,
    borderRadius: Spacing.two + 2,
    alignSelf: 'center',
  },
  stopped: {
    opacity: 0.55,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  textDetail: {
    fontSize: 24,
  },
});
