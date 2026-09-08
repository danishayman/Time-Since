import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Alert, Share, StyleSheet, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { DurationBadge } from '@/components/duration-badge';
import { HeaderButton } from '@/components/header-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTimestampFormatter } from '@/hooks/use-timestamp-formatter';
import { useSettings } from '@/store/settings-context';
import { useTimer, useTimers } from '@/store/timers-context';
import type { Timer } from '@/types/timer';
import { directionOf, signedElapsedMs } from '@/utils/elapsed';
import { formatDuration } from '@/utils/format-duration';
import { successFeedback, tapFeedback, warningFeedback } from '@/utils/haptics';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="default" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      <View style={styles.actionRow}>{children}</View>
    </View>
  );
}

function TimerDetail({ timer }: { timer: Timer }) {
  const router = useRouter();
  const { restartTimer, stopTimer, resumeTimer, removeTimer } = useTimers();
  const { settings } = useSettings();
  const formatTimestamp = useTimestampFormatter();
  const { haptics } = settings;

  const handleShare = () => {
    // Read the clock once at share time rather than subscribing this screen to
    // the ticker — only the badge needs to re-render every second.
    const now = Date.now();
    const elapsed = signedElapsedMs(timer, now);
    const suffix = directionOf(timer, now) === 'until' ? 'remaining' : 'elapsed';
    Share.share({
      message: `${timer.label}: ${formatDuration(elapsed, timer.format)} ${suffix}`,
    });
  };

  const handleRestart = () => {
    warningFeedback(haptics);
    Alert.alert(
      'Restart timer',
      `Restart ${timer.label} from zero? The time accrued so far is discarded and cannot be recovered.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restart',
          style: 'destructive',
          onPress: () => {
            successFeedback(haptics);
            restartTimer(timer.id);
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    warningFeedback(haptics);
    Alert.alert('Delete timer', `Delete ${timer.label}? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeTimer(timer.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderButton
              icon="share-outline"
              accessibilityLabel="Share timer"
              onPress={handleShare}
            />
          ),
        }}
      />

      <View style={styles.hero}>
        <DurationBadge timer={timer} size="detail" />
        <ThemedText type="default" style={styles.label}>
          {timer.label}
        </ThemedText>
        {!timer.isRunning && (
          <ThemedText type="small" themeColor="textSecondary">
            Stopped
          </ThemedText>
        )}
      </View>

      <Section title="Actions">
        <ActionButton icon="refresh" label="Restart" onPress={handleRestart} />
        <ActionButton
          icon="play"
          label="Resume"
          disabled={timer.isRunning}
          onPress={() => {
            tapFeedback(haptics);
            resumeTimer(timer.id);
          }}
        />
        <ActionButton
          icon="square-outline"
          label="Stop"
          disabled={!timer.isRunning}
          onPress={() => {
            tapFeedback(haptics);
            stopTimer(timer.id);
          }}
        />
      </Section>

      <Section title="Options">
        <ActionButton
          icon="pencil"
          label="Edit"
          onPress={() =>
            router.push({ pathname: '/timer/[id]/edit', params: { id: timer.id } })
          }
        />
        <ActionButton
          icon="stopwatch-outline"
          label="Format"
          onPress={() =>
            router.push({ pathname: '/timer/[id]/format', params: { id: timer.id } })
          }
        />
        <ActionButton icon="trash-outline" label="Delete" destructive onPress={handleDelete} />
      </Section>

      <Section title="Complements">
        <ActionButton
          icon="stats-chart"
          label="Restarts"
          onPress={() =>
            router.push({ pathname: '/timer/[id]/restarts', params: { id: timer.id } })
          }
        />
        <ActionButton
          icon="notifications-outline"
          label="Notifications"
          onPress={() =>
            router.push({ pathname: '/timer/[id]/notifications', params: { id: timer.id } })
          }
        />
        <View style={styles.spacer} />
      </Section>

      <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
        Started on {formatTimestamp(timer.createdAt)}
      </ThemedText>
    </>
  );
}

export default function TimerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const timer = useTimer(id);

  return (
    <ThemedView style={styles.container}>
      {timer ? (
        <TimerDetail timer={timer} />
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
    padding: Spacing.three,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
  label: {
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
  },
  section: {
    gap: Spacing.two,
    paddingTop: Spacing.four,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 18,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  spacer: {
    flex: 1,
  },
  footer: {
    marginTop: 'auto',
    textAlign: 'center',
    paddingBottom: Spacing.three,
  },
  missing: {
    textAlign: 'center',
    padding: Spacing.four,
  },
});
