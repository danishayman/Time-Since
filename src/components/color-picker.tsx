import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { PALETTE, PALETTE_COLUMNS, contrastingTextColor } from '@/constants/palette';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  value: string;
  onChange: (color: string) => void;
};

const ROWS = Array.from({ length: PALETTE.length / PALETTE_COLUMNS }, (_, row) =>
  PALETTE.slice(row * PALETTE_COLUMNS, (row + 1) * PALETTE_COLUMNS)
);

export function ColorPicker({ value, onChange }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.grid}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((color) => {
            const selected = color === value;
            return (
              <Pressable
                key={color}
                onPress={() => onChange(color)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`Color ${color}`}
                style={({ pressed }) => [
                  styles.swatch,
                  { backgroundColor: color },
                  selected && { borderColor: theme.text },
                  pressed && styles.pressed,
                ]}>
                {selected && (
                  <Ionicons name="checkmark" size={22} color={contrastingTextColor(color)} />
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  swatch: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pressed: {
    opacity: 0.7,
  },
});
