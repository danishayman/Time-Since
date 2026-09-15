import { Stack, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import ReorderableList, {
  useIsActive,
  useReorderableDrag,
  type ReorderableListReorderEvent,
} from 'react-native-reorderable-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryFilter } from '@/components/category-filter';
import { Fab } from '@/components/fab';
import { HeaderButton } from '@/components/header-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TimerRow } from '@/components/timer-row';
import { Spacing } from '@/constants/theme';
import { useCategories } from '@/store/categories-context';
import { useSettings } from '@/store/settings-context';
import { useTimers } from '@/store/timers-context';
import type { Timer } from '@/types/timer';
import { categoryOf, resolveFilter } from '@/utils/categories';
import { globalReorderIndices } from '@/utils/reorder';

/**
 * Wraps `TimerRow` so the drag hooks — which must run inside a list cell — stay
 * out of the presentational component.
 */
function TimerListItem({ timer, showCategory }: { timer: Timer; showCategory: boolean }) {
  const router = useRouter();
  const { categories } = useCategories();
  const drag = useReorderableDrag();
  const isActive = useIsActive();

  return (
    <TimerRow
      timer={timer}
      category={showCategory ? categoryOf(timer, categories) : undefined}
      isDragging={isActive}
      onDragStart={drag}
      onPress={() => router.push({ pathname: '/timer/[id]', params: { id: timer.id } })}
    />
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <View style={styles.empty}>
      <ThemedText type="subtitle" style={styles.emptyTitle}>
        {filtered ? 'Nothing here' : 'No timers yet'}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.emptyTitle}>
        {filtered
          ? 'No timers are filed under this category yet.'
          : 'Tap + to track time since — or until — something that matters.'}
      </ThemedText>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { timers, reorderTimers } = useTimers();
  const { categories } = useCategories();
  const { settings, setSetting } = useSettings();

  // With categories switched off nothing filters and nothing is labelled, but
  // the stored ids are left alone so switching back on restores the lot.
  const showCategories = settings.categoriesEnabled;

  // A filter naming a category that has since been deleted falls back to "All".
  const activeFilter = showCategories ? resolveFilter(settings.categoryFilter, categories) : undefined;
  const visible = activeFilter
    ? timers.filter((timer) => categoryOf(timer, categories)?.id === activeFilter.id)
    : timers;

  /**
   * A drag reports positions in the visible list, which is only a subsequence
   * of the stored one while a filter is on, so the indices are translated back
   * before the store acts on them.
   */
  const handleReorder = ({ from, to }: ReorderableListReorderEvent) => {
    const indices = globalReorderIndices(timers, visible, from, to);
    if (indices) {
      reorderTimers(indices.from, indices.to);
    }
  };

  const header = (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderButton
              icon="menu"
              accessibilityLabel="Settings"
              onPress={() => router.push('/settings')}
            />
          ),
        }}
      />
      <CategoryFilter
        categories={showCategories ? categories : []}
        value={activeFilter?.id ?? null}
        onChange={(categoryId) => setSetting('categoryFilter', categoryId)}
        onAdd={() => router.push('/settings/category')}
      />
    </>
  );

  const fab = (
    <Fab
      accessibilityLabel="New timer"
      onPress={() => router.push('/new')}
      bottom={insets.bottom + Spacing.four}
      right={Spacing.four}
    />
  );

  if (visible.length === 0) {
    return (
      <ThemedView style={styles.container}>
        {header}
        <View style={styles.emptyFill}>
          <EmptyState filtered={Boolean(activeFilter)} />
        </View>
        {fab}
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {header}

      <ReorderableList
        data={visible}
        keyExtractor={(timer) => timer.id}
        renderItem={({ item }) => (
          <TimerListItem
            timer={item}
            // Inside a filter every row would name the same category, so the
            // label only earns its place on the unfiltered list.
            showCategory={showCategories && !activeFilter && categories.length > 0}
          />
        )}
        onReorder={handleReorder}
        contentContainerStyle={styles.listContent}
      />

      {fab}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 96,
  },
  emptyFill: {
    flex: 1,
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  emptyTitle: {
    textAlign: 'center',
  },
});
