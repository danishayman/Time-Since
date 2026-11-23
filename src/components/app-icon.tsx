import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';

/**
 * Every icon the app draws, by what it means rather than what it looks like,
 * mapped to a glyph in Font Awesome 6's free solid set.
 *
 * One set on iPhone, Android and the web. Swapping a glyph is a one-line change
 * here; no caller names a Font Awesome icon directly. The names are checked
 * against the font's own glyph list in `app-icon.test.ts`, because a name the
 * font does not have draws a question mark rather than failing the build.
 */
export const ICONS = {
  add: 'plus',
  close: 'xmark',
  checkmark: 'check',
  reorder: 'grip-vertical',
  /** The disclosure indicator on a row that opens another screen. iOS and web only. */
  disclosure: 'chevron-right',

  settings: 'gear',
  appearance: 'palette',
  category: 'tag',
  widgets: 'table-cells-large',
  data: 'box-archive',
  info: 'circle-info',
  'source-code': 'code',

  theme: 'circle-half-stroke',
  clock: 'clock',
  calendar: 'calendar-days',
  haptics: 'mobile-screen-button',

  share: 'arrow-up-from-bracket',
  import: 'download',
  trash: 'trash',
  reset: 'rotate-left',

  restart: 'rotate-right',
  play: 'play',
  stop: 'stop',
  edit: 'pen',
  format: 'stopwatch',
  stats: 'chart-simple',
  notifications: 'bell',
  trophy: 'trophy',

  /** A filled dot, tinted with a category's colour. */
  dot: 'circle',
  none: 'circle-minus',

  'widget-standard': 'square',
  'widget-transparent': 'vector-square',
  'widget-restart': 'arrows-rotate',
} as const;

export type AppIconName = keyof typeof ICONS;

type Props = {
  name: AppIconName;
  size?: number;
  color: string;
  /**
   * Grows with the system text size on iOS, the way an icon set beside text
   * does under Dynamic Type, up to `MAX_ICON_SCALE`. For icons that sit next to
   * a label; leave it off for icons inside a fixed shape (a button face, a
   * checkbox, a swatch), which would outgrow it. Android keeps icons at a fixed
   * size, as Material does.
   */
  scaleWithText?: boolean;
};

/** How far a text-following icon may grow: twice its size, where 3× text is possible. */
const MAX_ICON_SCALE = 2;

/**
 * How large the glyph is drawn inside its `size` square: all of it. The few
 * glyphs wider than they are tall (a trophy, a palette) run a little past the
 * square's sides, centred, which the gaps around every icon absorb.
 */
const GLYPH_SCALE = 1;

/** A decorative icon: whatever it sits in carries the accessible label. */
export function AppIcon({ name, size: baseSize = 24, color, scaleWithText = false }: Props) {
  const { fontScale } = useWindowDimensions();
  const size =
    scaleWithText && Platform.OS === 'ios'
      ? baseSize * Math.min(Math.max(fontScale, 1), MAX_ICON_SCALE)
      : baseSize;

  return (
    // Font Awesome glyphs have their own widths (a pen is narrower than a
    // gear), so each sits centred in a fixed square and rows of icons line up.
    // Font Awesome draws glyphs as text, so Android needs the descendants
    // hidden as well, or TalkBack reads the glyph's private-use character.
    <View
      style={[styles.box, { width: size, height: size }]}
      aria-hidden
      importantForAccessibility="no-hide-descendants">

      <FontAwesome6 name={ICONS[name]} solid size={size * GLYPH_SCALE} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
