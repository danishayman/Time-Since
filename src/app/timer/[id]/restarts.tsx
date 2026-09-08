import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function RestartsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">No restarts</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.body}>
        Restart history is not tracked yet.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
  },
  body: {
    textAlign: 'center',
  },
});
