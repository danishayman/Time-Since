import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { SettingsList } from '@/components/settings/settings-list';
import { SettingsRow } from '@/components/settings/settings-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCategories } from '@/store/categories-context';
import { useSettings } from '@/store/settings-context';
import { useTimer, useTimers } from '@/store/timers-context';
import { categoryOf } from '@/utils/categories';
import { tapFeedback } from '@/utils/haptics';

/**
 * Moves one timer between categories. Applies on tap with no Save, matching the
 * format screen — the alternative was the create/edit form, which is four taps
 * away and makes changing a category feel like editing the whole timer.
 */
export default function TimerCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const timer = useTimer(id);
  const { setCategory } = useTimers();
  const { categories } = useCategories();
  const { settings } = useSettings();

  if (!timer) {
    return (
      <ThemedView style={styles.missing}>
        <ThemedText type="small" themeColor="textSecondary">
          Timer not found.
        </ThemedText>
      </ThemedView>
    );
  }

  // Resolved rather than compared raw, so a timer pointing at a deleted
  // category shows "None" selected instead of nothing at all.
  const current = categoryOf(timer, categories);

  const choose = (categoryId: string | null) => {
    tapFeedback(settings.haptics);
    setCategory(timer.id, categoryId);
    router.back();
  };

  const check = (selected: boolean) =>
    selected ? <AppIcon name="checkmark" size={20} color={theme.text} /> : undefined;

  return (
    <ThemedView style={styles.container}>
      <ScreenScrollView contentContainerStyle={styles.content}>
        <SettingsList footer="A timer belongs to one category at most.">
          <SettingsRow
            icon="none"
            label="None"
            accessibilityRole="radio"
            accessibilityState={{ selected: !current }}
            right={check(!current)}
            onPress={() => choose(null)}
          />
          {categories.map((category) => (
            <SettingsRow
              key={category.id}
              icon="dot"
              iconColor={category.color}
              label={category.name}
              accessibilityRole="radio"
              accessibilityState={{ selected: current?.id === category.id }}
              right={check(current?.id === category.id)}
              onPress={() => choose(category.id)}
            />
          ))}
        </SettingsList>

        {categories.length === 0 && (
          <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
            No categories yet. Add one under Settings, then come back here.
          </ThemedText>
        )}
      </ScreenScrollView>
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
    textAlign: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
});
