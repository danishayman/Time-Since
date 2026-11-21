import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

/** The web build's icon: an Ionicons glyph, named in `AppIcon`'s table. */
export function WebGlyph(props: ComponentProps<typeof Ionicons>) {
  return <Ionicons {...props} />;
}
