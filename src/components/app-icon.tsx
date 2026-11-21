import type { Ionicons } from '@expo/vector-icons';
import { SymbolView, type AndroidSymbol } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
// Pinned to SF Symbols 3.0 (iOS 15), the oldest iOS React Native supports,
// so a symbol that would be missing on an older phone fails the type check
// instead of rendering as a blank space.
import type { SFSymbols3_0 } from 'sf-symbols-typescript';

import { WebGlyph } from '@/components/web-glyph';

type Glyph = {
  /** SF Symbol, browsable in Apple's SF Symbols app. */
  ios: SFSymbols3_0;
  /** Material Symbol, browsable at fonts.google.com/icons. */
  android: AndroidSymbol;
  /** Ionicons glyph, used on web only. */
  web: ComponentProps<typeof Ionicons>['name'];
  /**
   * Draws a solid shape on Android instead of the Material glyph. The Material
   * Symbols font expo-symbols ships is the unfilled style only, so `circle`
   * and `square` come out as outlines there.
   */
  androidSolid?: 'circle' | 'square';
};

/**
 * Every icon the app draws, by what it means rather than what it looks like.
 *
 * Each platform gets its own system's glyph: SF Symbols on iOS, Material
 * Symbols on Android. A name the native side doesn't know draws nothing and
 * raises no error, so check a new entry on both platforms, not just the types.
 */
const ICONS = {
  add: { ios: 'plus', android: 'add', web: 'add' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  checkmark: { ios: 'checkmark', android: 'check', web: 'checkmark' },
  reorder: { ios: 'line.3.horizontal', android: 'drag_handle', web: 'reorder-two' },
  /** The disclosure indicator on a row that opens another screen. iOS and web only. */
  disclosure: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron-forward' },

  settings: { ios: 'gearshape', android: 'settings', web: 'settings-outline' },
  appearance: { ios: 'paintpalette', android: 'palette', web: 'color-palette-outline' },
  category: { ios: 'tag', android: 'sell', web: 'pricetags-outline' },
  widgets: { ios: 'square.grid.2x2', android: 'widgets', web: 'grid-outline' },
  data: { ios: 'archivebox', android: 'archive', web: 'archive-outline' },
  info: { ios: 'info.circle', android: 'info', web: 'information-circle-outline' },
  'source-code': {
    ios: 'chevron.left.forwardslash.chevron.right',
    android: 'code',
    web: 'logo-github',
  },

  theme: { ios: 'circle.lefthalf.filled', android: 'contrast', web: 'contrast-outline' },
  clock: { ios: 'clock', android: 'schedule', web: 'time-outline' },
  calendar: { ios: 'calendar', android: 'calendar_today', web: 'calendar-outline' },
  haptics: {
    ios: 'iphone.radiowaves.left.and.right',
    android: 'vibration',
    web: 'phone-portrait-outline',
  },

  share: { ios: 'square.and.arrow.up', android: 'share', web: 'share-outline' },
  import: { ios: 'square.and.arrow.down', android: 'download', web: 'download-outline' },
  trash: { ios: 'trash', android: 'delete', web: 'trash-outline' },
  reset: { ios: 'arrow.counterclockwise', android: 'restart_alt', web: 'refresh-outline' },

  restart: { ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' },
  play: { ios: 'play', android: 'play_arrow', web: 'play' },
  stop: { ios: 'stop', android: 'stop', web: 'square-outline' },
  edit: { ios: 'pencil', android: 'edit', web: 'pencil' },
  format: { ios: 'stopwatch', android: 'timer', web: 'stopwatch-outline' },
  stats: { ios: 'chart.bar', android: 'bar_chart', web: 'stats-chart' },
  notifications: { ios: 'bell', android: 'notifications', web: 'notifications-outline' },
  // SF Symbols' trophy needs iOS 16; the rosette is the award glyph iOS 15 has.
  trophy: { ios: 'rosette', android: 'trophy', web: 'trophy-outline' },

  /** A filled dot, tinted with a category's colour. */
  dot: { ios: 'circle.fill', android: 'circle', web: 'ellipse', androidSolid: 'circle' },
  none: { ios: 'minus.circle', android: 'do_not_disturb_on', web: 'remove-circle-outline' },

  'widget-standard': {
    ios: 'square.fill',
    android: 'square',
    web: 'square',
    androidSolid: 'square',
  },
  'widget-transparent': { ios: 'square.dashed', android: 'select', web: 'square-outline' },
  'widget-restart': {
    ios: 'arrow.clockwise.circle',
    android: 'change_circle',
    web: 'refresh-circle-outline',
  },
} as const satisfies Record<string, Glyph>;

export type AppIconName = keyof typeof ICONS;

type Props = {
  name: AppIconName;
  size?: number;
  color: string;
  /**
   * Grows with the system text size on iOS, the way an SF Symbol set beside
   * text does under Dynamic Type, up to `MAX_ICON_SCALE`. For icons that sit
   * next to a label; leave it off for icons inside a fixed shape (a button
   * face, a checkbox, a swatch), which would outgrow it. Android keeps icons
   * at a fixed size, as Material does.
   */
  scaleWithText?: boolean;
};

/** How far a text-following icon may grow: twice its size, where 3× text is possible. */
const MAX_ICON_SCALE = 2;

/** A decorative icon: whatever it sits in carries the accessible label. */
export function AppIcon({ name, size: baseSize = 24, color, scaleWithText = false }: Props) {
  const glyph: Glyph = ICONS[name];
  const { fontScale } = useWindowDimensions();
  const size =
    scaleWithText && Platform.OS === 'ios'
      ? baseSize * Math.min(Math.max(fontScale, 1), MAX_ICON_SCALE)
      : baseSize;

  if (Platform.OS === 'web') {
    return <WebGlyph name={glyph.web} size={size} color={color} />;
  }

  if (Platform.OS === 'android' && glyph.androidSolid) {
    // Sized to the Material glyph inside its 24-unit box: a 20-unit circle,
    // an 18-unit square with 2-unit corners.
    const isCircle = glyph.androidSolid === 'circle';
    const side = (size * (isCircle ? 20 : 18)) / 24;
    return (
      <View style={[styles.box, { width: size, height: size }]}>
        <View
          style={{
            width: side,
            height: side,
            borderRadius: isCircle ? side / 2 : (size * 2) / 24,
            backgroundColor: color,
          }}
        />
      </View>
    );
  }

  // On Android the symbol is a character in the Material Symbols font, and that
  // text grows with the system font size while its box stays `size` square, so
  // at a large setting the glyph is cropped. Asking for it pre-shrunk by the
  // font scale lands it back at `size`; the style keeps the box at `size` too.
  // iOS draws an image, which the font size does not touch.
  const symbolSize = Platform.OS === 'android' ? size / fontScale : size;

  return (
    <SymbolView
      name={{ ios: glyph.ios, android: glyph.android }}
      size={symbolSize}
      style={{ width: size, height: size }}
      tintColor={color}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
