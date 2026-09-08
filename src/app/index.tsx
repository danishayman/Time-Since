import { Stack, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import ReorderableList, {
  NestedReorderableList,
  ScrollViewContainer,
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
import { useTheme } from '@/hooks/use-theme';
import { useCategories } from '@/store/categories-context';
import { useSettings } from '@/store/settings-context';
import { useTimers } from '@/store/timers-context';
import type { Category } from '@/types/category';
import type { Timer } from '@/types/timer';
import { categoryOf, groupTimers, resolveFilter } from '@/utils/categories';
import { globalReorderIndices, sortTimers } from '@/utils/sort-timers';
import { useNowSnapshot } from '@/utils/ticker';

/**
 * Wraps `TimerRow` so the drag hooks — which must run inside a list cell — stay
 * out of the presentational component.
 */
function TimerListItem({
  timer,
  draggable,
  showCategory,
}: {
  timer: Timer;
  draggable: boolean;
  showCategory: boolean;
}) {
  const router = useRouter();
  const { categories } = useCategories();
  const drag = useReorderableDrag();
  const isActive = useIsActive();

  return (
    <TimerRow
      timer={timer}
      category={showCategory ? categoryOf(timer, categories) : undefined}
      isDragging={isActive}
      onDragStart={draggable ? drag : undefined}
      onPress={() => router.push({ pathname: '/timer/[id]', params: { id: timer.id } })}
    />
  );
}

function SectionHeading({ category }: { category: Category | null }) {
  const theme = useTheme();

  return (
    <View style={[styles.heading, { borderBottomColor: theme.border }]}>
      <View style={[styles.dot, { backgroundColor: category?.color ?? theme.textSecondary }]} />
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.headingLabel}>
        {(category?.name ?? 'Uncategorised').toUpperCase()}
      </ThemedText>
    </View>
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
  // Reads the clock without subscribing to it: ordering by elapsed time needs a
  // `now`, but every timer advances at the same rate, so the ranking only has
  // to be recomputed when the list itself changes.
  const now = useNowSnapshot();

  // A filter naming a category that has since been deleted falls back to "All".
  const activeFilter = resolveFilter(settings.categoryFilter, categories);
  const filtered = activeFilter
    ? timers.filter((timer) => categoryOf(timer, categories)?.id === activeFilter.id)
    : timers;

  const manual = settings.sortMode === 'manual';
  const visible = sortTimers(filtered, settings.sortMode, now);

  // Sections only earn their keep on the unfiltered list — inside a filter every
  // row would sit under the same heading.
  const grouped = settings.groupByCategory && !activeFilter && categories.length > 0;
  const sections = grouped ? groupTimers(visible, categories) : [];

  /** A drag inside a section or a filtered list still moves the stored array. */
  const reorderWithin = (run: Timer[], { from, to }: ReorderableListReorderEvent) => {
    if (!manual) {
      return;
    }
    const indices = globalReorderIndices(timers, run, from, to);
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
        categories={categories}
        value={activeFilter?.id ?? null}
        onChange={(categoryId) => setSetting('categoryFilter', categoryId)}
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

      {grouped ? (
        <ScrollViewContainer contentContainerStyle={styles.listContent}>
          {sections.map((section) => (
            <View key={section.category?.id ?? 'uncategorised'}>
              <SectionHeading category={section.category} />
              <NestedReorderableList
                data={section.timers}
                // The outer container does all the scrolling. `scrollable`
                // governs autoscroll during a drag; `scrollEnabled` is the
                // underlying list's own prop, and leaving it on is what makes
                // React Native warn about nesting a list inside a ScrollView.
                scrollable={false}
                scrollEnabled={false}
                keyExtractor={(timer) => timer.id}
                renderItem={({ item }) => (
                  <TimerListItem timer={item} draggable={manual} showCategory={false} />
                )}
                onReorder={(event) => reorderWithin(section.timers, event)}
              />
            </View>
          ))}
        </ScrollViewContainer>
      ) : (
        <ReorderableList
          data={visible}
          keyExtractor={(timer) => timer.id}
          renderItem={({ item }) => (
            <TimerListItem
              timer={item}
              draggable={manual}
              showCategory={!activeFilter && categories.length > 0}
            />
          )}
          onReorder={(event) => reorderWithin(visible, event)}
          contentContainerStyle={styles.listContent}
        />
      )}

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
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headingLabel: {
    letterSpacing: 0.8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
