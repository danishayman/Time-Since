import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';

import { HeaderButton } from '@/components/header-button';
import { ThemedView } from '@/components/themed-view';
import { TimerForm, type TimerFormValues } from '@/components/timer-form';
import { DEFAULT_COLOR } from '@/constants/palette';
import { useDiscardGuard } from '@/hooks/use-discard-guard';
import { useSettings } from '@/store/settings-context';
import { useTimers } from '@/store/timers-context';

export default function NewTimerScreen() {
  const router = useRouter();
  const { addTimer } = useTimers();
  const { settings } = useSettings();
  // Creating a timer while a category is filtered files it there by default.
  const [initialCategory] = useState(settings.categoryFilter);
  const [values, setValues] = useState<TimerFormValues>({
    label: '',
    color: DEFAULT_COLOR,
    startDateTime: null,
    categoryId: initialCategory,
  });

  // Start stays unavailable until there is a label, rather than letting the tap
  // through and answering it with an alert.
  const canStart = values.label.trim().length > 0;

  const guard = useDiscardGuard(
    canStart ||
      values.color !== DEFAULT_COLOR ||
      values.startDateTime !== null ||
      values.categoryId !== initialCategory
  );

  const handleStart = () => {
    if (!canStart) {
      return;
    }
    addTimer({
      label: values.label,
      color: values.color,
      // No date picked means "start from now".
      startDateTime: values.startDateTime ?? new Date().toISOString(),
      categoryId: values.categoryId,
    });
    router.back();
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          ...guard,
          headerRight: () => (
            <HeaderButton
              title="Start"
              accessibilityLabel="Start timer"
              disabled={!canStart}
              onPress={handleStart}
            />
          ),
        }}
      />
      <TimerForm values={values} onChange={setValues} />
    </ThemedView>
  );
}
