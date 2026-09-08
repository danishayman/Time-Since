import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { DurationBadge } from '@/components/duration-badge';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Timer } from '@/types/timer';

type Props = {
  timer: Timer;
  onPress: () => void;
  /** Starts a drag; wired to the reorderable list by the caller. */
  onDragStart: () => void;
  isDragging?: boolean;
};

export function TimerRow({ timer, onPress, onDragStart, isDragging = false }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.background, borderBottomColor: theme.border },
        (pressed || isDragging) && { backgroundColor: theme.backgroundElement },
      ]}>
      <Pressable
        onPressIn={onDragStart}
        hitSlop={Spacing.two}
        accessibilityLabel={`Reorder ${timer.label}`}
        accessibilityRole="button"
        style={styles.handle}>
        <Ionicons name="reorder-two" size={22} color={theme.textSecondary} />
      </Pressable>

      <DurationBadge timer={timer} />

      <ThemedText type="default" style={styles.label} numberOfLines={2}>
        {timer.label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 4,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  handle: {
    paddingRight: Spacing.one,
  },
  label: {
    flex: 1,
    fontWeight: '600',
  },
});
