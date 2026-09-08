import type { PickerOption } from '@/components/settings/settings-picker-row';

/**
 * Turns one of the label records in `@/types/settings` into picker options,
 * keeping the order the record was written in.
 */
export function optionsFrom<T extends string>(labels: Record<T, string>): PickerOption<T>[] {
  return (Object.entries(labels) as [T, string][]).map(([value, label]) => ({ value, label }));
}
