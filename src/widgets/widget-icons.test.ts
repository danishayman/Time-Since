import { hourglassSvg, restartSvg } from '@/widgets/widget-icons';

describe.each([
  ['hourglass', hourglassSvg],
  ['restart', restartSvg],
])('%s widget glyph', (_name, draw) => {
  const svg = draw('#11181C');

  it('is one standalone SVG document', () => {
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
  });

  it('fills its shapes in the colour it is given', () => {
    expect(svg).toMatch(/<path fill="#11181C" d="M[^"]+"\/>/);
  });

  it('has a square view box, so the glyph sits centred', () => {
    const [, , width, height] = svg.match(/viewBox="([^"]+)"/)![1].split(' ').map(Number);
    expect(width).toBe(height);
  });
});
