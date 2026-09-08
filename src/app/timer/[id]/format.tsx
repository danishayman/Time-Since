import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { FormatPicker } from '@/components/format-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSettings } from '@/store/settings-context';
import { useTimer, useTimers } from '@/store/timers-context';
import { signedElapsedMs } from '@/utils/elapsed';
import { tapFeedback } from '@/utils/haptics';
import { useNowSnapshot } from '@/utils/ticker';

export default function TimerFormatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const timer = useTimer(id);
  const { setFormat } = useTimers();
  const { settings } = useSettings();
  // The preview is read off the clock without subscribing to it: it only has to
  // be right when the screen renders, not tick while it is open.
  const now = useNowSnapshot();

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
      <ScrollView contentContainerStyle={styles.content}>
        <FormatPicker
          value={timer.format}
          previewMs={signedElapsedMs(timer, now)}
          onChange={(format) => {
            tapFeedback(settings.haptics);
            setFormat(timer.id, format);
          }}
        />
      </ScrollView>
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
