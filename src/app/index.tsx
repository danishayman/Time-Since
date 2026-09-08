import { Stack, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import ReorderableList, {
  useIsActive,
  useReorderableDrag,
  type ReorderableListReorderEvent,
} from 'react-native-reorderable-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fab } from '@/components/fab';
import { HeaderButton } from '@/components/header-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TimerRow } from '@/components/timer-row';
import { Spacing } from '@/constants/theme';
import { useTimers } from '@/store/timers-context';
import type { Timer } from '@/types/timer';

/**
 * Wraps `TimerRow` so the drag hooks — which must run inside a list cell — stay
 * out of the presentational component.
 */
function TimerListItem({ timer }: { timer: Timer }) {
  const router = useRouter();
  const drag = useReorderableDrag();
  const isActive = useIsActive();

  return (
    <TimerRow
      timer={timer}
      isDragging={isActive}
      onDragStart={drag}
      onPress={() => router.push({ pathname: '/timer/[id]', params: { id: timer.id } })}
    />
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <ThemedText type="subtitle" style={styles.emptyTitle}>
        No timers yet
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.emptyTitle}>
        Tap + to track time since — or until — something that matters.
      </ThemedText>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { timers, reorderTimers } = useTimers();

  const handleReorder = ({ from, to }: ReorderableListReorderEvent) => reorderTimers(from, to);

  return (
    <ThemedView style={styles.container}>
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

      <ReorderableList
        data={timers}
        keyExtractor={(timer) => timer.id}
        renderItem={({ item }) => <TimerListItem timer={item} />}
        onReorder={handleReorder}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={[
          styles.listContent,
          timers.length === 0 && styles.listContentEmpty,
        ]}
      />

      <Fab
        accessibilityLabel="New timer"
        onPress={() => router.push('/new')}
        bottom={insets.bottom + Spacing.four}
        right={Spacing.four}
      />
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
  listContentEmpty: {
    flexGrow: 1,
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
