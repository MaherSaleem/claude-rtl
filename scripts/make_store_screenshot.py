#!/usr/bin/env python3
"""Generate a Chrome Web Store screenshot (1280x800, 24-bit PNG, no alpha).

Composes a clean promo image: a tagline header, a faux Claude message and the
extension popup overlay. Produces two variants into store-assets/:
  MODE=after  (default)  extension ON  -> Arabic reads right-to-left (the fix)
  MODE=before            extension OFF -> Arabic broken left-to-right (default)

Dev-time only tool. Needs Pillow plus python-bidi + arabic-reshaper for the
Arabic shaping (`pip install Pillow python-bidi arabic-reshaper`). These are
NOT runtime deps of the extension and are intentionally not added to the repo.

Run: MODE=after python3 scripts/make_store_screenshot.py
     MODE=before python3 scripts/make_store_screenshot.py
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

# MODE=after  -> extension ON: Arabic shown right-to-left (the fix)
# MODE=before -> extension OFF: Arabic shown left-to-right (the broken default)
MODE = os.environ.get("MODE", "after")
ON = MODE == "after"
OUT = os.path.join(
    ROOT, "store-assets",
    "screenshot-after-1280x800.png" if ON
    else "screenshot-before-1280x800.png")

W, H = 1280, 800

# Brand / palette (matches the orange extension icon)
BRAND = (200, 99, 56)       # claude-ish orange
BG = (247, 244, 242)        # warm off-white
PANEL = (255, 255, 255)
TEXT = (40, 38, 36)
MUTED = (120, 114, 108)
CODE_BG = (237, 232, 228)
HAIR = (228, 222, 217)

# Arial Unicode covers BOTH Arabic and Latin glyphs in one face, so mixed
# AR/Latin runs render without tofu boxes after reshape+bidi.
AR = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
LATIN = "/System/Library/Fonts/Supplemental/Arial.ttf"
LATIN_B = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
MONO = "/System/Library/Fonts/SFNSMono.ttf"


def font(path, size, index=0):
    try:
        return ImageFont.truetype(path, size, index=index)
    except Exception:
        return ImageFont.truetype(LATIN, size)


def shape(s, base="R"):
    """Reshape Arabic to connected glyphs + bidi reorder.

    base="R": RTL paragraph (extension ON, correct display).
    base="L": LTR paragraph (extension OFF, the broken browser default —
              Arabic runs get pushed/scrambled as Claude renders them today).
    """
    if HAVE_BIDI:
        return get_display(arabic_reshaper.reshape(s), base_dir=base)
    return s


img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# ---- Header band -----------------------------------------------------------
icon = Image.open(ICON).convert("RGBA").resize((72, 72), Image.LANCZOS)
img.paste(icon, (64, 56), icon)

f_title = font(LATIN_B, 44)
f_sub = font(LATIN, 24)
d.text((152, 56), "RTLify for Claude", font=f_title, fill=TEXT)
d.text((153, 110), "Arabic & RTL text, displayed the right way", font=f_sub, fill=MUTED)

# ---- Tagline / value prop --------------------------------------------------
f_tag = font(LATIN_B, 30)
d.text((64, 168), "Open-source • No tracking • No network access", font=f_tag, fill=BRAND)

# ---- The "after" message card (RTL) ---------------------------------------
card_x, card_y, card_w, card_h = 64, 232, 760, 500
d.rounded_rectangle([card_x, card_y, card_x + card_w, card_y + card_h],
                    radius=18, fill=PANEL, outline=HAIR, width=2)

f_ar = font(AR, 27)
f_ar_b = font(AR, 27)  # SFArabic single weight; bold latin handled separately

# We render full visual lines (already laid out right-aligned). Because mixing
# fonts per-run is complex, we use the bidi algorithm + Arabic font which also
# carries Latin glyphs, producing a faithful RTL paragraph.
lines = [
    "كنت امبارح شغّال على pull request جديد، وكل شي",
    "كان ماشي تمام — لحد ما الـ CI pipeline فشل فجأة",
    "بدون سبب واضح. فتحت الـ logs وشفت error غريب",
    "في الـ build step، قلت يمكن مشكلة بالـ dependencies.",
    "",
    "راحت عليّ ساعة وأنا أدبّغ، وبالآخر اتضح إنو في",
    "environment variable ناقص في الـ staging بس موجود",
    "في الـ local. هاد النوع من الـ bugs أكثر شي بيجنن.",
    "",
    "على كل حال، حليت المشكلة، وصار الـ merge بنجاح!",
]

base = "R" if ON else "L"
left_edge = card_x + 32
right_edge = card_x + card_w - 32

# message header title — RTL-aligned when ON, LTR-pushed when OFF
f_hd = font(AR, 22)
title = shape("نص مخلوط بين العربية والإنجليزية", base)
tb = d.textbbox((0, 0), title, font=f_hd)
if ON:
    d.text((right_edge - (tb[2] - tb[0]), card_y + 26), title, font=f_hd, fill=MUTED)
else:
    d.text((left_edge, card_y + 26), title, font=f_hd, fill=MUTED)
d.line([left_edge, card_y + 72, right_edge, card_y + 72], fill=HAIR, width=2)

y = card_y + 100
for ln in lines:
    if ln == "":
        y += 22
        continue
    vis = shape(ln, base)
    tb = d.textbbox((0, 0), vis, font=f_ar)
    w = tb[2] - tb[0]
    x = (right_edge - w) if ON else left_edge
    d.text((x, y), vis, font=f_ar, fill=TEXT)
    y += 44

# status badge: green "RTL ON" vs red "RTL OFF"
badge = "→ RTL ON" if ON else "RTL OFF"
badge_col = BRAND if ON else (176, 70, 70)
f_badge = font(LATIN_B, 18)
bb = d.textbbox((0, 0), badge, font=f_badge)
bw = bb[2] - bb[0] + 28
# badge sits on the side opposite the title to avoid overlap
bx = (card_x + 24) if ON else (right_edge - bw)
d.rounded_rectangle([bx, card_y + 24, bx + bw, card_y + 24 + 34],
                    radius=17, fill=badge_col)
d.text((bx + 14, card_y + 30), badge, font=f_badge, fill=(255, 255, 255))

# ---- Popup overlay (right side) -------------------------------------------
px, py, pw, ph = 880, 232, 336, 300
# soft shadow
from PIL import ImageFilter
shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
sd = ImageDraw.Draw(shadow)
sd.rounded_rectangle([px + 6, py + 12, px + pw + 6, py + ph + 12], radius=18,
                     fill=(0, 0, 0, 55))
shadow = shadow.filter(ImageFilter.GaussianBlur(14))
img = Image.alpha_composite(img.convert("RGBA"), shadow).convert("RGB")
d = ImageDraw.Draw(img)

d.rounded_rectangle([px, py, px + pw, py + ph], radius=18, fill=PANEL, outline=HAIR, width=2)

# popup header
picon = Image.open(ICON).convert("RGBA").resize((40, 40), Image.LANCZOS)
img.paste(picon, (px + 24, py + 24), picon)
d.text((px + 76, py + 24), "RTLify for Claude", font=font(LATIN_B, 21), fill=TEXT)
d.text((px + 76, py + 52), "Show right-to-left text in Claude", font=font(LATIN, 14), fill=MUTED)
d.line([px + 24, py + 88, px + pw - 24, py + 88], fill=HAIR, width=2)


def toggle(ty, label, on):
    d.text((px + 24, ty), label, font=font(LATIN, 18), fill=TEXT)
    tw, th = 52, 30
    tx = px + pw - 24 - tw
    col = BRAND if on else (205, 200, 195)
    d.rounded_rectangle([tx, ty - 2, tx + tw, ty - 2 + th], radius=15, fill=col)
    knob_x = tx + tw - 26 if on else tx + 4
    d.ellipse([knob_x, ty + 1, knob_x + 22, ty + 1 + 22], fill=(255, 255, 255))


toggle(py + 116, "Enable extension", ON)
toggle(py + 168, "Enable in the input box", ON)

# language row
d.text((px + 24, py + 218), "Interface", font=font(LATIN, 17), fill=TEXT)
d.text((px + 24, py + 238), "language", font=font(LATIN, 17), fill=TEXT)
# selected: English (filled radio), Arabic muted
d.ellipse([px + pw - 40, py + 224, px + pw - 22, py + 242], outline=BRAND, width=3)
d.ellipse([px + pw - 36, py + 228, px + pw - 26, py + 238], fill=BRAND)
d.text((px + pw - 116, py + 222), "English", font=font(LATIN, 17), fill=TEXT)
d.text((px + pw - 178, py + 222), shape("العربية"),
       font=font(AR, 17), fill=MUTED)

d.line([px + 24, py + ph - 48, px + pw - 24, py + ph - 48], fill=HAIR, width=2)
d.text((px + pw - 70, py + ph - 36), "v1.0.0", font=font(LATIN, 14), fill=MUTED)

# ---- Footer ---------------------------------------------------------------
f_foot = font(LATIN, 20)
d.text((64, 752), "Works on claude.ai • Arabic, Persian, Urdu, Pashto & more",
       font=f_foot, fill=MUTED)

# Save as 24-bit PNG, no alpha
os.makedirs(os.path.dirname(OUT), exist_ok=True)
img.convert("RGB").save(OUT, "PNG")
print("Wrote", OUT, img.size, img.mode, "(bidi:", HAVE_BIDI, ")")
