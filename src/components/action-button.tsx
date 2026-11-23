import { Pressable, StyleSheet } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useLargeText } from '@/hooks/use-large-text';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  icon: AppIconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
};

/**
 * One action in the detail screen's groups: an icon over its label, or a
 * full-width line with the icon beside the label at the largest text sizes.
 */
export function ActionButton({ icon, label, onPress, disabled = false, destructive }: Props) {
  const theme = useTheme();
  const large = useLargeText();
  const color = disabled ? theme.textSecondary : destructive ? theme.danger : theme.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        large ? styles.buttonWide : styles.button,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}>
      <AppIcon name={icon} size={30} color={color} scaleWithText />
      <ThemedText type="small" style={[large ? styles.labelWide : styles.label, { color }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  // At the largest text sizes a third of the width cannot hold a label without
  // breaking it mid-word, so each action takes a full line, icon beside label.
  buttonWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    textAlign: 'center',
  },
  labelWide: {
    flexShrink: 1,
  },
});
