import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { ScrollView, StyleSheet } from 'react-native';

import { SettingsList } from '@/components/settings/settings-list';
import { SettingsRow } from '@/components/settings/settings-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTimers } from '@/store/timers-context';

const REPO_URL = 'https://github.com/danishayman/Time-Since';

export default function AboutScreen() {
  const { timers } = useTimers();

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <SettingsList>
          <SettingsRow
            icon="information-circle-outline"
            label="Time Since"
            description={`Version ${Constants.expoConfig?.version ?? '1.0.0'}`}
            value={`${timers.length} timer${timers.length === 1 ? '' : 's'}`}
          />
          <SettingsRow
            icon="logo-github"
            label="Source on GitHub"
            onPress={() => WebBrowser.openBrowserAsync(REPO_URL)}
          />
        </SettingsList>

        <ThemedText type="small" themeColor="textSecondary" style={styles.tagline}>
          Time Since keeps everything on this device.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: Spacing.four,
  },
  tagline: {
    marginTop: 'auto',
    textAlign: 'center',
    paddingTop: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
});
