/**
 * Glyphs for the home screen widgets, as SVG source strings.
 *
 * The app's icon component cannot be used here — a widget tree is rendered to a
 * bitmap by `react-native-android-widget` and only ever contains that library's
 * own primitives, so the Font Awesome font is not available. `SvgWidget` takes
 * a raw string instead, so each icon is built from Font Awesome's own shape
 * data for the same solid set, as a function of its colour: there is no
 * `currentColor` to inherit, and the same glyph has to come out black on a pale
 * swatch and white on a deep one.
 */
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faHourglassEnd } from '@fortawesome/free-solid-svg-icons/faHourglassEnd';
import { faRotateRight } from '@fortawesome/free-solid-svg-icons/faRotateRight';

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

/**
 * One Font Awesome icon as standalone SVG source, filled in `color`.
 *
 * Font Awesome glyphs are drawn on canvases of their own widths (an hourglass
 * is narrower than it is tall), so the view box is widened to a square around
 * the glyph and it sits centred in whatever square the widget gives it.
 */
function solidSvg(definition: IconDefinition, color: string): string {
  const [width, height, , , svgPathData] = definition.icon;
  const side = Math.max(width, height);
  const x = (width - side) / 2;
  const y = (height - side) / 2;
  const paths = (Array.isArray(svgPathData) ? svgPathData : [svgPathData])
    .map((d) => `<path fill="${escapeAttribute(color)}" d="${escapeAttribute(d)}"/>`)
    .join('');

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" ` +
    `viewBox="${x} ${y} ${side} ${side}">${paths}</svg>`
  );
}

/**
 * The hourglass with its sand run through, matching the app's subject rather
 * than any one timer: time already passed, not a countdown.
 */
export function hourglassSvg(color: string): string {
  return solidSvg(faHourglassEnd, color);
}

/**
 * The restart arrow, on the Restart widget only. The same glyph as the Restart
 * action inside the app, so the button means the same thing in both places.
 */
export function restartSvg(color: string): string {
  return solidSvg(faRotateRight, color);
}
