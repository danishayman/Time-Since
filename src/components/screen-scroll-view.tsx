import {
  ScrollView,
  StyleSheet,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth } from '@/constants/theme';

/**
 * The outer and content styles every scrolling screen shares, so three things
 * are decided once rather than per screen:
 *
 * - the bottom padding grows by the system inset, because the app draws edge to
 *   edge and the last row would otherwise end up under the home indicator or
 *   Android's navigation bar;
 * - the content is capped at `MaxContentWidth` and centred, so a tablet shows a
 *   column rather than rows stretched across the display;
 * - it keeps out of the side insets, which landscape introduces.
 *
 * Whatever bottom padding the screen asks for is kept and added to, not replaced.
 * Exposed as a hook as well as through `ScreenScrollView` so a virtualized list
 * can take the same styles.
 */
export function useScreenScrollStyles(
  contentContainerStyle?: StyleProp<ViewStyle>,
  style?: StyleProp<ViewStyle>
) {
  const insets = useSafeAreaInsets();
  const requested = StyleSheet.flatten(contentContainerStyle);
  const base = [requested?.paddingBottom, requested?.paddingVertical, requested?.padding].find(
    (value): value is number => typeof value === 'number'
  );

  return {
    // In landscape the system keeps a strip clear down one side (a camera
    // cutout, a navigation bar); the header steps in from it and so does this.
    style: [{ marginLeft: insets.left, marginRight: insets.right }, style],
    contentContainerStyle: [
      styles.content,
      contentContainerStyle,
      { paddingBottom: (base ?? 0) + insets.bottom },
    ],
  };
}

/** The scroll container every pushed screen uses. See `useScreenScrollStyles`. */
export function ScreenScrollView({ contentContainerStyle, style, ...rest }: ScrollViewProps) {
  const screen = useScreenScrollStyles(contentContainerStyle, style);

  return <ScrollView {...screen} {...rest} />;
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
});
