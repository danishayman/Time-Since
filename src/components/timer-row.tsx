import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { DurationBadge } from '@/components/duration-badge';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Category } from '@/types/category';
import type { Timer } from '@/types/timer';

type Props = {
  timer: Timer;
  onPress: () => void;
  /** Starts a drag; wired to the reorderable list by the caller. */
  onDragStart: () => void;
  isDragging?: boolean;
  /**
   * Named above the label and echoed as a stripe down the left edge. A timer
   * with no category simply gets neither — an "uncategorised" caption would be
   * noise on every row that has not been filed anywhere.
   */
  category?: Category;
};

export function TimerRow({ timer, onPress, onDragStart, isDragging = false, category }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.background, borderBottomColor: theme.border },
        (pressed || isDragging) && { backgroundColor: theme.backgroundElement },
      ]}>
      {category && <View style={[styles.stripe, { backgroundColor: category.color }]} />}

      <Pressable
        onPressIn={onDragStart}
        hitSlop={Spacing.two}
        accessibilityLabel={`Reorder ${timer.label}`}
        accessibilityRole="button"
        style={styles.handle}>
        <Ionicons name="reorder-two" size={22} color={theme.textSecondary} />
      </Pressable>

      <DurationBadge timer={timer} />

      <View style={styles.labels}>
        {category && (
          <ThemedText style={[styles.category, { color: category.color }]} numberOfLines={1}>
            {category.name.toUpperCase()}
          </ThemedText>
        )}
        <ThemedText type="default" style={styles.label} numberOfLines={2}>
          {timer.label}
        </ThemedText>
      </View>
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
  stripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  handle: {
    paddingRight: Spacing.one,
  },
  labels: {
    flex: 1,
  },
  label: {
    fontWeight: '600',
  },
  category: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
