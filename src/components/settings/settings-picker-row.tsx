import { Ionicons } from '@expo/vector-icons';
import { Fragment } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  ROW_TEXT_INSET,
  SettingsRow,
  type IoniconName,
} from '@/components/settings/settings-row';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type PickerOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  icon: IoniconName;
  label: string;
  description?: string;
  options: readonly PickerOption<T>[];
  value: T;
  onChange: (value: T) => void;
  expanded: boolean;
  onToggle: () => void;
};

/**
 * A setting whose value is one of several named choices.
 *
 * The choices expand inline rather than opening an `Alert`, because Android
 * caps an alert at three buttons and the list-order setting has five — see the
 * comment on `FORMAT_OPTIONS` in the timer detail screen.
 */
export function SettingsPickerRow<T extends string>({
  icon,
  label,
  description,
  options,
  value,
  onChange,
  expanded,
  onToggle,
}: Props<T>) {
  const theme = useTheme();
  const current = options.find((option) => option.value === value);

  return (
    <View>
      <SettingsRow
        icon={icon}
        label={label}
        description={description}
        value={expanded ? undefined : current?.label}
        onPress={onToggle}
        showChevron
        chevronUp={expanded}
        accessibilityState={{ expanded }}
      />

      {expanded && (
        <View style={styles.options} accessibilityRole="radiogroup">
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <Fragment key={option.value}>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <Pressable
                  onPress={() => onChange(option.value)}
                  accessibilityRole="radio"
                  accessibilityLabel={option.label}
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [
                    styles.option,
                    pressed && { backgroundColor: theme.backgroundElement },
                  ]}>
                  <ThemedText
                    type="default"
                    themeColor={selected ? 'text' : 'textSecondary'}
                    style={styles.optionLabel}>
                    {option.label}
                  </ThemedText>
                  {selected && <Ionicons name="checkmark" size={20} color={theme.text} />}
                </Pressable>
              </Fragment>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  options: {
    paddingBottom: Spacing.two,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: ROW_TEXT_INSET,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three - 2,
    paddingLeft: ROW_TEXT_INSET,
    paddingRight: Spacing.four,
  },
  optionLabel: {
    flex: 1,
  },
});
