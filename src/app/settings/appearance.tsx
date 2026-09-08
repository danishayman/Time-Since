import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

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

type PickerKey = 'theme' | 'clock' | 'dateOrder';

const THEME_OPTIONS = optionsFrom<ThemePreference>(THEME_LABELS);
const CLOCK_OPTIONS = optionsFrom<ClockFormat>(CLOCK_LABELS);
const DATE_ORDER_OPTIONS = optionsFrom<DateOrder>(DATE_ORDER_LABELS);

export default function AppearanceScreen() {
  const { settings, setSetting } = useSettings();
  const [openPicker, setOpenPicker] = useState<PickerKey | null>(null);

  const { haptics } = settings;

  const toggle = (key: PickerKey) => {
    tapFeedback(haptics);
    setOpenPicker((current) => (current === key ? null : key));
  };

  /** Applies a choice, buzzes, and collapses the picker it came from. */
  const choose = <K extends 'theme' | 'clockFormat' | 'dateOrder'>(
    key: K,
    value: (typeof settings)[K]
  ) => {
    tapFeedback(haptics);
    setSetting(key, value);
    setOpenPicker(null);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <SettingsList>
          <SettingsPickerRow
            icon="contrast-outline"
            label="Theme"
            options={THEME_OPTIONS}
            value={settings.theme}
            onChange={(value) => choose('theme', value)}
            expanded={openPicker === 'theme'}
            onToggle={() => toggle('theme')}
          />
          <SettingsSwitchRow
            icon="stopwatch-outline"
            label="Show seconds"
            description="Off also slows the clock to once a minute"
            value={settings.showSeconds}
            onValueChange={(value) => {
              tapFeedback(haptics);
              setSetting('showSeconds', value);
            }}
          />
          <SettingsPickerRow
            icon="time-outline"
            label="Clock"
            options={CLOCK_OPTIONS}
            value={settings.clockFormat}
            onChange={(value) => choose('clockFormat', value)}
            expanded={openPicker === 'clock'}
            onToggle={() => toggle('clock')}
          />
          <SettingsPickerRow
            icon="calendar-outline"
            label="Date order"
            options={DATE_ORDER_OPTIONS}
            value={settings.dateOrder}
            onChange={(value) => choose('dateOrder', value)}
            expanded={openPicker === 'dateOrder'}
            onToggle={() => toggle('dateOrder')}
          />
          <SettingsSwitchRow
            icon="phone-portrait-outline"
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
});
