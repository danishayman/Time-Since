import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { HeaderButton } from '@/components/header-button';
import { ThemedView } from '@/components/themed-view';
import { TimerForm, type TimerFormValues } from '@/components/timer-form';
import { useSettings } from '@/store/settings-context';
import { useTimers } from '@/store/timers-context';

export default function NewTimerScreen() {
  const router = useRouter();
  const { addTimer } = useTimers();
  const { settings } = useSettings();
  const [values, setValues] = useState<TimerFormValues>({
    label: '',
    color: settings.defaultColor,
    startDateTime: null,
    // Creating a timer while a category is filtered files it there by default.
    categoryId: settings.categoryFilter,
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
      format: settings.defaultFormat,
      categoryId: values.categoryId,
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
