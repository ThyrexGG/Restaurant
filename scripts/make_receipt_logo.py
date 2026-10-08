"""Converts the logo PNG into frontend/src/utils/receiptLogo.ts (1-bit raster for the 58mm thermal printer).

Usage: python scripts/make_receipt_logo.py path/to/logo.png [crop_left crop_top crop_right crop_bottom]
The optional crop box trims stray marks around the logo (the current logo uses 46 39 308 309).
"""
import base64
import sys

import numpy as np
from PIL import Image

WIDTH = 160  # dots wide, a multiple of 8, on 384-dot (58mm) paper
THRESHOLD = 150

path = sys.argv[1]
box = tuple(int(v) for v in sys.argv[2:6]) if len(sys.argv) >= 6 else None

im = Image.open(path).convert('RGBA')
bg = Image.new('RGBA', im.size, (255, 255, 255, 255))
bg.alpha_composite(im)
g = bg.convert('L')
if box:
    g = g.crop(box)
height = round(g.height * WIDTH / g.width)
g = g.resize((WIDTH, height), Image.LANCZOS)
dots = np.array(g) < THRESHOLD  # True = black dot

row_bytes = WIDTH // 8
data = bytearray()
for r in range(height):
    for b in range(row_bytes):
        v = 0
        for bit in range(8):
            if dots[r, b * 8 + bit]:
                v |= 0x80 >> bit
        data.append(v)

src = f"""// Generated from the restaurant logo as a 1-bit raster for the 58mm thermal printer.
// {WIDTH} x {height} dots, {row_bytes} bytes per row. Regenerate with scripts/make_receipt_logo.py.
export const LOGO_WIDTH_BYTES = {row_bytes};
export const LOGO_HEIGHT = {height};
const LOGO_BASE64 =
  '{base64.b64encode(bytes(data)).decode()}';

export const logoBitmap = (): Uint8Array =>
  Uint8Array.from(atob(LOGO_BASE64), c => c.charCodeAt(0));
"""
with open('frontend/src/utils/receiptLogo.ts', 'w', encoding='utf-8', newline='\n') as f:
    f.write(src)
print(WIDTH, height, len(data))
