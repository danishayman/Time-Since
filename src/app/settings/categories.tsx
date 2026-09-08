import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { SettingsList } from '@/components/settings/settings-list';
import { SettingsRow } from '@/components/settings/settings-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useCategories } from '@/store/categories-context';
import { useSettings } from '@/store/settings-context';
import { useTimers } from '@/store/timers-context';
import { countByCategory } from '@/utils/categories';
import { tapFeedback } from '@/utils/haptics';

function plural(count: number): string {
  return `${count} timer${count === 1 ? '' : 's'}`;
}

export default function CategoriesScreen() {
  const router = useRouter();
  const { categories } = useCategories();
  const { timers } = useTimers();
  const { settings } = useSettings();

  const counts = countByCategory(timers, categories);

  const open = (id?: string) => {
    tapFeedback(settings.haptics);
    router.push(id ? { pathname: '/settings/category', params: { id } } : '/settings/category');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <SettingsList footer="A timer belongs to one category at most. Set it when you create or edit the timer.">
          {categories.map((category) => (
            <SettingsRow
              key={category.id}
              icon="ellipse"
              iconColor={category.color}
              label={category.name}
              value={plural(counts[category.id] ?? 0)}
              onPress={() => open(category.id)}
            />
          ))}
          <SettingsRow icon="add" label="New category" onPress={() => open()} />
        </SettingsList>

        {categories.length === 0 && (
          <View style={styles.empty}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
              No categories yet. Add one to start grouping your timers.
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing.five,
  },
  empty: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  emptyText: {
    textAlign: 'center',
  },
});
