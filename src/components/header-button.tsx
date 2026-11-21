import { Pressable, StyleSheet } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  onPress: () => void;
  accessibilityLabel: string;
  /** Either an icon or a text label — text wins when both are given. */
  icon?: AppIconName;
  title?: string;
  /** Regular weight, for the way out (Cancel) next to a bold way forward (Save). */
  subdued?: boolean;
  disabled?: boolean;
};

export function HeaderButton({
  onPress,
  accessibilityLabel,
  icon,
  title,
  subdued = false,
  disabled = false,
}: Props) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={Spacing.two}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.button, (pressed || disabled) && styles.pressed]}>
      {title ? (
        <ThemedText type="default" style={subdued ? styles.subdued : styles.title}>
          {title}
        </ThemedText>
      ) : icon ? (
        <AppIcon name={icon} size={24} color={theme.text} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: Spacing.one,
    paddingVertical: Spacing.one,
  },
  pressed: {
    opacity: 0.5,
  },
  title: {
    fontWeight: '600',
  },
  subdued: {
    fontWeight: '400',
  },
});
