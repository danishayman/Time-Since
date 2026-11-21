import type { AppIconName } from '@/components/app-icon';
import { SettingsRow } from '@/components/settings/settings-row';
import { ThemedSwitch } from '@/components/themed-switch';

type Props = {
  icon: AppIconName;
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
        <ThemedSwitch
          value={value}
          onValueChange={onValueChange}
          // The row already announces itself as this switch. Left visible to a
          // screen reader as well, TalkBack stops on the same control twice.
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
        />
      }
    />
  );
}
