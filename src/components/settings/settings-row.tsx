import type { ComponentProps, ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View, type AccessibilityRole } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useLargeText } from '@/hooks/use-large-text';
import { useTheme } from '@/hooks/use-theme';

const ICON_SIZE = 24;

/** Smaller and quieter than the row's own icon, as the iOS disclosure indicator is. */
const DISCLOSURE_SIZE = 14;

/** iOS convention, mirrored on web; see `navigates`. */
const SHOW_DISCLOSURE = Platform.OS !== 'android';

type Props = {
  icon: AppIconName;
  /** Overrides the icon's colour, for rows that stand for a coloured thing. */
  iconColor?: string;
  label: string;
  /** Second line, for anything the label alone leaves ambiguous. */
  description?: string;
  /** Right-aligned secondary text, typically the current value. */
  value?: string;
  /**
   * A value that is not plain text, such as a ticking duration or a picker.
   * Placed like `value`: at the end of the row, or under the label at large
   * text sizes.
   */
  valueElement?: ReactNode;
  /** Right-hand slot for a fixed-width control such as a switch. Always trailing. */
  right?: ReactNode;
  onPress?: () => void;
  /** Paints the icon and label with the danger colour. */
  destructive?: boolean;
  /**
   * The row opens another screen. On iOS that is shown with a trailing chevron,
   * so it reads differently from a row that acts where it is; Material marks
   * neither, so Android shows nothing.
   */
  navigates?: boolean;
  accessibilityRole?: AccessibilityRole;
  /** What tapping the row does, where the label alone does not say. */
  accessibilityHint?: string;
  accessibilityState?: ComponentProps<typeof Pressable>['accessibilityState'];
  /** What a screen reader gives as the row's value. Defaults to `value`. */
  accessibilityValue?: string;
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
  valueElement,
  right,
  onPress,
  destructive = false,
  navigates = false,
  accessibilityRole,
  accessibilityHint,
  accessibilityState,
  accessibilityValue,
}: Props) {
  const theme = useTheme();
  const large = useLargeText();
  const tint = destructive ? theme.danger : theme.text;
  const spokenValue = accessibilityValue ?? value;

  const valueNode =
    value || valueElement ? (
      <>
        {value ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={large ? undefined : 1}>
            {value}
          </ThemedText>
        ) : null}
        {valueElement}
      </>
    ) : null;

  const content = (
    <>
      <AppIcon name={icon} size={ICON_SIZE} color={iconColor ?? tint} scaleWithText />

      <View style={styles.labels}>
        <ThemedText type="default" style={[styles.label, { color: tint }]}>
          {label}
        </ThemedText>
        {description ? (
          <ThemedText type="small" themeColor="textSecondary">
            {description}
          </ThemedText>
        ) : null}
        {/* At the largest text sizes the value moves under the label, which
            would otherwise be squeezed to a letter or two per line. */}
        {large && valueNode ? <View style={styles.valueBelow}>{valueNode}</View> : null}
      </View>

      {large ? null : valueNode}

      {right}

      {navigates && SHOW_DISCLOSURE ? (
        <AppIcon name="disclosure" size={DISCLOSURE_SIZE} color={theme.textSecondary} scaleWithText />
      ) : null}
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={accessibilityRole ?? 'button'}
      // A label replaces everything inside the row for a screen reader, so the
      // second line and the current value have to be handed over explicitly or
      // they are never spoken: "Theme" with no "Dark", a category with no count.
      accessibilityLabel={description ? `${label}, ${description}` : label}
      aria-valuetext={spokenValue}
      accessibilityHint={accessibilityHint}
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
  valueBelow: {
    alignItems: 'flex-start',
  },
  label: {
    fontWeight: '600',
  },
});
