import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

import { HeaderButton } from '@/components/header-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TimerForm, type TimerFormValues } from '@/components/timer-form';
import { Spacing } from '@/constants/theme';
import { useTimer, useTimers } from '@/store/timers-context';
import type { Timer } from '@/types/timer';

function EditForm({ timer }: { timer: Timer }) {
  const router = useRouter();
  const { updateTimer } = useTimers();
  const [values, setValues] = useState<TimerFormValues>({
    label: timer.label,
    color: timer.color,
    startDateTime: timer.startDateTime,
  });

  const handleSave = () => {
    if (!values.label.trim()) {
      Alert.alert('Label required', 'Give the timer a label before saving.');
      return;
    }
    updateTimer(timer.id, {
      label: values.label,
      color: values.color,
      startDateTime: values.startDateTime ?? timer.startDateTime,
    });
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderButton title="Save" accessibilityLabel="Save timer" onPress={handleSave} />
          ),
        }}
      />
      <TimerForm values={values} onChange={setValues} />
    </>
  );
}

export default function EditTimerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const timer = useTimer(id);

  return (
    <ThemedView style={styles.container}>
      {timer ? (
        // Keyed so the form re-initialises if a different timer resolves,
        // e.g. when this screen is reached by deep link before hydration.
        <EditForm key={timer.id} timer={timer} />
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
  },
  missing: {
    textAlign: 'center',
    padding: Spacing.four,
  },
});
