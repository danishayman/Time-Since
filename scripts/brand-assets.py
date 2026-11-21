"""Builds every icon and splash asset for Time Since from one geometry.

The mark: a dot at twelve o'clock (the moment) and an arc leaving it clockwise
(the time since), drawn as filled shapes so PNG and SVG match exactly.

Run from the project root:  python scripts/brand-assets.py . preview.png
Needs Pillow. Writes assets/images/* and assets/expo.icon/Assets/time-since-mark.svg.
"""
import math, os, sys
from PIL import Image, ImageDraw

ROOT = sys.argv[1]           # project root
OUT_PREVIEW = sys.argv[2]    # preview sheet path

# Geometry in units of the mark's own frame, where the ring's centreline radius is 1.
W = 0.283        # band width
DOT = 0.26       # dot radius
GAP = 30         # degrees between the dot and where the band starts
SWEEP = 270      # degrees from twelve o'clock to where the band ends
SS = 4
NUDGE_X = 0.04
NUDGE_Y = 0.06

def pt(c, r, deg):
    a = math.radians(deg - 90)  # 0 deg = twelve o'clock, clockwise
    return (c[0] + r * math.cos(a), c[1] + r * math.sin(a))

def band_polygon(c, R, steps=900):
    ro, ri = R * (1 + W / 2), R * (1 - W / 2)
    a0, a1 = GAP, SWEEP
    pts = [pt(c, ro, a0 + (a1 - a0) * i / steps) for i in range(steps + 1)]
    cap_c = pt(c, R, a1)
    for i in range(1, 60):  # round cap at the end, outer -> inner
        t = a1 + 180 * i / 60
        pts.append(pt(cap_c, R * W / 2, t))
    pts += [pt(c, ri, a1 - (a1 - a0) * i / steps) for i in range(steps + 1)]
    cap_c = pt(c, R, a0)
    for i in range(1, 60):  # round cap at the start, inner -> outer
        t = a0 + 180 + 180 * i / 60
        pts.append(pt(cap_c, R * W / 2, t))
    return pts

def draw_mark(size, R_px, fg, bg=(0, 0, 0, 0), centre=None):
    """R_px: ring centreline radius in output pixels."""
    S = size * SS
    im = Image.new('RGBA', (S, S), bg)
    d = ImageDraw.Draw(im)
    # Optical centre: the dot sits above the ring and the top-left quadrant is
    # open, so the ring is nudged down and a touch left of the canvas centre.
    c = centre or (S / 2 - R_px * SS * NUDGE_X, S / 2 + R_px * SS * NUDGE_Y)
    R = R_px * SS
    d.polygon(band_polygon(c, R), fill=fg)
    dc = pt(c, R, 0)
    d.ellipse([dc[0] - R * DOT, dc[1] - R * DOT, dc[0] + R * DOT, dc[1] + R * DOT], fill=fg)
    return im.resize((size, size), Image.LANCZOS)

def extent(R):
    """Height of the mark (dot top to ring bottom) for centreline radius R."""
    return R * (1 + DOT) + R * (1 + W / 2)

BLACK = (0, 0, 0, 255)
WHITE = (255, 255, 255, 255)
img = os.path.join(ROOT, 'assets', 'images')

# App icon (Android legacy, web manifest): mark at ~58% of the square.
icon = draw_mark(1024, 1024 * 0.58 / extent(1), WHITE, BLACK)
icon.save(os.path.join(img, 'icon.png'))

# Android adaptive icon: 512 foreground, kept inside the 66/108 safe circle.
fg = draw_mark(512, 512 * 0.46 / extent(1), WHITE)
fg.save(os.path.join(img, 'android-icon-foreground.png'))
Image.new('RGBA', (512, 512), BLACK).save(os.path.join(img, 'android-icon-background.png'))
mono = draw_mark(432, 432 * 0.46 / extent(1), WHITE)
mono.save(os.path.join(img, 'android-icon-monochrome.png'))

# Splash: the mark alone, tight, black for light mode and white for dark.
def tight(im):
    return im.crop(im.getbbox())
