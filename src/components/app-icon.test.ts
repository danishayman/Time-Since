import meta from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/FontAwesome6Free_meta.json';

import { ICONS } from '@/components/app-icon';

// A glyph name the font does not have renders as a "?" with no error, so the
// mapping is checked against the font's own list of free solid glyphs.
describe('app icons', () => {
  const solid = new Set<string>(meta.solid);

  it.each(Object.entries(ICONS))('%s maps to a free solid glyph (%s)', (_name, glyph) => {
    expect(solid.has(glyph)).toBe(true);
  });
});
