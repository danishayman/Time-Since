import { StyleSheet } from 'react-native';

import { ScreenScrollView } from '@/components/screen-scroll-view';
import { SettingsList } from '@/components/settings/settings-list';
import { SettingsPickerRow } from '@/components/settings/settings-picker-row';
import { SettingsSwitchRow } from '@/components/settings/settings-switch-row';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSettings } from '@/store/settings-context';
import {
  CLOCK_LABELS,
  DATE_ORDER_LABELS,
  THEME_LABELS,
  type ClockFormat,
  type DateOrder,
  type ThemePreference,
} from '@/types/settings';
import { optionsFrom } from '@/utils/picker-options';
import { tapFeedback } from '@/utils/haptics';

const THEME_OPTIONS = optionsFrom<ThemePreference>(THEME_LABELS);
const CLOCK_OPTIONS = optionsFrom<ClockFormat>(CLOCK_LABELS);
const DATE_ORDER_OPTIONS = optionsFrom<DateOrder>(DATE_ORDER_LABELS);

export default function AppearanceScreen() {
  const { settings, setSetting } = useSettings();

  const { haptics } = settings;

  /** Applies a choice from one of the pickers, with a buzz. */
  const choose = <K extends 'theme' | 'clockFormat' | 'dateOrder'>(
    key: K,
    value: (typeof settings)[K]
  ) => {
    tapFeedback(haptics);
    setSetting(key, value);
  };

  return (
    <ThemedView style={styles.container}>
      <ScreenScrollView contentContainerStyle={styles.content}>
        <SettingsList>
          <SettingsPickerRow
            icon="theme"
            label="Theme"
            options={THEME_OPTIONS}
            value={settings.theme}
            onChange={(value) => choose('theme', value)}
          />
          <SettingsPickerRow
            icon="clock"
            label="Clock"
            options={CLOCK_OPTIONS}
            value={settings.clockFormat}
            onChange={(value) => choose('clockFormat', value)}
          />
          <SettingsPickerRow
            icon="calendar"
            label="Date order"
            options={DATE_ORDER_OPTIONS}
            value={settings.dateOrder}
            onChange={(value) => choose('dateOrder', value)}
          />
          <SettingsSwitchRow
            icon="haptics"
            label="Haptic feedback"
            description="A small buzz when a timer is restarted, stopped or deleted"
            value={settings.haptics}
            onValueChange={(value) => {
              // Buzz on the way on, so enabling it is felt straight away.
              tapFeedback(value);
              setSetting('haptics', value);
            }}
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
