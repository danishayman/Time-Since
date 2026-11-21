import { useLocalSearchParams } from 'expo-router';
import { Alert, FlatList, StyleSheet, View } from 'react-native';

import { useScreenScrollStyles } from '@/components/screen-scroll-view';
import { SettingsList } from '@/components/settings/settings-list';
import { SettingsRow } from '@/components/settings/settings-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
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

  const theme = useTheme();
  const screen = useScreenScrollStyles(styles.content);

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

  const divider = <View style={[styles.divider, { backgroundColor: theme.border }]} />;

  // Virtualized because the log keeps up to `MAX_RESTARTS` entries, and laying
  // out every one of them on open made the screen slow to appear. The summary
  // and the Clear row ride along as the list's header and footer, and each
  // entry draws the hairline above itself, so the screen looks exactly as the
  // `SettingsList` version did.
  return (
    <FlatList
      {...screen}
      // Newest first: the most recent run is the one being compared against,
      // and the list would otherwise have to be scrolled to the bottom to find it.
      data={[...timer.restarts].reverse()}
      keyExtractor={(entry, index) => `${entry.at}-${index}`}
      ListHeaderComponent={
        <View>
          <SettingsList>
            <SettingsRow icon="restart" label="Restarts" value={`${count}`} />
            <SettingsRow
              icon="trophy"
              label="Longest run"
              valueElement={<LiveDuration timer={timer} longest />}
            />
            <SettingsRow
              icon="play"
              label="Current run"
              valueElement={<LiveDuration timer={timer} />}
            />
          </SettingsList>

          {count > 0 && (
            <ThemedText
              type="smallBold"
              themeColor="textSecondary"
              accessibilityRole="header"
              style={styles.heading}>
              HISTORY
            </ThemedText>
          )}
        </View>
      }
      ListEmptyComponent={
        <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
          No restarts yet. Each time you restart this timer, how long it had run gets logged here.
        </ThemedText>
      }
      renderItem={({ item }) => (
        <View>
          {divider}
          <SettingsRow
            icon="restart"
            label={`Ran for ${duration(item.lastedMs)}`}
            description={`Restarted ${formatTimestamp(item.at, false)}`}
          />
        </View>
      )}
      ListFooterComponent={
        count > 0 ? (
          <View>
            {divider}
            <ThemedText type="small" themeColor="textSecondary" style={styles.footnote}>
              {`Only the last ${MAX_RESTARTS} restarts are kept.`}
            </ThemedText>

            <View style={styles.clear}>
              <SettingsList>
                <SettingsRow
                  icon="trash"
                  label="Clear history"
                  destructive
                  onPress={handleClear}
                />
              </SettingsList>
            </View>
          </View>
        ) : null
      }
    />
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
  // No `gap` here: on a FlatList it would open up between every entry too, so
  // the spacing between the sections is set on the sections themselves.
  content: {
    paddingBottom: Spacing.five,
  },
  heading: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
    letterSpacing: 0.8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  footnote: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  clear: {
    marginTop: Spacing.four,
  },
  empty: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    textAlign: 'center',
  },
  missing: {
    textAlign: 'center',
    padding: Spacing.four,
  },
});
