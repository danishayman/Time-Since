/**
 * Glyphs for the home screen widgets, as SVG source strings.
 *
 * `@expo/vector-icons` is a React Native component and cannot be used here —
 * a widget tree is rendered to a bitmap by `react-native-android-widget` and
 * only ever contains that library's own primitives. `SvgWidget` takes a raw
 * string, so each icon is a function of its colour rather than a constant:
 * there is no `currentColor` to inherit from, and the same glyph has to be able
 * to come out black on a pale swatch and white on a deep one.
 */

/**
 * A solid hourglass, matching the app's subject rather than any one timer:
 * two triangles meeting at the waist, capped top and bottom.
 */
export function hourglassSvg(color: string): string {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">',
    `<path fill="${color}" d="M3 2h18v2.6H3z"/>`,
    `<path fill="${color}" d="M5 4.6h14L12 12z"/>`,
    `<path fill="${color}" d="M12 12l7 7.4H5z"/>`,
    `<path fill="${color}" d="M3 19.4h18V22H3z"/>`,
    '</svg>',
  ].join('');
}

/**
 * The restart arrow, on the Restart widget only. A circular arrow reads as
 * "back to zero" without a label, which is all a 4x1 row has space for.
 */
export function restartSvg(color: string): string {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">',
    `<path fill="${color}" d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-8 8s3.57 8 8 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z"/>`,
    '</svg>',
  ].join('');
}
