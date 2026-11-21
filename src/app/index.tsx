import { Stack, useRouter } from 'expo-router';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
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
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useCategories } from '@/store/categories-context';
import { useSettings } from '@/store/settings-context';
import { useTimers } from '@/store/timers-context';
import type { Timer } from '@/types/timer';
import { categoryOf, resolveFilter } from '@/utils/categories';
import { globalReorderIndices } from '@/utils/reorder';

/**
 * Where "new timer" lives. iOS puts a screen's primary action in the navigation
 * bar; a floating button is Android's convention and reads as a port there.
 */
const ADD_IN_HEADER = Platform.OS === 'ios';

/** The floating button's footprint: its own 56 plus the margin under it. */
const FAB_CLEARANCE = 56 + Spacing.four;

type TimerListItemProps = {
  timer: Timer;
  showCategory: boolean;
  /** Moves the row one place, for people who cannot drag. Absent at the ends. */
  onMoveUp?: () => void;
  onMoveDown?: () => void;
};

/**
 * Wraps `TimerRow` so the drag hooks — which must run inside a list cell — stay
 * out of the presentational component.
 */
function TimerListItem({ timer, showCategory, onMoveUp, onMoveDown }: TimerListItemProps) {
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
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      onPress={() => router.push({ pathname: '/timer/[id]', params: { id: timer.id } })}
    />
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <View style={styles.empty}>
      <ThemedText type="title" style={styles.emptyTitle}>
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
  const activeFilter = showCategories
    ? resolveFilter(settings.categoryFilter, categories)
    : undefined;
  const visible = activeFilter
    ? timers.filter((timer) => categoryOf(timer, categories)?.id === activeFilter.id)
    : timers;

  /**
   * A drag reports positions in the visible list, which is only a subsequence
   * of the stored one while a filter is on, so the indices are translated back
   * before the store acts on them.
   */
  const handleReorder = ({ from, to }: Pick<ReorderableListReorderEvent, 'from' | 'to'>) => {
    const indices = globalReorderIndices(timers, visible, from, to);
    if (indices) {
      reorderTimers(indices.from, indices.to);
    }
  };

  const openNew = () => router.push('/new');

  const screenOptions = (
    <Stack.Screen
      options={{
        headerRight: () => (
          <View style={styles.headerActions}>
            {ADD_IN_HEADER && (
              <HeaderButton icon="add" accessibilityLabel="New timer" onPress={openNew} />
            )}
            <HeaderButton
              icon="settings"
              accessibilityLabel="Settings"
              onPress={() => router.push('/settings')}
            />
          </View>
        ),
      }}
    />
  );

  // Scrolls with the list rather than sitting above it: the list has to be the
  // first scroll view on the screen for the iOS large title to collapse into
  // the bar, and the filter's own horizontal scroller would otherwise be found
  // first.
  const filter = (
    <CategoryFilter
      categories={showCategories ? categories : []}
      value={activeFilter?.id ?? null}
      onChange={(categoryId) => setSetting('categoryFilter', categoryId)}
      onAdd={() => router.push('/settings/category')}
    />
  );

  const fab = ADD_IN_HEADER ? null : (
    <Fab
      accessibilityLabel="New timer"
      onPress={openNew}
      bottom={insets.bottom + Spacing.four}
      right={insets.right + Spacing.four}
    />
  );

  // In landscape the system keeps a strip clear down one side (a camera
  // cutout, a navigation bar), and the header already steps in from it; the
  // content follows rather than running underneath.
  const sideInsets = { paddingLeft: insets.left, paddingRight: insets.right };

  // The last row has to scroll clear of the system bar, and of the floating
  // button where there is one. On iOS the scroll view's automatic inset
  // adjustment already keeps it clear of the home indicator.
  const listPadding = {
    paddingBottom: ADD_IN_HEADER ? Spacing.five : insets.bottom + FAB_CLEARANCE + Spacing.three,
  };

  if (visible.length === 0) {
    return (
      <ThemedView style={styles.container}>
        {screenOptions}
        <View style={[styles.safeArea, sideInsets]}>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={styles.emptyContent}>
            {filter}
            <View style={styles.emptyFill}>
              <EmptyState filtered={Boolean(activeFilter)} />
            </View>
          </ScrollView>
        </View>
        {fab}
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {screenOptions}
      <View style={[styles.safeArea, sideInsets]}>
        <View style={styles.column}>
          <ReorderableList
            data={visible}
            ListHeaderComponent={filter}
            contentInsetAdjustmentBehavior="automatic"
            keyExtractor={(timer) => timer.id}
            renderItem={({ item, index }) => (
              <TimerListItem
                timer={item}
                // Inside a filter every row would name the same category, so the
                // label only earns its place on the unfiltered list.
                showCategory={showCategories && !activeFilter && categories.length > 0}
                onMoveUp={
                  index > 0 ? () => handleReorder({ from: index, to: index - 1 }) : undefined
                }
                onMoveDown={
                  index < visible.length - 1
                    ? () => handleReorder({ from: index, to: index + 1 })
                    : undefined
                }
              />
            )}
            onReorder={handleReorder}
            contentContainerStyle={listPadding}
          />
        </View>
      </View>

      {fab}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  // Caps the filter row and the list at a readable width on a tablet; on a
  // phone it is simply the full screen. The floating button stays outside it,
  // at the corner of the display where a thumb expects it.
  column: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  // `column` without the `flex`, which a scroll view's content cannot take.
  emptyContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
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
