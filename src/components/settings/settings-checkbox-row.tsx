import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  label: string;
  checked: boolean;
  onToggle: () => void;
  /** Explains why the row cannot be unchecked right now. */
  disabled?: boolean;
};

/**
 * A full-width row with a checkbox, for settings where several choices can be
 * on at once. `SettingsPickerRow` covers the one-of-many case instead.
 */
export function SettingsCheckboxRow({ label, checked, onToggle, disabled = false }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled }}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: theme.backgroundElement },
        disabled && styles.disabled,
      ]}>
      <ThemedText type="default" style={styles.label}>
        {label}
      </ThemedText>

      {/* Filled with a tick when on, the way both platforms draw a checkbox;
          a smaller square inside the box read as a radio button or a stop. */}
      <View
        style={[
          styles.box,
          { borderColor: checked ? theme.text : theme.textSecondary },
          checked && { backgroundColor: theme.text },
        ]}>
        {checked && <AppIcon name="checkmark" size={18} color={theme.background} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    minHeight: 60,
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    flex: 1,
    fontWeight: '600',
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
