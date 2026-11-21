import { Pressable, StyleSheet } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  onPress: () => void;
  accessibilityLabel: string;
  bottom: number;
  right: number;
};

export function Fab({ onPress, accessibilityLabel, bottom, right }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.fab,
        { backgroundColor: theme.text, bottom, right },
        pressed && styles.pressed,
      ]}>
      <AppIcon name="add" size={30} color={theme.background} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  pressed: {
    opacity: 0.8,
  },
});
