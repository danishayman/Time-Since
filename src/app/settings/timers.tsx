import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { ColorPicker } from '@/components/color-picker';
import { SettingsList } from '@/components/settings/settings-list';
import { SettingsRow } from '@/components/settings/settings-row';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSettings } from '@/store/settings-context';
import { useTimers } from '@/store/timers-context';
import { describeFormat } from '@/utils/format-duration';
import { successFeedback, tapFeedback } from '@/utils/haptics';

export default function TimerDefaultsScreen() {
  const router = useRouter();
  const { settings, setSetting } = useSettings();
  const { timers, setFormatAll } = useTimers();
  const [colorOpen, setColorOpen] = useState(false);

  const { haptics } = settings;

  const handleApplyFormatToAll = () => {
    if (timers.length === 0) {
      Alert.alert('No timers', 'There is nothing to apply the format to yet.');
      return;
    }
    Alert.alert(
      'Apply to all timers',
      `Count every timer in ${describeFormat(settings.defaultFormat)}? This replaces the units chosen on each one.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: () => {
            setFormatAll(settings.defaultFormat);
            successFeedback(haptics);
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <SettingsList footer="Defaults apply to timers you create from now on. Existing timers keep their own settings.">
          <SettingsRow
            icon="hourglass-outline"
            label="Display format"
            value={describeFormat(settings.defaultFormat)}
            onPress={() => {
              tapFeedback(haptics);
              router.push('/settings/format');
            }}
          />

          <View>
            <SettingsRow
              icon="color-palette-outline"
              label="Badge color"
              onPress={() => {
                tapFeedback(haptics);
                setColorOpen((open) => !open);
              }}
              showChevron
              chevronUp={colorOpen}
              accessibilityState={{ expanded: colorOpen }}
              right={<View style={[styles.swatch, { backgroundColor: settings.defaultColor }]} />}
            />
            {colorOpen && (
              <View style={styles.colorPicker}>
                <ColorPicker
                  value={settings.defaultColor}
                  onChange={(color) => {
                    tapFeedback(haptics);
                    setSetting('defaultColor', color);
                    setColorOpen(false);
                  }}
                />
              </View>
            )}
          </View>

          <SettingsRow
            icon="albums-outline"
            label="Apply format to all timers"
            onPress={handleApplyFormatToAll}
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
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  colorPicker: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
});
