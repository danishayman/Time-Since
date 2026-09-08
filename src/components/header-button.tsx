import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = {
  onPress: () => void;
  accessibilityLabel: string;
  /** Either an icon or a text label — text wins when both are given. */
  icon?: IconName;
  title?: string;
  disabled?: boolean;
};

export function HeaderButton({ onPress, accessibilityLabel, icon, title, disabled }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={Spacing.two}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.button, (pressed || disabled) && styles.pressed]}>
      {title ? (
        <ThemedText type="default" style={styles.title}>
          {title}
        </ThemedText>
      ) : icon ? (
        <Ionicons name={icon} size={24} color={theme.text} />
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
});
