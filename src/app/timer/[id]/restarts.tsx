import { useLocalSearchParams } from 'expo-router';
import { Alert, ScrollView, StyleSheet } from 'react-native';

import { SettingsList } from '@/components/settings/settings-list';
import { SettingsRow } from '@/components/settings/settings-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTimestampFormatter } from '@/hooks/use-timestamp-formatter';
import { useSettings } from '@/store/settings-context';
import { useTimer, useTimers } from '@/store/timers-context';
import type { Timer } from '@/types/timer';
import { signedElapsedMs } from '@/utils/elapsed';
import { formatDuration } from '@/utils/format-duration';
import { warningFeedback } from '@/utils/haptics';
import { MAX_RESTARTS, longestRunMs } from '@/utils/restarts';
import { useNow } from '@/utils/ticker';

/**
 * A duration that ticks. The clock subscription lives down here rather than on
 * the screen for the reason `DurationBadge` exists: a `useNow()` higher up would
 * re-render the whole restart log every second to change two lines of text.
 *
 * With `longest`, it reports the best run including the one in progress, so the
 * record updates the moment the current run overtakes it.
 */
function LiveDuration({ timer, longest = false }: { timer: Timer; longest?: boolean }) {
  const now = useNow();

  const currentMs = signedElapsedMs(timer, now);
  const ms = longest ? longestRunMs(timer.restarts, currentMs) : currentMs;

  return (
    <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
      {formatDuration(ms, timer.format)}
    </ThemedText>
  );
}

function RestartHistory({ timer }: { timer: Timer }) {
  const { settings } = useSettings();
  const { clearRestarts } = useTimers();
  const formatTimestamp = useTimestampFormatter();

  const count = timer.restarts.length;
  const duration = (ms: number) => formatDuration(ms, timer.format);

  const handleClear = () => {
    warningFeedback(settings.haptics);
    Alert.alert(
      'Clear history',
      `Forget all ${count} restart${count === 1 ? '' : 's'}? The timer itself keeps running.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => clearRestarts(timer.id) },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SettingsList>
        <SettingsRow icon="refresh" label="Restarts" value={`${count}`} />
        <SettingsRow
          icon="trophy-outline"
          label="Longest run"
          right={<LiveDuration timer={timer} longest />}
        />
        <SettingsRow icon="play-outline" label="Current run" right={<LiveDuration timer={timer} />} />
      </SettingsList>

      {count === 0 ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
          No restarts yet. Each time you restart this timer, how long it had run gets logged here.
        </ThemedText>
      ) : (
        <>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.heading}>
            HISTORY
          </ThemedText>

          <SettingsList footer={`Only the last ${MAX_RESTARTS} restarts are kept.`}>
            {/* Newest first: the most recent run is the one being compared
                against, and the list would otherwise have to be scrolled to the
                bottom to find it. */}
            {[...timer.restarts].reverse().map((entry, index) => (
              <SettingsRow
                key={`${entry.at}-${index}`}
                icon="refresh"
                label={`Ran for ${duration(entry.lastedMs)}`}
                description={`Restarted ${formatTimestamp(entry.at, false)}`}
              />
            ))}
          </SettingsList>

          <SettingsList>
            <SettingsRow
              icon="trash-outline"
              label="Clear history"
              destructive
              onPress={handleClear}
            />
          </SettingsList>
        </>
      )}
    </ScrollView>
  );
}

export default function RestartsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const timer = useTimer(id);

  return (
    <ThemedView style={styles.container}>
      {timer ? (
        <RestartHistory timer={timer} />
      ) : (
        <ThemedText type="small" themeColor="textSecondary" style={styles.missing}>
          Timer not found.
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: Spacing.four,
    paddingBottom: Spacing.five,
  },
  heading: {
    paddingHorizontal: Spacing.four,
    letterSpacing: 0.8,
    marginBottom: -Spacing.three,
  },
  empty: {
    paddingHorizontal: Spacing.four,
    textAlign: 'center',
  },
  missing: {
    textAlign: 'center',
    padding: Spacing.four,
  },
});
