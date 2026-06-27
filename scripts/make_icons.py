#!/usr/bin/env python3
"""Generate the extension PNG icons with no third-party dependencies.

The icon is a terracotta rounded square with three right-aligned white bars,
evoking right-aligned (RTL) Arabic text. Rendered at 4x and box-downsampled
for smooth, anti-aliased edges.
"""

import os
import struct
import zlib

# Terracotta background, white bars.
BG = (207, 106, 69, 255)
WHITE = (255, 255, 255, 255)
CLEAR = (0, 0, 0, 0)

SS = 4  # supersampling factor


def rounded(x, y, size, radius):
    """True if pixel (x, y) is inside the rounded square."""
    cx = min(x, size - 1 - x)
    cy = min(y, size - 1 - y)
    if cx >= radius or cy >= radius:
        return True
    dx = radius - cx
    dy = radius - cy
    return dx * dx + dy * dy <= radius * radius


def render(size):
    """Render an RGBA pixel grid (list of rows of (r,g,b,a) tuples)."""
    big = size * SS
    radius = big * 0.22
    px = [[CLEAR] * big for _ in range(big)]

    # Background rounded square.
    for y in range(big):
        for x in range(big):
            if rounded(x, y, big, radius):
                px[y][x] = BG

    # Three right-aligned bars (ragged left edge -> reads as RTL text).
    bar_h = big * 0.115
    gap = big * 0.105
    right_x = big * (1 - 0.24)
    widths = (0.46, 0.34, 0.44)
    top = big * 0.30

    cy = top
    for w in widths:
        bar_w = big * w
        x0 = int(round(right_x - bar_w))
        x1 = int(round(right_x))
        y0 = int(round(cy))
        y1 = int(round(cy + bar_h))
        for yy in range(max(0, y0), min(big, y1)):
            for xx in range(max(0, x0), min(big, x1)):
                if rounded(xx, yy, big, radius):
                    px[yy][xx] = WHITE
        cy += bar_h + gap

    # Box-downsample SSxSS -> 1px with alpha-weighted averaging.
    out = []
    for y in range(size):
        row = []
        for x in range(size):
            r = g = b = a = 0
            for dy in range(SS):
                for dx in range(SS):
                    pr, pg, pb, pa = px[y * SS + dy][x * SS + dx]
                    r += pr * pa
                    g += pg * pa
                    b += pb * pa
                    a += pa
            n = SS * SS
            if a > 0:
                row.append((r // a, g // a, b // a, a // n))
            else:
                row.append(CLEAR)
        out.append(row)
    return out


def write_png(path, grid):
    size = len(grid)
    raw = bytearray()
    for row in grid:
        raw.append(0)  # filter type: none
        for (r, g, b, a) in row:
            raw += bytes((r, g, b, a))

    def chunk(tag, data):
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)  # 8-bit RGBA
    idat = zlib.compress(bytes(raw), 9)
    png = sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)


def main():
    out_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "icons")
    os.makedirs(out_dir, exist_ok=True)
    for size in (16, 32, 48, 128):
        grid = render(size)
        write_png(os.path.join(out_dir, f"icon{size}.png"), grid)
        print(f"wrote icon{size}.png")


if __name__ == "__main__":
    main()
