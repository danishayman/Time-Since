import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import type { WidgetConfigurationScreenProps } from 'react-native-android-widget';

import { contrastingTextColor } from '@/constants/palette';
import { Colors, Spacing } from '@/constants/theme';
import { bindWidget, loadSettings, loadTimers } from '@/store/storage';
import type { Timer } from '@/types/timer';
import { formatForWidget } from '@/widgets/format-for-widget';
import { drawTimerWidget } from '@/widgets/timer-widget';
import { WIDGET_LABELS, variantOf, type WidgetName } from '@/widgets/widget-variants';

/**
 * Shown when a widget is dropped on the home screen, and again from the
 * launcher's long-press "Configure", to pick which timer it counts.
 *
 * Android runs this in its own activity, launched straight from the launcher
 * rather than through the app's navigation, so none of the app's providers are
 * mounted around it: there is no `useTimers`, no `useTheme` and no router here.
 * Everything it needs is read from storage directly, including the theme
 * override, so that a user who has pinned the app to light or dark does not get
 * a system-themed screen thrown at them from the home screen.
 */
export function WidgetConfigurationScreen({
  widgetInfo,
  renderWidget,
  setResult,
}: WidgetConfigurationScreenProps) {
  const deviceScheme = useColorScheme();
  const [scheme, setScheme] = useState<'light' | 'dark'>(deviceScheme === 'dark' ? 'dark' : 'light');
  const [timers, setTimers] = useState<Timer[] | null>(null);
  // Read once alongside the timers rather than per render: this list is a
  // snapshot to choose from, not a running clock, and the durations on it should
  // not shift under the finger as the screen re-renders.
  const [listedAt, setListedAt] = useState(0);

  const theme = Colors[scheme];
  const variant = variantOf(widgetInfo.widgetName);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadTimers(), loadSettings()]).then(([loaded, settings]) => {
      if (cancelled) {
        return;
      }
      setTimers(loaded);
      setListedAt(Date.now());
      setScheme(
        settings.theme === 'system' ? (deviceScheme === 'dark' ? 'dark' : 'light') : settings.theme
      );
    });
    return () => {
      cancelled = true;
    };
  }, [deviceScheme]);

  const choose = async (timer: Timer) => {
    await bindWidget(widgetInfo.widgetId, timer.id);
    // Paint the widget before handing back, so it never flashes the "hold to
    // choose a timer" placeholder it was created with.
    renderWidget(drawTimerWidget(timer, variant));
    setResult('ok');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Choose a timer</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {WIDGET_LABELS[widgetInfo.widgetName as WidgetName] ?? 'Widget'}
        </Text>
      </View>

      {timers === null ? (
        <ActivityIndicator style={styles.centred} />
      ) : timers.length === 0 ? (
        <Text style={[styles.empty, { color: theme.textSecondary }]}>
          There are no timers yet. Open Time Since and add one, then place this widget again.
        </Text>
      ) : (
        <FlatList
          data={timers}
          keyExtractor={(timer) => timer.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => choose(item)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.row,
                { borderBottomColor: theme.border },
                pressed && { backgroundColor: theme.backgroundElement },
              ]}>
              <View style={[styles.badge, { backgroundColor: item.color }]}>
                <Text style={[styles.badgeText, { color: contrastingTextColor(item.color) }]}>
                  {formatForWidget(item, listedAt)}
                </Text>
              </View>
              <Text style={[styles.label, { color: theme.text }]} numberOfLines={2}>
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      )}

      <Pressable
        onPress={() => setResult('cancel')}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.cancel,
          { borderTopColor: theme.border },
          pressed && { backgroundColor: theme.backgroundElement },
        ]}>
        <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: Spacing.half,
  },
  centred: {
    marginTop: Spacing.five,
  },
  empty: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    fontSize: 15,
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  cancel: {
    paddingVertical: Spacing.three,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
