import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ColorPicker } from '@/components/color-picker';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatTimestamp } from '@/utils/elapsed';

export type TimerFormValues = {
  label: string;
  color: string;
  /** ISO timestamp, or null while the user has not picked a date yet. */
  startDateTime: string | null;
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
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag">
      <ThemedText type="default" style={styles.sectionTitle}>
        Label
      </ThemedText>
      <TextInput
        value={values.label}
        onChangeText={(label) => set({ label })}
        placeholder="For example: No Smoking"
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
        autoCapitalize="sentences"
        returnKeyType="done"
      />

      <ThemedText type="default" style={styles.sectionTitle}>
        Choose color
      </ThemedText>
      <ColorPicker value={values.color} onChange={(color) => set({ color })} />

      <View style={styles.dateSection}>
        <Pressable
          onPress={openPicker}
          accessibilityRole="button"
          style={({ pressed }) => [styles.dateButton, pressed && styles.pressed]}>
          <Ionicons name="calendar-outline" size={32} color={theme.text} />
          <ThemedText type="default">
            {values.startDateTime
              ? formatTimestamp(values.startDateTime, false)
              : 'Event date & time'}
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => set({ startDateTime: new Date().toISOString() })}
          accessibilityRole="button"
          style={({ pressed }) => pressed && styles.pressed}>
          <ThemedText type="linkPrimary" style={styles.link}>
            or start from now
          </ThemedText>
        </Pressable>
      </View>

      {Platform.OS === 'android' && androidStep !== null && (
        <DateTimePicker
          value={draftDate}
          mode={androidStep}
          is24Hour
          onValueChange={handleAndroidValue}
          onDismiss={() => setAndroidStep(null)}
        />
      )}

      {Platform.OS !== 'android' && showIosPicker && (
        <View style={styles.iosPicker}>
          <DateTimePicker
            value={draftDate}
            mode="datetime"
            display="spinner"
            onValueChange={handleIosValue}
            onDismiss={() => setShowIosPicker(false)}
          />
          <Pressable onPress={() => setShowIosPicker(false)} accessibilityRole="button">
            <ThemedText type="linkPrimary" style={styles.link}>
              Done
            </ThemedText>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

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
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 4,
    fontSize: 16,
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
  link: {
    textDecorationLine: 'underline',
  },
  iosPicker: {
    alignItems: 'center',
  },
});
