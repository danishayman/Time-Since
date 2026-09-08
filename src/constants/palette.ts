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

export const PALETTE_COLUMNS = 5;

export const DEFAULT_COLOR = PALETTE[0];

/**
 * Badge text needs to stay readable on both the pale and the deep swatches,
 * so pick black or white from the swatch's perceived luminance.
 */
export function contrastingTextColor(hex: string): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#11181C' : '#FFFFFF';
}
