import { Alert, StyleSheet } from 'react-native';

import { ScreenScrollView } from '@/components/screen-scroll-view';
import { SettingsList } from '@/components/settings/settings-list';
import { SettingsRow } from '@/components/settings/settings-row';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useCategories } from '@/store/categories-context';
import { useSettings } from '@/store/settings-context';
import { useTimers } from '@/store/timers-context';
import { exportTimers, pickBackup, reidentifyBackup } from '@/utils/backup';
import { successFeedback, warningFeedback } from '@/utils/haptics';

function plural(count: number): string {
  return `${count} timer${count === 1 ? '' : 's'}`;
}

export default function DataScreen() {
  const { settings, resetSettings } = useSettings();
  const { timers, importTimers, clearTimers } = useTimers();
  const { categories, importCategories } = useCategories();

  const { haptics } = settings;

  const handleExport = async () => {
    if (timers.length === 0) {
      Alert.alert('Nothing to export', 'Create a timer first.');
      return;
    }
    try {
      const shared = await exportTimers(timers, categories);
      if (!shared) {
        Alert.alert('Export unavailable', 'This device has no way to share a file.');
      }
    } catch (error) {
      console.warn('[time-since] export failed', error);
      Alert.alert('Export failed', 'The backup file could not be written.');
    }
  };

  const handleImport = async () => {
    try {
      const imported = await pickBackup();
      if (!imported) {
        return;
      }
      if (imported.timers.length === 0) {
        Alert.alert('Nothing to import', 'That backup has no timers in it.');
        return;
      }

      const found = plural(imported.timers.length);
      const withCategories =
        imported.categories.length > 0
          ? `${found} and ${imported.categories.length} categor${imported.categories.length === 1 ? 'y' : 'ies'}`
          : found;

      Alert.alert('Import backup', `Found ${withCategories}. Add to your list, or replace it?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Merge',
          onPress: () => {
            // Fresh ids all round, so importing the same file twice appends a
            // second copy instead of colliding — and so the appended timers
            // still point at the categories that came with them.
            const fresh = reidentifyBackup(imported);
            importCategories([...categories, ...fresh.categories]);
            importTimers(fresh.timers, 'merge');
            successFeedback(haptics);
          },
        },
        {
          text: 'Replace',
          style: 'destructive',
          onPress: () => {
            importCategories(imported.categories);
            importTimers(imported.timers, 'replace');
            successFeedback(haptics);
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Import failed',
        error instanceof Error ? error.message : 'That file could not be read.'
      );
    }
  };

  const handleDeleteAll = () => {
    if (timers.length === 0) {
      Alert.alert('No timers', 'There is nothing to delete.');
      return;
    }
    warningFeedback(haptics);
    Alert.alert(
      'Delete all timers',
      `Delete all ${plural(timers.length)}? This cannot be undone — export a backup first if you might want them back.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete all', style: 'destructive', onPress: clearTimers },
      ]
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Reset settings',
      'Put every setting back to its default? Your timers are not touched.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetSettings },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScreenScrollView contentContainerStyle={styles.content}>
        <SettingsList footer="Backups are plain JSON — they hold your timers, not your settings.">
          <SettingsRow icon="share" label="Export timers" onPress={handleExport} />
          <SettingsRow icon="import" label="Import timers" onPress={handleImport} />
          <SettingsRow
            icon="trash"
            label="Delete all timers"
            destructive
            onPress={handleDeleteAll}
          />
          <SettingsRow
            icon="reset"
            label="Reset settings"
            destructive
            onPress={handleReset}
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
});
