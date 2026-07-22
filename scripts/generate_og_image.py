"""
Generate Open Graph image (1200x630) for khalid-cyber-security.vercel.app
Theme: Dark cyber security (#05080f background, cyan accents)
Fonts: Cairo Bold for Arabic, DejaVu Sans Mono for English/monospace accents
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import arabic_reshaper
from bidi.algorithm import get_display
import math, random

# ---- Canvas ----
W, H = 1200, 630
BG = (5, 8, 15)            # #05080f (matches theme-color)
CYAN = (0, 168, 232)       # accent
CYAN_DIM = (0, 120, 165)
WHITE = (240, 245, 250)
GRAY = (130, 140, 155)
GREEN_OK = (60, 200, 120)
ORANGE = (255, 150, 80)

img = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img, "RGBA")

# ---- Font paths ----
FONT_AR = "/home/z/my-project/fonts/Cairo-Bold.ttf"          # variable weight, loads default
FONT_AR_LIGHT = "/home/z/my-project/fonts/NotoNaskhArabic-Bold.ttf"
FONT_MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"
FONT_LATIN = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_LATIN_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def ar(text, font):
    """Reshape Arabic + apply BiDi for correct rendering."""
    reshaped = arabic_reshaper.reshape(text)
    return draw.text((0, 0), get_display(reshaped), font=font, fill=(0, 0, 0, 0))


def measure_ar(text, font):
    reshaped = arabic_reshaper.reshape(text)
    return draw.textbbox((0, 0), get_display(reshaped), font=font)


def draw_ar_text(xy, text, font, fill):
    """Draw Arabic text right-to-left at (xy = top-right anchor)."""
    reshaped = arabic_reshaper.reshape(text)
    display = get_display(reshaped)
    draw.text(xy, display, font=font, fill=fill)


# ---- 1. Background gradient overlay ----
# Subtle radial cyan glow at top-right
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gdraw = ImageDraw.Draw(glow)
for r in range(700, 0, -10):
    alpha = max(0, int(45 * (1 - r / 700)))
    gdraw.ellipse([W - r - 100, -r // 2, W + 100, r], fill=(0, 168, 232, alpha))
glow = glow.filter(ImageFilter.GaussianBlur(60))
img.paste(glow, (0, 0), glow)

# Subtle grid pattern (very faint)
for x in range(0, W, 40):
    draw.line([(x, 0), (x, H)], fill=(255, 255, 255, 6), width=1)
for y in range(0, H, 40):
    draw.line([(0, y), (W, y)], fill=(255, 255, 255, 6), width=1)

# ---- 2. Top-right corner: shield icon (drawn with polygons) ----
# Shield shape
sx, sy = W - 130, 70
shield_pts = [
    (sx, sy),
    (sx + 80, sy),
    (sx + 80, sy + 60),
    (sx + 40, sy + 110),
    (sx, sy + 60),
]
draw.polygon(shield_pts, outline=CYAN, width=3)
# Inner checkmark
draw.line([(sx + 22, sy + 55), (sx + 36, sy + 75), (sx + 62, sy + 35)],
          fill=CYAN, width=4)

# ---- 3. Top brand strip ----
font_brand = ImageFont.truetype(FONT_MONO, 22)
brand_text = "K.AL-HARBI  //  CYBER SECURITY"
draw.text((80, 60), brand_text, font=font_brand, fill=CYAN)

# Small green dot (status: online)
draw.ellipse([60, 67, 70, 77], fill=GREEN_OK)

# ---- 4. Hero name (Arabic) ----
font_hero = ImageFont.truetype(FONT_AR, 86)
hero_text = "م. خالد الحربي"
bbox = measure_ar(hero_text, font_hero)
hero_w = bbox[2] - bbox[0]
hero_x = 80
hero_y = 165
# Draw a thin cyan line above (RTL accent bar)
draw.line([(hero_x, hero_y - 18), (hero_x + 60, hero_y - 18)], fill=CYAN, width=3)
draw_ar_text((hero_x, hero_y), hero_text, font_hero, WHITE)

# ---- 5. Subtitle (Arabic) ----
font_sub = ImageFont.truetype(FONT_AR, 36)
sub_text = "خبير أمن سيبراني معتمد CPD — المملكة المتحدة"
bbox = measure_ar(sub_text, font_sub)
sub_y = hero_y + 110
draw_ar_text((hero_x, sub_y), sub_text, font_sub, CYAN)

# ---- 6. Tagline in English (monospace accent) ----
font_tag = ImageFont.truetype(FONT_MONO, 24)
tag_text = "> Penetration Testing  •  Network Defense  •  Incident Response"
draw.text((hero_x, sub_y + 65), tag_text, font=font_tag, fill=GRAY)

# ---- 7. Stats row (3 stat cards) ----
stats = [
    ("35+", "اعتماد موثّق"),
    ("8+", "سنوات خبرة"),
    ("100+", "دورة تدريبية"),
]
card_y = 410
card_w = 280
card_h = 95
gap = 20
start_x = 80

for i, (num, label) in enumerate(stats):
    cx = start_x + i * (card_w + gap)
    # Card background (very subtle)
    draw.rounded_rectangle([cx, card_y, cx + card_w, card_y + card_h],
                           radius=8, fill=(255, 255, 255, 8), outline=(0, 168, 232, 60), width=1)
    # Big number
    font_num = ImageFont.truetype(FONT_LATIN, 42)
    draw.text((cx + 20, card_y + 12), num, font=font_num, fill=CYAN)
    # Arabic label
    font_lbl = ImageFont.truetype(FONT_AR, 22)
    # Arabic label needs BiDi
    lbl_y = card_y + 60
    draw_ar_text((cx + 20, lbl_y), label, font_lbl, GRAY)

# ---- 8. Bottom strip: certifications row ----
cert_y = 545
font_cert = ImageFont.truetype(FONT_MONO, 18)
certs = ["CPD UK", "Coventry University", "IBM SkillsBuild", "Cisco", "OPSWAT", "Credly"]
cx = 80
for cert in certs:
    bbox = draw.textbbox((0, 0), cert, font=font_cert)
    cw = bbox[2] - bbox[0]
    # Rounded rect badge
    draw.rounded_rectangle([cx, cert_y, cx + cw + 28, cert_y + 32],
                           radius=16, outline=(0, 168, 232, 120), width=1)
    draw.text((cx + 14, cert_y + 7), cert, font=font_cert, fill=CYAN)
    cx += cw + 50

# ---- 9. Bottom-right URL ----
font_url = ImageFont.truetype(FONT_MONO, 18)
url_text = "khalid-cyber-security.vercel.app"
bbox = draw.textbbox((0, 0), url_text, font=font_url)
url_w = bbox[2] - bbox[0]
draw.text((W - url_w - 60, H - 45), url_text, font=font_url, fill=GRAY)

# Tiny "CISO-grade security" tag below url
font_tiny = ImageFont.truetype(FONT_MONO, 13)
tag2 = "// protecting businesses since 2018"
bbox = draw.textbbox((0, 0), tag2, font=font_tiny)
tag2_w = bbox[2] - bbox[0]
draw.text((W - tag2_w - 60, H - 22), tag2, font=font_tiny, fill=(90, 100, 115))

# ---- 10. Decorative binary digits scattered (very subtle) ----
random.seed(42)
font_bin = ImageFont.truetype(FONT_MONO, 11)
for _ in range(60):
    bx = random.randint(0, W)
    by = random.randint(0, H)
    bit = random.choice(["0", "1"])
    draw.text((bx, by), bit, font=font_bin, fill=(0, 168, 232, 18))

# ---- 11. Bottom border accent line ----
draw.line([(0, H - 4), (W, H - 4)], fill=CYAN, width=2)

# ---- 12. Left vertical accent bar ----
draw.line([(60, 165), (60, 505)], fill=CYAN, width=2)

# Save
out_path = "/home/z/my-project/download/khalid-site-fixes/public/og.jpg"
img.save(out_path, "JPEG", quality=92, optimize=True)
print(f"Saved: {out_path}")
print(f"Size: {img.size}")

# Also save a PNG version
out_png = "/home/z/my-project/download/khalid-site-fixes/public/og.png"
img.save(out_png, "PNG", optimize=True)
print(f"Saved: {out_png}")
