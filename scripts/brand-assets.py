"""Builds every icon and splash asset for Time Since from one geometry.

The mark: three rounded bars stacked and left-aligned, each in a colour from the
timer palette, at different lengths. It is the home list in miniature: a row per
timer, with how long it has run read as length.

Run from the project root:  python scripts/brand-assets.py . preview.png
Needs Pillow. Writes assets/images/* and assets/expo.icon/Assets/time-since-mark.svg.
"""
import os, sys
from PIL import Image, ImageDraw

ROOT = sys.argv[1]           # project root
OUT_PREVIEW = sys.argv[2]    # preview sheet path

# Geometry in units of the mark's own frame, where the longest bar is 1 wide.
BAR_H = 0.217                # bar thickness
GAP = 0.083                  # space between bars
# (length, colour) top to bottom. Colours are `PALETTE` entries in
# src/constants/palette.ts: pale pink, green, blue.
BARS = [
    (1.000, (0xF7, 0xC8, 0xD9, 255)),
    (0.667, (0x5C, 0xB5, 0x66, 255)),
    (0.867, (0x3F, 0xB8, 0xF0, 255)),
]
MARK_H = len(BARS) * BAR_H + (len(BARS) - 1) * GAP
SS = 4                       # supersampling for clean edges

BACKGROUND = (0x16, 0x17, 0x1A, 255)   # the app's dark `background` token
WHITE = (255, 255, 255, 255)
CLEAR = (0, 0, 0, 0)


def bar_rects(x0, y0, width):
    """Rectangles for the bars of a mark `width` wide with its top-left at (x0, y0)."""
    rects, y = [], y0
    for length, colour in BARS:
        rects.append(((x0, y, x0 + width * length, y + width * BAR_H), colour))
        y += width * (BAR_H + GAP)
    return rects


def draw_mark(size, width_frac, bg=CLEAR, ink=None):
    """The mark centred on a `size` square, `width_frac` of it wide.

    `ink` paints every bar one colour, for the monochrome layer.
    """
    S = size * SS
    im = Image.new('RGBA', (S, S), bg)
    d = ImageDraw.Draw(im)
    w = S * width_frac
    x0, y0 = (S - w) / 2, (S - w * MARK_H) / 2
    radius = w * BAR_H / 2
    for (x1, y1, x2, y2), colour in bar_rects(x0, y0, w):
        d.rounded_rectangle([x1, y1, x2, y2], radius=radius, fill=ink or colour)
    return im.resize((size, size), Image.LANCZOS)


def draw_tile(size, width_frac):
    """The app icon as a rounded tile, for the splash screens."""
    S = size * SS
    tile = Image.new('RGBA', (S, S), CLEAR)
    ImageDraw.Draw(tile).rounded_rectangle([0, 0, S - 1, S - 1], radius=S * 0.225, fill=BACKGROUND)
    tile = tile.resize((size, size), Image.LANCZOS)
    tile.alpha_composite(draw_mark(size, width_frac))
    return tile


img = os.path.join(ROOT, 'assets', 'images')

# App icon (Android legacy, web manifest): full bleed, the platform rounds it.
icon = draw_mark(1024, 0.60, BACKGROUND)
icon.save(os.path.join(img, 'icon.png'))

# Android adaptive icon. The mark's corners have to stay inside the 66/108 safe
# circle, which a 0.46-wide mark does with room for the launcher's own crop.
fg = draw_mark(512, 0.46)
fg.save(os.path.join(img, 'android-icon-foreground.png'))
Image.new('RGBA', (512, 512), BACKGROUND).save(os.path.join(img, 'android-icon-background.png'))
# Themed icons recolour this layer themselves, so it is one flat ink.
mono = draw_mark(432, 0.46, ink=WHITE)
mono.save(os.path.join(img, 'android-icon-monochrome.png'))

# Splash: the icon as a tile on both. The pale pink bar all but vanishes on a
# white splash, so the light one carries its own dark ground; on the dark splash
# the tile is the same colour as the screen and only the bars show.
splash = draw_tile(1200, 0.60)
splash.save(os.path.join(img, 'splash-icon.png'))
splash.save(os.path.join(img, 'splash-icon-dark.png'))

# Favicon: bigger in its square, since 48px has no room to spare.
draw_mark(48, 0.74, BACKGROUND).save(os.path.join(img, 'favicon.png'))

# iOS Icon Composer layer: the bars as filled shapes, in points on the 1024
# canvas, cropped to the mark so Icon Composer centres it.
w = 1024 * 0.60
h = w * MARK_H
radius = w * BAR_H / 2
shapes = ''.join(
    f'<rect x="{x1:.2f}" y="{y1:.2f}" width="{x2 - x1:.2f}" height="{y2 - y1:.2f}" '
    f'rx="{radius:.2f}" fill="#{c[0]:02X}{c[1]:02X}{c[2]:02X}"/>\n'
    for (x1, y1, x2, y2), c in bar_rects(0, 0, w)
)
svg = (f'<svg width="{w:.0f}" height="{h:.0f}" viewBox="0 0 {w:.2f} {h:.2f}" '
       f'fill="none" xmlns="http://www.w3.org/2000/svg">\n{shapes}</svg>\n')
assets = os.path.join(ROOT, 'assets', 'expo.icon', 'Assets')
with open(os.path.join(assets, 'time-since-mark.svg'), 'w', newline='\n') as fh:
    fh.write(svg)
print('svg', round(w), round(h))

# Preview sheet: icon, adaptive in a circle mask, adaptive in a squircle-ish
# rounded mask, mono, splash light, splash dark, favicon x4, icon at 48 and 24.
GREY = (140, 140, 140, 255)
sheet = Image.new('RGBA', (8 * 260, 260), GREY)
def fit(im): return im.resize((240, 240), Image.LANCZOS)
sheet.paste(fit(icon), (10, 10))
ad = Image.new('RGBA', (512, 512), BACKGROUND); ad.alpha_composite(fg)
for i, shape in enumerate(('circle', 'rounded')):
    mask = Image.new('L', (512, 512), 0)
    if shape == 'circle':
        ImageDraw.Draw(mask).ellipse([0, 0, 511, 511], fill=255)
    else:
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, 511, 511], radius=120, fill=255)
    out = Image.new('RGBA', (512, 512), GREY); out.paste(ad, (0, 0), mask)
    sheet.paste(fit(out), (270 + 260 * i, 10))
mb = Image.new('RGBA', (432, 432), (60, 60, 60, 255)); mb.alpha_composite(mono); sheet.paste(fit(mb), (790, 10))
for i, bg in enumerate((WHITE, BACKGROUND)):
    panel = Image.new('RGBA', (240, 240), bg)
    s = splash.copy(); s.thumbnail((96, 96), Image.LANCZOS)
    panel.alpha_composite(s, ((240 - s.width) // 2, (240 - s.height) // 2))
    sheet.paste(panel, (1050 + 260 * i, 10))
fv = Image.open(os.path.join(img, 'favicon.png')).resize((192, 192), Image.NEAREST); sheet.paste(fv, (1570, 34))
small = Image.new('RGBA', (240, 240), (235, 235, 235, 255))
small.alpha_composite(icon.resize((48, 48), Image.LANCZOS), (40, 96))
small.alpha_composite(icon.resize((24, 24), Image.LANCZOS), (140, 108))
sheet.paste(small, (1830, 10))
sheet.save(OUT_PREVIEW)
