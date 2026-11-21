import type { AppIconName } from '@/components/app-icon';

export type PickerOption<T extends string> = {
  value: T;
  label: string;
};

export type SettingsPickerRowProps<T extends string> = {
  icon: AppIconName;
  label: string;
  description?: string;
  options: readonly PickerOption<T>[];
  value: T;
  onChange: (value: T) => void;
};
