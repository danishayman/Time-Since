import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { CategoryChip } from '@/components/category-chip';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useCategories } from '@/store/categories-context';

type Props = {
  /** Selected category id, or `null` for none. */
  value: string | null;
  onChange: (categoryId: string | null) => void;
};

/**
 * Picks the single category a timer is filed under, as a wrapping row of chips.
 * With no categories defined yet it offers a way to go and make one rather than
 * showing an empty row.
 */
export function CategoryPicker({ value, onChange }: Props) {
  const router = useRouter();
  const { categories } = useCategories();

  if (categories.length === 0) {
    return (
      <Pressable
        onPress={() => router.push('/settings/categories')}
        accessibilityRole="button"
        style={({ pressed }) => [styles.empty, pressed && styles.pressed]}>
        <ThemedText type="linkPrimary" style={styles.link}>
          Create a category
        </ThemedText>
      </Pressable>
    );
  }

  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      <CategoryChip
        label="None"
        selected={value === null}
        onPress={() => onChange(null)}
        accessibilityRole="radio"
      />
      {categories.map((category) => (
        <CategoryChip
          key={category.id}
          label={category.name}
          color={category.color}
          selected={value === category.id}
          onPress={() => onChange(category.id)}
          accessibilityRole="radio"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  empty: {
    alignItems: 'center',
  },
  link: {
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.6,
  },
});
