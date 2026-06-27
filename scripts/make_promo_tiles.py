#!/usr/bin/env python3
"""Generate Chrome Web Store promotional tiles (24-bit PNG, no alpha).

Produces two branded banner tiles into store-assets/:
  small   440 x 280   shown beside the extension in store listings
  marquee 1400 x 560  wide banner for the featured carousel

These are branding graphics (icon + name + tagline + a hint of RTL Arabic),
not UI screenshots. Both are optional in the store but make the listing look
complete and eligible for featuring.

Dev-time only tool. Needs Pillow plus python-bidi + arabic-reshaper for the
Arabic shaping (`pip install Pillow python-bidi arabic-reshaper`). These are
NOT runtime deps of the extension and are intentionally not added to the repo.

Run: python3 scripts/make_promo_tiles.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

try:
    from bidi.algorithm import get_display
    import arabic_reshaper
    HAVE_BIDI = True
except Exception:
    HAVE_BIDI = False

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ICON = os.path.join(ROOT, "icons", "icon128.png")
OUTDIR = os.path.join(ROOT, "store-assets")

# Brand / palette (matches the orange extension icon)
BRAND = (200, 99, 56)
BRAND_DK = (168, 79, 41)
CREAM = (250, 247, 244)
TEXT = (40, 38, 36)
MUTED = (118, 112, 106)

AR = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
LATIN = "/System/Library/Fonts/Supplemental/Arial.ttf"
LATIN_B = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


def font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.truetype(LATIN, size)


def shape(s):
    if HAVE_BIDI:
        return get_display(arabic_reshaper.reshape(s))
    return s


def text_w(d, s, f):
    b = d.textbbox((0, 0), s, font=f)
    return b[2] - b[0]


def vgrad(w, h, top, bottom):
    """Vertical gradient background."""
    base = Image.new("RGB", (w, h), top)
    top_img = Image.new("RGB", (w, h), bottom)
    mask = Image.linear_gradient("L").resize((w, h))
    return Image.composite(top_img, base, mask)


def rounded_icon(size):
    return Image.open(ICON).convert("RGBA").resize((size, size), Image.LANCZOS)


def make_small():
    """440 x 280 — compact, centered lockup."""
    W, H = 440, 280
    img = vgrad(W, H, (252, 249, 246), (244, 238, 233))
    d = ImageDraw.Draw(img)

    # icon centered near top
    isz = 88
    icon = rounded_icon(isz)
    img.paste(icon, ((W - isz) // 2, 36), icon)

    f_name = font(LATIN_B, 34)
    name = "RTLify"
    d.text(((W - text_w(d, name, f_name)) // 2, 140), name, font=f_name, fill=TEXT)

    f_sub = font(LATIN, 18)
    sub = "for Claude"
    d.text(((W - text_w(d, sub, f_sub)) // 2, 180), sub, font=f_sub, fill=BRAND)

    # RTL hint line
    f_ar = font(AR, 17)
    ar = shape("نص عربي يُعرض بالاتجاه الصحيح")
    d.text(((W - text_w(d, ar, f_ar)) // 2, 224), ar, font=f_ar, fill=MUTED)

    return img


def make_marquee():
    """1400 x 560 — wide banner: brand lockup left, RTL showcase right."""
    W, H = 1400, 560
    img = vgrad(W, H, (252, 249, 246), (243, 236, 230))
    d = ImageDraw.Draw(img)

    # left brand lockup
    isz = 132
    icon = rounded_icon(isz)
    img.paste(icon, (96, 110), icon)

    f_name = font(LATIN_B, 76)
    d.text((96, 270), "RTLify for Claude", font=f_name, fill=TEXT)

    f_tag = font(LATIN, 30)
    d.text((100, 360), "Arabic & RTL text, displayed the right way", font=f_tag, fill=MUTED)

    f_pill = font(LATIN_B, 21)
    pill = "Open-source  •  No tracking  •  No network access"
    pw = text_w(d, pill, f_pill) + 44
    d.rounded_rectangle([100, 416, 100 + pw, 416 + 44], radius=22, fill=BRAND)
    d.text((122, 425), pill, font=f_pill, fill=(255, 255, 255))

    # right: RTL showcase card
    cx, cy, cw, ch = 880, 120, 424, 320
    d.rounded_rectangle([cx, cy, cx + cw, cy + ch], radius=20,
                        fill=(255, 255, 255), outline=(228, 222, 217), width=2)
    badge = "→ RTL"
    f_b = font(LATIN_B, 18)
    bw = text_w(d, badge, f_b) + 28
    d.rounded_rectangle([cx + 22, cy + 22, cx + 22 + bw, cy + 22 + 34],
                        radius=17, fill=BRAND)
    d.text((cx + 36, cy + 28), badge, font=f_b, fill=(255, 255, 255))

    f_ar = font(AR, 26)
    lines = [
        "كنت شغّال على pull request جديد",
        "لحد ما الـ CI pipeline فشل فجأة.",
        "فتحت الـ logs وشفت error غريب",
        "في الـ build step بدون سبب واضح.",
    ]
    right = cx + cw - 28
    y = cy + 92
    for ln in lines:
        vis = shape(ln)
        d.text((right - text_w(d, vis, f_ar), y), vis, font=f_ar, fill=TEXT)
        y += 50

    return img


os.makedirs(OUTDIR, exist_ok=True)
for name, im in [("promo-small-440x280", make_small()),
                 ("promo-marquee-1400x560", make_marquee())]:
    out = os.path.join(OUTDIR, name + ".png")
    im.convert("RGB").save(out, "PNG")
    print("Wrote", out, im.size, im.mode, "(bidi:", HAVE_BIDI, ")")
