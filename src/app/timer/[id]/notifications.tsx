import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ScreenScrollView } from '@/components/screen-scroll-view';
import { SettingsList } from '@/components/settings/settings-list';
import { SettingsSwitchRow } from '@/components/settings/settings-switch-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTimer, useTimers } from '@/store/timers-context';

/**
 * Not linked from the timer screen for now — see `REMINDERS_DELIVERED` there.
 * Kept in the same shape as every other settings screen so it is ready to be
 * linked again the day reminders are actually delivered.
 */
export default function NotificationsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const timer = useTimer(id);
  const { setNotificationsEnabled } = useTimers();

  if (!timer) {
    return (
      <ThemedView style={styles.missing}>
        <ThemedText type="small" themeColor="textSecondary">
          Timer not found.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScreenScrollView contentContainerStyle={styles.content}>
        <SettingsList footer="The preference is saved, but reminders are not delivered yet.">
          <SettingsSwitchRow
            icon="notifications"
            label="Milestone reminders"
            value={timer.notificationsEnabled}
            onValueChange={(enabled) => setNotificationsEnabled(timer.id, enabled)}
          />
        </SettingsList>
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
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
});
