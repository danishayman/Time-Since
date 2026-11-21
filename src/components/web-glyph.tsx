import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

/**
 * Nothing on iOS and Android, which draw system symbols instead. Split from
 * `web-glyph.web.tsx` so the Ionicons font and glyph map stay out of the
 * native bundle.
 */
export function WebGlyph(_props: ComponentProps<typeof Ionicons>) {
  return null;
}
