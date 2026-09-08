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
  /**
   * Starts a drag; wired to the reorderable list by the caller. Omitted when
   * the list is sorted automatically, which also hides the handle — dragging a
   * derived order would write meaningless positions back to the store.
   */
  onDragStart?: () => void;
  isDragging?: boolean;
  /**
   * Shown as a coloured dot and name under the label. Left off in the grouped
   * home list, where the section heading already says it.
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
      {onDragStart && (
        <Pressable
          onPressIn={onDragStart}
          hitSlop={Spacing.two}
          accessibilityLabel={`Reorder ${timer.label}`}
          accessibilityRole="button"
          style={styles.handle}>
          <Ionicons name="reorder-two" size={22} color={theme.textSecondary} />
        </Pressable>
      )}

      <DurationBadge timer={timer} />

      <View style={styles.labels}>
        <ThemedText type="default" style={styles.label} numberOfLines={2}>
          {timer.label}
        </ThemedText>
        {category && (
          <View style={styles.category}>
            <View style={[styles.dot, { backgroundColor: category.color }]} />
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {category.name}
            </ThemedText>
          </View>
        )}
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
  handle: {
    paddingRight: Spacing.one,
  },
  labels: {
    flex: 1,
    gap: Spacing.half,
  },
  label: {
    fontWeight: '600',
  },
  category: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