splash = tight(draw_mark(1200, 1200 * 0.8 / extent(1), BLACK))
splash.save(os.path.join(img, 'splash-icon.png'))
splash_dark = tight(draw_mark(1200, 1200 * 0.8 / extent(1), WHITE))
splash_dark.save(os.path.join(img, 'splash-icon-dark.png'))

# Favicon: bigger in its square, since 48px has no room to spare.
draw_mark(48, 48 * 0.74 / extent(1), WHITE, BLACK).save(os.path.join(img, 'favicon.png'))

# iOS Icon Composer layer: white filled paths, in points on the 1024 canvas.
R = 1024 * 0.58 / extent(1)
ro, ri = R * (1 + W / 2), R * (1 - W / 2)
cap = R * W / 2
# Bounds of the mark around the ring centre at (0, 0).
xmin, xmax, ymin, ymax = -ro, ro, -R * (1 + DOT), ro
# The point that should sit at the canvas centre, relative to the ring centre.
ox, oy = R * NUDGE_X, -R * NUDGE_Y
half_w = max(ox - xmin, xmax - ox) + 2
half_h = max(oy - ymin, ymax - oy) + 2
width, height = 2 * half_w, 2 * half_h
c = (half_w - ox, half_h - oy)
def f(p): return f'{p[0]:.2f} {p[1]:.2f}'
large = 1 if SWEEP - GAP > 180 else 0
o0, o1 = pt(c, ro, GAP), pt(c, ro, SWEEP)
i0, i1 = pt(c, ri, GAP), pt(c, ri, SWEEP)
d = (f'M {f(o0)} A {ro:.2f} {ro:.2f} 0 {large} 1 {f(o1)} '
     f'A {cap:.2f} {cap:.2f} 0 0 1 {f(i1)} '
     f'A {ri:.2f} {ri:.2f} 0 {large} 0 {f(i0)} '
     f'A {cap:.2f} {cap:.2f} 0 0 1 {f(o0)} Z')
dot = pt(c, R, 0)
svg = (f'<svg width="{width:.0f}" height="{height:.0f}" viewBox="0 0 {width:.2f} {height:.2f}" '
       f'fill="none" xmlns="http://www.w3.org/2000/svg">\n'
       f'<path d="{d}" fill="white"/>\n'
       f'<circle cx="{dot[0]:.2f}" cy="{dot[1]:.2f}" r="{R * DOT:.2f}" fill="white"/>\n'
       f'</svg>\n')
assets = os.path.join(ROOT, 'assets', 'expo.icon', 'Assets')
with open(os.path.join(assets, 'time-since-mark.svg'), 'w', newline='\n') as fh:
    fh.write(svg)
print('svg', round(width), round(height))

# Preview sheet: icon, adaptive foreground on black in a circle mask, mono, splash light/dark, favicon x4.
sheet = Image.new('RGBA', (6 * 260, 260), (140, 140, 140, 255))
def fit(im): return im.resize((240, 240), Image.LANCZOS)
sheet.paste(fit(icon), (10, 10))
ad = Image.new('RGBA', (512, 512), BLACK); ad.alpha_composite(fg)
mask = Image.new('L', (512, 512), 0); ImageDraw.Draw(mask).ellipse([0, 0, 511, 511], fill=255)
adc = Image.new('RGBA', (512, 512), (140, 140, 140, 255)); adc.paste(ad, (0, 0), mask)
sheet.paste(fit(adc), (270, 10))
mb = Image.new('RGBA', (432, 432), (60, 60, 60, 255)); mb.alpha_composite(mono); sheet.paste(fit(mb), (530, 10))
sl = Image.new('RGBA', (240, 240), WHITE); s = splash.copy(); s.thumbnail((110, 110)); sl.alpha_composite(s, ((240 - s.width) // 2, (240 - s.height) // 2)); sheet.paste(sl, (790, 10))
sd = Image.new('RGBA', (240, 240), (0x16, 0x17, 0x1A, 255)); s = splash_dark.copy(); s.thumbnail((110, 110)); sd.alpha_composite(s, ((240 - s.width) // 2, (240 - s.height) // 2)); sheet.paste(sd, (1050, 10))
fv = Image.open(os.path.join(img, 'favicon.png')).resize((192, 192), Image.NEAREST); sheet.paste(fv, (1320, 34))
sheet.save(OUT_PREVIEW)
