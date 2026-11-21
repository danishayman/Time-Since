import {
  MIN_TEXT_CONTRAST,
  PALETTE,
  contrastRatio,
  contrastingTextColor,
  mixColors,
  readableTextColor,
} from '@/constants/palette';

// The light and dark `background` tokens. Copied rather than imported:
// `constants/theme` pulls in the web stylesheet, which Jest cannot parse.
const SURFACES = ['#ffffff', '#16171A'];

describe('contrastRatio', () => {
  it('spans 1 to 21', () => {
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1);
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21);
  });
});

describe('contrastingTextColor', () => {
  it.each(PALETTE)('is readable on %s', (color) => {
    expect(contrastRatio(contrastingTextColor(color), color)).toBeGreaterThanOrEqual(
      MIN_TEXT_CONTRAST
    );
  });

  it('is readable on a stopped badge in either theme', () => {
    for (const surface of SURFACES) {
      for (const color of PALETTE) {
        const faded = mixColors(color, surface, 0.55);
        expect(contrastRatio(contrastingTextColor(faded), faded)).toBeGreaterThanOrEqual(
          MIN_TEXT_CONTRAST
        );
      }
    }
  });
});

describe('readableTextColor', () => {
  it('reaches the contrast floor for every swatch on both themes', () => {
    for (const surface of SURFACES) {
      for (const color of PALETTE) {
        expect(contrastRatio(readableTextColor(color, surface), surface)).toBeGreaterThanOrEqual(
          MIN_TEXT_CONTRAST
        );
      }
    }
  });

  it('reaches the contrast floor on an unselected chip wash', () => {
    for (const surface of SURFACES) {
      for (const color of PALETTE) {
        const wash = mixColors(color, surface, 0.18);
        expect(contrastRatio(readableTextColor(color, wash), wash)).toBeGreaterThanOrEqual(
          MIN_TEXT_CONTRAST
        );
      }
    }
  });

  it('leaves a colour that is already readable alone', () => {
    expect(readableTextColor('#0A6FB8', '#ffffff')).toBe('#0A6FB8');
  });
});
