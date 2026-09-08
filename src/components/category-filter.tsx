import { ScrollView, StyleSheet, View } from 'react-native';

import { CategoryChip } from '@/components/category-chip';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Category } from '@/types/category';

type Props = {
  categories: Category[];
  /** Selected category id, or `null` for "All". */
  value: string | null;
  onChange: (categoryId: string | null) => void;
};

/**
 * The row of filter pills above the home list. Renders nothing at all when no
 * categories exist, so a user who never opens the feature sees the list exactly
 * as it was before categories were added.
 */
export function CategoryFilter({ categories, value, onChange }: Props) {
  const theme = useTheme();

  if (categories.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { borderBottomColor: theme.border }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <CategoryChip label="All" selected={value === null} onPress={() => onChange(null)} />
        {categories.map((category) => (
          <CategoryChip
            key={category.id}
            label={category.name}
            color={category.color}
            selected={value === category.id}
            onPress={() => onChange(category.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
  },
});
