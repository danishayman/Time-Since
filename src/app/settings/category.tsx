import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

import { ScreenScrollView } from '@/components/screen-scroll-view';
import { ColorPicker } from '@/components/color-picker';
import { HeaderButton } from '@/components/header-button';
import { SettingsList } from '@/components/settings/settings-list';
import { SettingsRow } from '@/components/settings/settings-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { DEFAULT_COLOR } from '@/constants/palette';
import { Spacing } from '@/constants/theme';
import { useDiscardGuard } from '@/hooks/use-discard-guard';
import { useCategories, useCategory } from '@/store/categories-context';
import { useSettings } from '@/store/settings-context';
import { useTimers } from '@/store/timers-context';
import { countByCategory } from '@/utils/categories';
import { successFeedback, warningFeedback } from '@/utils/haptics';

/**
 * Adds a category, or edits one when an `id` is passed. One screen for both,
 * because the fields are identical and only the Delete row differs.
 */
export default function CategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useCategory(id);
  const { categories, addCategory, updateCategory, removeCategory } = useCategories();
  const { timers, clearCategory } = useTimers();
  const { settings } = useSettings();

  const [name, setName] = useState(existing?.name ?? '');
  const [color, setColor] = useState(existing?.color ?? DEFAULT_COLOR);

  const { haptics } = settings;

  // Save stays unavailable while the name is empty, rather than letting the
  // tap through and answering it with an alert.
  const trimmed = name.trim();
  const canSave = trimmed.length > 0;

  const guard = useDiscardGuard(
    name !== (existing?.name ?? '') || color !== (existing?.color ?? DEFAULT_COLOR)
  );

  const handleSave = () => {
    if (!canSave) {
      return;
    }
    if (existing) {
      updateCategory(existing.id, { name: trimmed, color });
    } else {
      addCategory({ name: trimmed, color });
    }
    successFeedback(haptics);
    router.back();
  };

  const handleDelete = () => {
    if (!existing) {
      return;
    }
    const count = countByCategory(timers, categories)[existing.id] ?? 0;
    const consequence =
      count === 0
        ? 'No timers are filed under it.'
        : `${count} timer${count === 1 ? '' : 's'} will become uncategorised. The timers themselves are kept.`;

    warningFeedback(haptics);
    Alert.alert('Delete category', `Delete ${existing.name}? ${consequence}`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          clearCategory(existing.id);
          removeCategory(existing.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          ...guard,
          title: existing ? 'Edit category' : 'New category',
          headerRight: () => (
            <HeaderButton
              title="Save"
              accessibilityLabel="Save category"
              disabled={!canSave}
              onPress={handleSave}
            />
          ),
        }}
      />

      <ScreenScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ThemedText type="default" accessibilityRole="header" style={styles.sectionTitle}>
          Name
        </ThemedText>
        <ThemedTextInput
          accessibilityLabel="Name"
          value={name}
          onChangeText={setName}
          placeholder="For example: Health"
          autoCapitalize="sentences"
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />

        <ThemedText type="default" accessibilityRole="header" style={styles.sectionTitle}>
          Choose color
        </ThemedText>
        <ColorPicker value={color} onChange={setColor} />

        {existing && (
          <SettingsList>
            <SettingsRow
              icon="trash"
              label="Delete category"
              destructive
              onPress={handleDelete}
            />
          </SettingsList>
        )}
      </ScreenScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  sectionTitle: {
    textAlign: 'center',
    fontWeight: '600',
  },
});
