import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTimer, useTimers } from '@/store/timers-context';

export default function NotificationsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const timer = useTimer(id);
  const { setNotificationsEnabled } = useTimers();

  if (!timer) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="small" themeColor="textSecondary">
          Timer not found.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.row}>
        <ThemedText type="default" style={styles.rowLabel}>
          Milestone reminders
        </ThemedText>
        <Switch
          value={timer.notificationsEnabled}
          onValueChange={(enabled) => setNotificationsEnabled(timer.id, enabled)}
        />
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        The preference is saved, but reminders are not delivered yet.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
  },
  rowLabel: {
    flex: 1,
    fontWeight: '600',
  },
});
