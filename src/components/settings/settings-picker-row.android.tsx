import {
  AlertDialog,
  Column,
  Host,
  RadioButton,
  Row,
  Text,
  TextButton,
} from '@expo/ui/jetpack-compose';
import {
  fillMaxWidth,
  height,
  padding,
  selectable,
  selectableGroup,
} from '@expo/ui/jetpack-compose/modifiers';
import { useState } from 'react';

import { SettingsRow } from '@/components/settings/settings-row';
import type { SettingsPickerRowProps } from '@/components/settings/settings-picker-types';
import { useResolvedScheme, useTheme } from '@/hooks/use-theme';

export type { PickerOption } from '@/components/settings/settings-picker-types';

/**
 * A setting whose value is one of several named choices.
 *
 * Android's own pattern for this: the row shows the current value, and tapping
 * it opens a dialog of radio buttons that applies a choice as soon as it is
 * tapped, with Cancel to back out. The dialog is a Material one, themed from
 * the app's tint so its radio buttons match the switches.
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
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.value === value);

  const choose = (next: T) => {
    setOpen(false);
    if (next !== value) {
      onChange(next);
    }
  };

  return (
    <>
      <SettingsRow
        icon={icon}
        label={label}
        description={description}
        value={current?.label}
        accessibilityHint="Opens a list of choices"
        onPress={() => setOpen(true)}
      />

      {open && (
        <Host matchContents colorScheme={scheme} seedColor={theme.tint}>
          <AlertDialog onDismissRequest={() => setOpen(false)}>
            <AlertDialog.Title>
              <Text style={{ typography: 'headlineSmall' }}>{label}</Text>
            </AlertDialog.Title>
            <AlertDialog.Text>
              <Column modifiers={[selectableGroup()]}>
                {options.map((option) => {
                  const selected = option.value === value;
                  return (
                    <Row
                      key={option.value}
                      verticalAlignment="center"
                      modifiers={[
                        fillMaxWidth(),
                        // A full-width row, 56 high, is the tap target, not just
                        // the radio circle.
                        height(56),
                        selectable(selected, () => choose(option.value), 'radioButton'),
                      ]}>
                      <RadioButton selected={selected} />
                      <Text style={{ typography: 'bodyLarge' }} modifiers={[padding(16, 0, 0, 0)]}>
                        {option.label}
                      </Text>
                    </Row>
                  );
                })}
              </Column>
            </AlertDialog.Text>
            {/* Material puts the dialog's only action in the confirm slot. */}
            <AlertDialog.ConfirmButton>
              <TextButton onClick={() => setOpen(false)}>
                <Text>Cancel</Text>
              </TextButton>
            </AlertDialog.ConfirmButton>
          </AlertDialog>
        </Host>
      )}
    </>
  );
}
