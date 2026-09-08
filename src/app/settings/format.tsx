import { ScrollView, StyleSheet } from 'react-native';

import { FormatPicker } from '@/components/format-picker';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSettings } from '@/store/settings-context';
import { tapFeedback } from '@/utils/haptics';

/**
 * A duration long enough to have something in every unit, so the preview shows
 * the effect of each checkbox: 1 year, 2 months, 3 weeks, 4 days, 5:06:07.
 */
const SAMPLE_MS = ((365 + 60 + 21 + 4) * 24 * 3600 + 5 * 3600 + 6 * 60 + 7) * 1000;

export default function DefaultFormatScreen() {
  const { settings, setSetting } = useSettings();

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <FormatPicker
          value={settings.defaultFormat}
          previewMs={SAMPLE_MS}
          onChange={(format) => {
            tapFeedback(settings.haptics);
            setSetting('defaultFormat', format);
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
});
