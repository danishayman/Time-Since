import { Switch } from 'react-native';

import { SettingsRow, type IoniconName } from '@/components/settings/settings-row';

type Props = {
  icon: IoniconName;
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function SettingsSwitchRow({ icon, label, description, value, onValueChange }: Props) {
  return (
    <SettingsRow
      icon={icon}
      label={label}
      description={description}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      // Tapping anywhere on the row toggles it, not just the switch itself.
      onPress={() => onValueChange(!value)}
      right={
        <Switch value={value} onValueChange={onValueChange} accessibilityLabel={label} />
      }
    />
  );
}
