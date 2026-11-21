import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { HeaderButton } from '@/components/header-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TimerForm, type TimerFormValues } from '@/components/timer-form';
import { Spacing } from '@/constants/theme';
import { useDiscardGuard } from '@/hooks/use-discard-guard';
import { useTimer, useTimers } from '@/store/timers-context';
import type { Timer } from '@/types/timer';

function EditForm({ timer }: { timer: Timer }) {
  const router = useRouter();
  const { updateTimer } = useTimers();
  const [values, setValues] = useState<TimerFormValues>({
    label: timer.label,
    color: timer.color,
    startDateTime: timer.startDateTime,
    categoryId: timer.categoryId,
  });

  // Save stays unavailable while the label is empty, rather than letting the
  // tap through and answering it with an alert.
  const canSave = values.label.trim().length > 0;

  const guard = useDiscardGuard(
    values.label !== timer.label ||
      values.color !== timer.color ||
      values.startDateTime !== timer.startDateTime ||
      values.categoryId !== timer.categoryId
  );

  const handleSave = () => {
    if (!canSave) {
      return;
    }
    updateTimer(timer.id, {
      label: values.label,
      color: values.color,
      startDateTime: values.startDateTime ?? timer.startDateTime,
      categoryId: values.categoryId,
    });
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          ...guard,
          headerRight: () => (
            <HeaderButton
              title="Save"
              accessibilityLabel="Save timer"
              disabled={!canSave}
              onPress={handleSave}
            />
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
