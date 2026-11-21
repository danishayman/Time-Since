import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { contrastingTextColor, mixColors, readableTextColor } from '@/constants/palette';
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
  // What the unselected chip actually paints behind its label: the wash laid
  // over the screen, flattened so the label can be checked against it.
  const wash = color ? mixColors(color, theme.background, TINT) : theme.background;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      // The pill is 38 high; this takes the area that answers a tap to 48
      // without making the row of chips any taller.
      hitSlop={CHIP_SLOP}
      style={({ pressed }) => [
        styles.chip,
        selected
          ? { backgroundColor: fill, borderColor: fill }
          : {
              // A wash of the category's own colour rather than a bare outline.
              backgroundColor: wash,
              borderColor: color ?? theme.border,
            },
        pressed && styles.pressed,
      ]}>
      <ThemedText
        type="smallBold"
        numberOfLines={1}
        style={
          selected
            ? { color: contrastingTextColor(fill) }
            : // Its own colour while unselected, deepened or lifted as far as it
              // takes to read on the wash; "All" has none and stays grey.
              { color: color ? readableTextColor(color, wash) : theme.textSecondary }
        }>
        {label}
      </ThemedText>
    </Pressable>
  );
}

/** 18% — enough to read as a fill without swamping the label sat on it. */
const TINT = 0.18;

const CHIP_SLOP = { top: 5, bottom: 5 };

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
