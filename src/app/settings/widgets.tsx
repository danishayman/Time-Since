import { useState } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';

import { SettingsList } from '@/components/settings/settings-list';
import { SettingsRow, type IoniconName } from '@/components/settings/settings-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSettings } from '@/store/settings-context';
import { useTimers } from '@/store/timers-context';
import { tapFeedback } from '@/utils/haptics';
import { pinTimerWidget } from '@/widgets/pin';
import { WIDGET_LABELS, WIDGET_NAMES, type WidgetName } from '@/widgets/widget-variants';

const ICONS: Record<WidgetName, IoniconName> = {
  TimerStandard: 'square',
  TimerTransparentLight: 'square-outline',
  TimerTransparentDark: 'square-outline',
  TimerRestart: 'refresh-circle-outline',
};

const DESCRIPTIONS: Record<WidgetName, string> = {
  TimerStandard: "Filled with the timer's own colour",
  TimerTransparentLight: 'No background, white text — for dark wallpapers',
  TimerTransparentDark: 'No background, dark text — for light wallpapers',
  TimerRestart: 'Filled, with a restart button',
};

/**
 * Explains the home screen widgets and offers to place one without going through
 * the launcher's picker.
 *
 * Worth a screen of its own mainly because of the refresh caveat: a widget that
 * counts in seconds will look wrong if nobody says why, and there is nowhere
 * else in the app to say it.
 */
export default function WidgetsScreen() {
  const { settings } = useSettings();
  const { timers } = useTimers();
  const [message, setMessage] = useState<string | null>(null);

  const pin = async (widgetName: WidgetName) => {
    tapFeedback(settings.haptics);
    const accepted = await pinTimerWidget(widgetName);
    setMessage(
      accepted
        ? null
        : 'This launcher will not take widgets this way. Hold an empty spot on the home screen and pick Widgets instead.'
    );
  };

  if (Platform.OS !== 'android') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
          Home screen widgets are an Android feature.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
          Every style is free. Choose one to add it to the home screen, then pick which timer
          it counts — or hold an empty spot on the home screen and find Time Since under
          Widgets. Hold a placed widget and choose Configure to point it at a different timer.
        </ThemedText>

        <SettingsList
          footer={
            timers.length === 0
              ? 'Add a timer first — a widget has nothing to count until then.'
              : undefined
          }>
          {WIDGET_NAMES.map((name) => (
            <SettingsRow
              key={name}
              icon={ICONS[name]}
              label={WIDGET_LABELS[name]}
              description={DESCRIPTIONS[name]}
              onPress={() => pin(name)}
              showChevron={false}
            />
          ))}
        </SettingsList>

        {message ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
            {message}
          </ThemedText>
        ) : null}

        <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
          A widget shows the same units you picked for the timer. Android does not let a
          widget run a clock of its own, so it redraws when you open or leave Time Since,
          whenever you change a timer, and roughly every half hour otherwise. Timers counting
          in days and larger always look right; one counting in hours, minutes and seconds is
          accurate as of its last redraw, so open the app to bring it current.
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
  note: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
});
