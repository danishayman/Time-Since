import { Host, Picker } from '@expo/ui';

import { SettingsRow } from '@/components/settings/settings-row';
import type { SettingsPickerRowProps } from '@/components/settings/settings-picker-types';
import { useResolvedScheme, useTheme } from '@/hooks/use-theme';

export type { PickerOption } from '@/components/settings/settings-picker-types';

/**
 * A setting whose value is one of several named choices.
 *
 * On iOS (and web) the choice is the system pull-down menu sitting at the end
 * of the row, showing the current value with the up-down chevrons in the tint,
 * the way a picker reads in Settings. Android uses a radio dialog instead; see
 * `settings-picker-row.android.tsx`.
 */
export function SettingsPickerRow<T extends string>({
  icon,
  label,
  description,
  options,
  value,
  onChange,
}: SettingsPickerRowProps<T>) {
  const theme = useTheme();
  const scheme = useResolvedScheme();

  return (
    <SettingsRow
      icon={icon}
      label={label}
      description={description}
      valueElement={
        <Host matchContents colorScheme={scheme} seedColor={theme.tint}>
          <Picker selectedValue={value} onValueChange={(next) => onChange(next as T)}>
            {options.map((option) => (
              <Picker.Item key={option.value} label={option.label} value={option.value} />
            ))}
          </Picker>
        </Host>
      }
    />
  );
}
