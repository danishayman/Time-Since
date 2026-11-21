/**
 * The fixed 15-colour palette offered when creating or editing a timer,
 * laid out as three rows of five: pastels, mid-saturation, then deep tones.
 */
export const PALETTE = [
  // Row 1 — pastels
  '#BDE3FA',
  '#C7E7CD',
  '#FBF3C4',
  '#FBDFBE',
  '#F7C8D9',
  // Row 2 — mid saturation
  '#3FB8F0',
  '#5CB566',
  '#F7E04B',
  '#F5A623',
  '#EE5B54',
  // Row 3 — deep
  '#0A6FB8',
  '#25752F',
  '#E9A31B',
  '#DE4C0D',
  '#A2181B',
] as const;

/**
 * What each swatch is called when it is read out. A hex code tells a listener
 * nothing; these follow the grid, so the name also says which row it is in.
 */
export const PALETTE_NAMES: Record<(typeof PALETTE)[number], string> = {
  '#BDE3FA': 'Pale blue',
  '#C7E7CD': 'Pale green',
  '#FBF3C4': 'Pale yellow',
  '#FBDFBE': 'Pale orange',
  '#F7C8D9': 'Pale pink',
  '#3FB8F0': 'Blue',
  '#5CB566': 'Green',
  '#F7E04B': 'Yellow',
  '#F5A623': 'Orange',
  '#EE5B54': 'Red',
  '#0A6FB8': 'Deep blue',
  '#25752F': 'Deep green',
  '#E9A31B': 'Amber',
  '#DE4C0D': 'Burnt orange',
  '#A2181B': 'Deep red',
};

export const PALETTE_COLUMNS = 5;

export const DEFAULT_COLOR = PALETTE[0];

/** WCAG AA for body-sized text. */
export const MIN_TEXT_CONTRAST = 4.5;

const BLACK = '#000000';
const WHITE = '#FFFFFF';

type Rgb = [number, number, number];

function toRgb(hex: string): Rgb {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

function toHex(rgb: Rgb): string {
  return `#${rgb.map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`;
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two `#RRGGBB` colours, 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const first = luminance(a);
  const second = luminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

/**
 * `foreground` laid over `background` at `amount` opacity, as the flat colour
 * the eye ends up seeing. `amount` runs 0 (all background) to 1 (all foreground).
 */
export function mixColors(foreground: string, background: string, amount: number): string {
  const over = toRgb(foreground);
  const under = toRgb(background);
  return toHex(over.map((channel, index) => channel * amount + under[index] * (1 - amount)) as Rgb);
}

/**
 * Black or white, whichever reads better on the given fill.
 *
 * Measured rather than guessed from brightness: a luminance cut-off put white
 * on the mid greens and reds, where it only reaches about 2.5:1. Pure black is
 * the dark choice because black and white between them always clear 4.5:1 on
 * any colour, which a softened near-black cannot promise.
 */
export function contrastingTextColor(hex: string): string {
  return contrastRatio(BLACK, hex) >= contrastRatio(WHITE, hex) ? BLACK : WHITE;
}

/**
 * A colour for text that keeps the hue of `color` but is readable on `surface`.
 *
 * The palette is chosen to look right as a fill, and most of it is far too pale
 * or too deep to be read as lettering on the app's own background. This walks
 * the colour towards black on a light surface, or white on a dark one, and stops
 * at the first step that reaches the contrast floor, so a colour that was
 * already readable comes back untouched.
 */
export function readableTextColor(color: string, surface: string): string {
  if (contrastRatio(color, surface) >= MIN_TEXT_CONTRAST) {
    return color;
  }
  const anchor = contrastingTextColor(surface);
  const STEPS = 20;
  for (let step = 1; step < STEPS; step += 1) {
    const candidate = mixColors(anchor, color, step / STEPS);
    if (contrastRatio(candidate, surface) >= MIN_TEXT_CONTRAST) {
      return candidate;
    }
  }
  return anchor;
}
