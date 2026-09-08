import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { contrastingTextColor } from '@/constants/palette';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  label: string;
  /** The category's colour. Omitted for the "All" and "None" chips. */
  color?: string;
  selected: boolean;
  onPress: () => void;
  /** `radio` in the form picker, `button` in the home filter row. */
  accessibilityRole?: 'radio' | 'button';
};

/**
 * A pill naming one category. Selected, it fills with the category's own colour
 * and takes whichever of black or white stays readable on it; unselected, it is
 * an outline so a row of them does not turn into a wall of colour.
 */
export function CategoryChip({
  label,
  color,
  selected,
  onPress,
  accessibilityRole = 'button',
}: Props) {
  const theme = useTheme();
  const fill = color ?? theme.text;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={label}
      accessibilityState={accessibilityRole === 'radio' ? { selected } : { selected }}
      style={({ pressed }) => [
        styles.chip,
        selected
          ? { backgroundColor: fill, borderColor: fill }
          : { borderColor: theme.border, backgroundColor: theme.background },
        pressed && styles.pressed,
      ]}>
      <ThemedText
        type="smallBold"
        numberOfLines={1}
        style={selected ? { color: contrastingTextColor(fill) } : { color: theme.textSecondary }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
