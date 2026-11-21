import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { CategoryPicker } from '@/components/category-picker';
import { ColorPicker } from '@/components/color-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { Spacing } from '@/constants/theme';
import { useResolvedScheme, useTheme } from '@/hooks/use-theme';
import { useTimestampFormatter } from '@/hooks/use-timestamp-formatter';
import { useSettings } from '@/store/settings-context';

export type TimerFormValues = {
  label: string;
  color: string;
  /** ISO timestamp, or null while the user has not picked a date yet. */
  startDateTime: string | null;
  /** Category id, or null for none. */
  categoryId: string | null;
};

type Props = {
  values: TimerFormValues;
  onChange: (values: TimerFormValues) => void;
};

/**
 * Android has no combined date+time picker, so it is driven as a two-step
 * sequence: pick the day, then the clock time. iOS shows a single inline
 * `datetime` picker instead.
 */
type AndroidStep = 'date' | 'time' | null;

export function TimerForm({ values, onChange }: Props) {
  const theme = useTheme();
  const scheme = useResolvedScheme();
  const { settings } = useSettings();
  const formatTimestamp = useTimestampFormatter();
  const [androidStep, setAndroidStep] = useState<AndroidStep>(null);
  const [showIosPicker, setShowIosPicker] = useState(false);
  const [draftDate, setDraftDate] = useState<Date>(() =>
    values.startDateTime ? new Date(values.startDateTime) : new Date()
  );

  const set = (patch: Partial<TimerFormValues>) => onChange({ ...values, ...patch });

  const openPicker = () => {
    setDraftDate(values.startDateTime ? new Date(values.startDateTime) : new Date());
    if (Platform.OS === 'android') {
      setAndroidStep('date');
    } else {
      setShowIosPicker(true);
    }
  };

  const handleAndroidValue = (_event: unknown, selected: Date) => {
    if (androidStep === 'date') {
      // Carry the chosen day over to the draft, then ask for the time.
      const next = new Date(draftDate);
      next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      setDraftDate(next);
      setAndroidStep('time');
      return;
    }

    const next = new Date(draftDate);
    next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    setDraftDate(next);
    setAndroidStep(null);
    set({ startDateTime: next.toISOString() });
  };

  const handleIosValue = (_event: unknown, selected: Date) => {
    setDraftDate(selected);
    set({ startDateTime: selected.toISOString() });
  };

  return (
    <ScreenScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag">
      <ThemedText type="default" accessibilityRole="header" style={styles.sectionTitle}>
        Label
      </ThemedText>
      <ThemedTextInput
        accessibilityLabel="Label"
        value={values.label}
        onChangeText={(label) => set({ label })}
        placeholder="For example: No Smoking"
        autoCapitalize="sentences"
        returnKeyType="done"
      />

      <ThemedText type="default" accessibilityRole="header" style={styles.sectionTitle}>
        Choose color
      </ThemedText>
      <ColorPicker value={values.color} onChange={(color) => set({ color })} />

      {settings.categoriesEnabled && (
        <>
          <ThemedText type="default" accessibilityRole="header" style={styles.sectionTitle}>
            Category
          </ThemedText>
          <CategoryPicker
            value={values.categoryId}
            onChange={(categoryId) => set({ categoryId })}
          />
        </>
      )}

      <View style={styles.dateSection}>
        <Pressable
          onPress={openPicker}
          accessibilityRole="button"
          // Without this a screen reader gets only the date itself, or the
          // placeholder, and nothing about what tapping it does.
          accessibilityLabel={
            values.startDateTime
              ? `Event date and time, ${formatTimestamp(values.startDateTime, false)}`
              : 'Event date and time, not set'
          }
          accessibilityHint="Opens a date and time picker"
          style={({ pressed }) => [styles.dateButton, pressed && styles.pressed]}>
          <AppIcon name="calendar" size={32} color={theme.text} scaleWithText />
          <ThemedText type="default">
            {values.startDateTime
              ? formatTimestamp(values.startDateTime, false)
              : 'Event date & time'}
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => set({ startDateTime: new Date().toISOString() })}
          accessibilityRole="button"
          hitSlop={LINK_SLOP}
          style={({ pressed }) => pressed && styles.pressed}>
          <ThemedText type="linkPrimary">or start from now</ThemedText>
        </Pressable>
      </View>

      {Platform.OS === 'android' && androidStep !== null && (
        <DateTimePicker
          value={draftDate}
          mode={androidStep}
          // The clock face follows the app's own Clock setting, the same one
          // the chosen time is then displayed in.
          is24Hour={settings.clockFormat === '24h'}
          onValueChange={handleAndroidValue}
          onDismiss={() => setAndroidStep(null)}
        />
      )}

      {Platform.OS !== 'android' && showIosPicker && (
        <View style={styles.iosPicker}>
          <DateTimePicker
            value={draftDate}
            mode="datetime"
            // The calendar iOS itself shows for picking a date in a form, with
            // the time row under it; the wheel spinner is the pre-iOS 14 look.
            display="inline"
            accentColor={theme.tint}
            // The picker letters itself for the device's appearance, not the
            // app's, unless it is told which one is on screen.
            themeVariant={scheme}
            onValueChange={handleIosValue}
            onDismiss={() => setShowIosPicker(false)}
          />
          <Pressable
            onPress={() => setShowIosPicker(false)}
            accessibilityRole="button"
            hitSlop={LINK_SLOP}
            style={({ pressed }) => pressed && styles.pressed}>
            <ThemedText type="linkPrimary">Done</ThemedText>
          </Pressable>
        </View>
      )}
    </ScreenScrollView>
  );
}

/** A line of link text is 30 high; this takes what answers a tap to 48. */
const LINK_SLOP = { top: 9, bottom: 9, left: 12, right: 12 };

const styles = StyleSheet.create({
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  sectionTitle: {
    textAlign: 'center',
    fontWeight: '600',
  },
  dateSection: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.four,
  },
  dateButton: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.6,
  },
  iosPicker: {
    alignItems: 'center',
  },
});
