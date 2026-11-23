import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { StyleSheet } from 'react-native';

import { ScreenScrollView } from '@/components/screen-scroll-view';
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
      <ScreenScrollView contentContainerStyle={styles.content}>
        <SettingsList>
          <SettingsRow
            icon="info"
            label="Time Since"
            description={`Version ${Constants.expoConfig?.version ?? '1.0.0'}`}
            value={`${timers.length} timer${timers.length === 1 ? '' : 's'}`}
          />
          <SettingsRow
            icon="source-code"
            label="Source on GitHub"
            onPress={() => WebBrowser.openBrowserAsync(REPO_URL)}
          />
        </SettingsList>

        <ThemedText type="small" themeColor="textSecondary" style={styles.tagline}>
          Time Since keeps everything on this device.
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.credit}>
          Icons by Font Awesome Free, licensed CC BY 4.0.
        </ThemedText>
      </ScreenScrollView>
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
  credit: {
    textAlign: 'center',
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
});
