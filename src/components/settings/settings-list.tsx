import { Children, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  /** Explanatory line under the list, for anything a row label cannot carry. */
  footer?: string;
  children: ReactNode;
};

/**
 * A flat, edge-to-edge run of settings rows separated by full-width hairlines,
 * including one above the first row and one below the last. No card, no inset,
 * no group heading — the rows themselves are the structure.
 */
export function SettingsList({ footer, children }: Props) {
  const theme = useTheme();
  const rows = Children.toArray(children);
  const divider = [styles.divider, { backgroundColor: theme.border }];

  return (
    <View>
      {rows.map((row, index) => (
        <View key={index}>
          <View style={divider} />
          {row}
        </View>
      ))}
      <View style={divider} />

      {footer ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
          {footer}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  footer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
});
