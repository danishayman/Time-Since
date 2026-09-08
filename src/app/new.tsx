import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { HeaderButton } from '@/components/header-button';
import { ThemedView } from '@/components/themed-view';
import { TimerForm, type TimerFormValues } from '@/components/timer-form';
import { DEFAULT_COLOR } from '@/constants/palette';
import { useTimers } from '@/store/timers-context';

export default function NewTimerScreen() {
  const router = useRouter();
  const { addTimer } = useTimers();
  const [values, setValues] = useState<TimerFormValues>({
    label: '',
    color: DEFAULT_COLOR,
    startDateTime: null,
  });

  const handleStart = () => {
    if (!values.label.trim()) {
      Alert.alert('Label required', 'Give the timer a label before starting it.');
      return;
    }
    addTimer({
      label: values.label,
      color: values.color,
      // No date picked means "start from now".
      startDateTime: values.startDateTime ?? new Date().toISOString(),
    });
    router.back();
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderButton title="Start" accessibilityLabel="Start timer" onPress={handleStart} />
          ),
        }}
      />
      <TimerForm values={values} onChange={setValues} />
    </ThemedView>
  );
}
