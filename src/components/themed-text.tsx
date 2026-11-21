import { StyleSheet, Text, type TextProps } from 'react-native';

import { ThemeColor, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  /** A role from the `Type` scale; each takes its platform's native size. */
  type?: 'title' | 'heading' | 'default' | 'small' | 'smallBold' | 'caption' | 'linkPrimary';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        styles[type],
        // Coloured from the theme rather than a fixed blue, which was too pale
        // to read on the light background.
        type === 'linkPrimary' && { color: theme.tint },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  title: {
    ...Type.title,
    fontWeight: 700,
  },
  heading: {
    ...Type.heading,
    fontWeight: 700,
  },
  default: {
    ...Type.body,
    fontWeight: 500,
  },
  small: {
    ...Type.secondary,
    fontWeight: 500,
  },
  smallBold: {
    ...Type.secondary,
    fontWeight: 700,
  },
  caption: {
    ...Type.caption,
    fontWeight: 700,
  },
  // No underline: on a phone a tinted, weighted line of text is already how a
  // text button looks, and the underline read as a web page. The tall line is
  // what the callers' hit slop is measured from.
  linkPrimary: {
    fontSize: Type.secondary.fontSize,
    lineHeight: 30,
    fontWeight: 600,
  },
});
