import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Alert, Share, StyleSheet, View } from 'react-native';

import { ScreenScrollView } from '@/components/screen-scroll-view';
import { ActionButton } from '@/components/action-button';
import { DurationBadge } from '@/components/duration-badge';
import { HeaderButton } from '@/components/header-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useLargeText } from '@/hooks/use-large-text';
import { useTimestampFormatter } from '@/hooks/use-timestamp-formatter';
import { useSettings } from '@/store/settings-context';
import { useTimer, useTimers } from '@/store/timers-context';
import type { Timer } from '@/types/timer';
import { directionOf, signedElapsedMs } from '@/utils/elapsed';
import { formatDuration } from '@/utils/format-duration';
import { successFeedback, tapFeedback, warningFeedback } from '@/utils/haptics';

/**
 * Milestone reminders can be switched on per timer, but nothing schedules or
 * delivers them yet. Until something does, the way in is left out: a button
 * that opens a switch with no effect reads as a broken feature. The screen and
 * the stored preference are untouched, so this is the only line to change when
 * delivery lands.
 */
const REMINDERS_DELIVERED: boolean = false;

function Section({ title, children }: { title: string; children: ReactNode }) {
  const large = useLargeText();
  return (
    <View style={styles.section}>
      {/* Body size, bold: a step under the timer's name, which is the heading. */}
      <ThemedText type="default" accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      {/* A row of three normally; one action per line at the largest text
          sizes, where three columns would break the labels mid-word. */}
      <View style={large ? undefined : styles.actionRow}>{children}</View>
    </View>
  );
}

function TimerDetail({ timer }: { timer: Timer }) {
  const router = useRouter();
  const { restartTimer, stopTimer, resumeTimer, removeTimer } = useTimers();
  const { settings } = useSettings();
  const formatTimestamp = useTimestampFormatter();
  const large = useLargeText();
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
          // The timer's own name, so the back button on the screens below says
          // which timer it returns to rather than "Timer". The bar itself stays
          // empty: the name is printed large right under it.
          title: timer.label,
          headerTitle: '',
          headerRight: () => (
            <HeaderButton
              icon="share"
              accessibilityLabel="Share timer"
              onPress={handleShare}
            />
          ),
        }}
      />

      <View style={styles.hero}>
        <DurationBadge timer={timer} size="detail" />
        <ThemedText type="heading" accessibilityRole="header" style={styles.label}>
          {timer.label}
        </ThemedText>
        {!timer.isRunning && (
          <ThemedText type="small" themeColor="textSecondary">
            Stopped
          </ThemedText>
        )}
      </View>

      <Section title="Actions">
        <ActionButton icon="restart" label="Restart" onPress={handleRestart} />
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
          icon="stop"
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
          icon="edit"
          label="Edit"
          onPress={() =>
            router.push({ pathname: '/timer/[id]/edit', params: { id: timer.id } })
          }
        />
        <ActionButton
          icon="format"
          label="Format"
          onPress={() =>
            router.push({ pathname: '/timer/[id]/format', params: { id: timer.id } })
          }
        />
        <ActionButton icon="trash" label="Delete" destructive onPress={handleDelete} />
      </Section>

      <Section title="More">
        <ActionButton
          icon="stats"
          label="Restarts"
          onPress={() =>
            router.push({ pathname: '/timer/[id]/restarts', params: { id: timer.id } })
          }
        />
        {REMINDERS_DELIVERED && (
          <ActionButton
            icon="notifications"
            label="Notifications"
            onPress={() =>
              router.push({ pathname: '/timer/[id]/notifications', params: { id: timer.id } })
            }
          />
        )}
        {settings.categoriesEnabled ? (
          <ActionButton
            icon="category"
            label="Category"
            onPress={() =>
              router.push({ pathname: '/timer/[id]/category', params: { id: timer.id } })
            }
          />
        ) : (
          // Holds a column so the remaining buttons keep their places rather
          // than spreading across the row. Nothing to hold in a single column.
          !large && <View style={styles.spacer} />
        )}
        {!REMINDERS_DELIVERED && !large && <View style={styles.spacer} />}
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
      {/* Scrolls so nothing is cut off when the three action groups outgrow the
          screen: a small phone, a large text size, or half of a split screen.
          `flexGrow` keeps the footer pinned to the bottom when there is room. */}
      <ScreenScrollView contentContainerStyle={styles.content}>
        {timer ? (
          <TimerDetail timer={timer} />
        ) : (
          <ThemedText type="small" themeColor="textSecondary" style={styles.missing}>
            Timer not found.
          </ThemedText>
        )}
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
    padding: Spacing.three,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
  label: {
    textAlign: 'center',
  },
  section: {
    gap: Spacing.two,
    paddingTop: Spacing.four,
  },
  sectionTitle: {
    fontWeight: '700',
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
    // Clear of the last action row once the content is tall enough to scroll
    // and there is no spare room left for `marginTop: 'auto'` to open up.
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  missing: {
    textAlign: 'center',
    padding: Spacing.four,
  },
});
