import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { DurationBadge } from '@/components/duration-badge';
import { ThemedText } from '@/components/themed-text';
import { readableTextColor } from '@/constants/palette';
import { Spacing } from '@/constants/theme';
import { useLargeText } from '@/hooks/use-large-text';
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
   * Move the row one place up or down. These are what a screen reader offers in
   * place of the drag, which cannot be performed with VoiceOver or TalkBack on.
   * Leave one out where the row is already at that end of the list.
   */
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  /**
   * Named above the label and echoed as a stripe down the left edge. A timer
   * with no category simply gets neither — an "uncategorised" caption would be
   * noise on every row that has not been filed anywhere.
   */
  category?: Category;
};

export function TimerRow({
  timer,
  onPress,
  onDragStart,
  onMoveUp,
  onMoveDown,
  isDragging = false,
  category,
}: Props) {
  const theme = useTheme();
  const large = useLargeText();

  const actions = [
    ...(onMoveUp ? [{ name: 'moveUp', label: 'Move up' }] : []),
    ...(onMoveDown ? [{ name: 'moveDown', label: 'Move down' }] : []),
  ];

  return (
    <Pressable
      onPress={onPress}
      // No label of its own: the row is read from what is in it, so the
      // duration spoken is the one on screen without the row having to tick.
      accessibilityRole="button"
      accessibilityActions={actions}
      onAccessibilityAction={({ nativeEvent }) => {
        if (nativeEvent.actionName === 'moveUp') {
          onMoveUp?.();
        } else if (nativeEvent.actionName === 'moveDown') {
          onMoveDown?.();
        }
      }}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.background, borderBottomColor: theme.border },
        (pressed || isDragging) && { backgroundColor: theme.backgroundElement },
      ]}>
      {category && <View style={[styles.stripe, { backgroundColor: category.color }]} />}

      <Pressable
        onPressIn={onDragStart}
        // The glyph is 24 high; this brings the area that starts a drag up to
        // 48, inside the row's own padding so it never overlaps the badge.
        hitSlop={HANDLE_SLOP}
        // Dragging needs a held touch a screen reader cannot give, so the
        // handle is kept out of its way and the row's Move actions stand in.
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        style={styles.handle}>
        <AppIcon name="reorder" size={24} color={theme.textSecondary} />
      </Pressable>

      {/* Side by side normally; at the largest text sizes the badge goes above
          the name, or the name is squeezed to a letter or two per line. */}
      <View style={large ? styles.stacked : styles.inline}>
        <DurationBadge timer={timer} />

        <View style={large ? undefined : styles.labels}>
          {category && (
            <ThemedText
              type="caption"
              // The stripe carries the category's exact colour; the caption
              // takes a version of it deepened or lifted until it can be read.
              style={[
                styles.category,
                { color: readableTextColor(category.color, theme.background) },
              ]}
              numberOfLines={1}>
              {category.name.toUpperCase()}
            </ThemedText>
          )}
          <ThemedText type="default" style={styles.label} numberOfLines={large ? undefined : 2}>
            {timer.label}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

const HANDLE_SLOP = { top: 12, bottom: 12, left: Spacing.three, right: Spacing.two };

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
  inline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 4,
  },
  stacked: {
    flex: 1,
    gap: Spacing.two,
  },
  labels: {
    flex: 1,
  },
  label: {
    fontWeight: '600',
  },
  category: {
    letterSpacing: 0.6,
  },
});
