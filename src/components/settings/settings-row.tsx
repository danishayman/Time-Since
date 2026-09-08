import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, View, type AccessibilityRole } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type IoniconName = ComponentProps<typeof Ionicons>['name'];

const ICON_SIZE = 24;

/** Where a row's text starts, so anything nested under one can line up with it. */
export const ROW_TEXT_INSET = Spacing.four + ICON_SIZE + Spacing.three;

type Props = {
  icon: IoniconName;
  /** Overrides the icon's colour, for rows that stand for a coloured thing. */
  iconColor?: string;
  label: string;
  /** Second line, for anything the label alone leaves ambiguous. */
  description?: string;
  /** Right-aligned secondary text, typically the current value. */
  value?: string;
  /** Right-hand slot, for a switch or a swatch. Rendered after `value`. */
  right?: ReactNode;
  onPress?: () => void;
  /** Paints the icon and label with the danger colour. */
  destructive?: boolean;
  showChevron?: boolean;
  /** Points down when collapsed and up when expanded, for the picker rows. */
  chevronUp?: boolean;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: ComponentProps<typeof Pressable>['accessibilityState'];
};

/**
 * One full-width line in a `SettingsList`.
 *
 * Rendered as a `Pressable` only when it does something, so a read-only row is
 * not announced as a button.
 */
export function SettingsRow({
  icon,
  iconColor,
  label,
  description,
  value,
  right,
  onPress,
  destructive = false,
  showChevron = false,
  chevronUp = false,
  accessibilityRole,
  accessibilityState,
}: Props) {
  const theme = useTheme();
  const tint = destructive ? theme.danger : theme.text;

  const content = (
    <>
      <Ionicons name={icon} size={ICON_SIZE} color={iconColor ?? tint} />

      <View style={styles.labels}>
        <ThemedText type="default" style={[styles.label, { color: tint }]}>
          {label}
        </ThemedText>
        {description ? (
          <ThemedText type="small" themeColor="textSecondary">
            {description}
          </ThemedText>
        ) : null}
      </View>

      {value ? (
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {value}
        </ThemedText>
      ) : null}

      {right}

      {showChevron && (
        <Ionicons
          name={chevronUp ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={theme.textSecondary}
        />
      )}
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={accessibilityRole ?? 'button'}
      accessibilityLabel={label}
      accessibilityState={accessibilityState}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: theme.backgroundElement },
      ]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    minHeight: 60,
  },
  labels: {
    flex: 1,
    gap: Spacing.half,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
  },
});
