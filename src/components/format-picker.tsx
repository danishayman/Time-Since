import { StyleSheet, View } from 'react-native';

import { SettingsCheckboxRow } from '@/components/settings/settings-checkbox-row';
import { SettingsList } from '@/components/settings/settings-list';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSettings } from '@/store/settings-context';
import type { DurationUnit, TimerFormat } from '@/types/timer';
import { UNIT_LABELS, UNIT_ORDER, formatDuration, normalizeFormat } from '@/utils/format-duration';

type Props = {
  value: TimerFormat;
  onChange: (format: TimerFormat) => void;
  /** Duration the live preview is rendered from. */
  previewMs: number;
};

/**
 * Picks the units a duration is broken down into. Any combination is allowed
 * except none at all — the last checked unit cannot be unchecked, since a badge
 * with nothing in it has nothing to show.
 */
export function FormatPicker({ value, onChange, previewMs }: Props) {
  const theme = useTheme();
  const { settings } = useSettings();
  const selected = normalizeFormat(value);

  const toggle = (unit: DurationUnit) => {
    const next = selected.includes(unit)
      ? selected.filter((other) => other !== unit)
      : [...selected, unit];
    // `normalizeFormat` puts the result back into largest-first order.
    onChange(normalizeFormat(next));
  };

  const onlyChecked = (unit: DurationUnit) => selected.length === 1 && selected[0] === unit;

  return (
    <View>
      <View style={[styles.preview, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="small" themeColor="textSecondary">
          Preview
        </ThemedText>
        <ThemedText type="default" style={styles.previewValue}>
          {formatDuration(previewMs, selected, settings.showSeconds)}
        </ThemedText>
      </View>

      <SettingsList footer="Units are always shown largest first. Each one takes what it can and passes the rest down, so weeks and days read 20 days as 2w 6d.">
        {UNIT_ORDER.map((unit) => (
          <SettingsCheckboxRow
            key={unit}
            label={UNIT_LABELS[unit]}
            checked={selected.includes(unit)}
            disabled={onlyChecked(unit)}
            onToggle={() => toggle(unit)}
          />
        ))}
      </SettingsList>
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    alignItems: 'center',
    gap: Spacing.one,
    marginHorizontal: Spacing.four,
    marginVertical: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  previewValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
