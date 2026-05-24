#!/usr/bin/env python3
"""
Apply an "Aidan Follestad" signature watermark to all JPEGs in images/portfolio/.
Watermarked files are marked via the EXIF Software tag and skipped on subsequent runs.

Usage:
    python watermark.py                          # watermark all un-watermarked images
    python watermark.py --force                  # re-watermark all, ignoring EXIF marker
    python watermark.py --opacity 0.3            # override opacity for all
    python watermark.py --file moon.jpg          # single file
    python watermark.py --file moon.jpg --force  # force re-watermark single file
"""
import argparse
import glob
import os
import sys

import piexif
from PIL import Image, ImageDraw, ImageFont, ImageFilter

PORTFOLIO_DIR = os.path.join(os.path.dirname(__file__), "../../../images/portfolio")
SIGNATURE_TEXT = "Aidan Follestad"

# Font search: look for any .ttf/.ttc in the skill directory first
_SKILL_DIR = os.path.dirname(os.path.abspath(__file__))
_BUNDLED_FONTS = sorted(
    f for f in os.listdir(_SKILL_DIR) if f.lower().endswith((".ttf", ".ttc"))
)
FONT_PATH = os.path.join(_SKILL_DIR, _BUNDLED_FONTS[0]) if _BUNDLED_FONTS else None

# Images that are mostly dark — use reduced opacity so the white text isn't jarring
DARK_IMAGES = {"moon.jpg", "moon_thumbnail.jpg"}
DEFAULT_OPACITY = 0.50
DARK_OPACITY = 0.30

EXIF_ARTIST = b"Aidan Follestad"
EXIF_COPYRIGHT = b"Aidan Follestad / af.codes"


def is_watermarked(image_path: str) -> bool:
    try:
        exif = piexif.load(image_path)
        return exif.get("0th", {}).get(piexif.ImageIFD.Copyright, b"") == EXIF_COPYRIGHT
    except Exception:
        return False


def mark_as_watermarked(image_path: str) -> None:
    try:
        exif = piexif.load(image_path)
    except Exception:
        exif = {"0th": {}, "Exif": {}, "GPS": {}, "1st": {}, "thumbnail": None}
    ifd = exif.setdefault("0th", {})
    ifd[piexif.ImageIFD.Artist] = EXIF_ARTIST
    ifd[piexif.ImageIFD.Copyright] = EXIF_COPYRIGHT
    piexif.insert(piexif.dump(exif), image_path)


def apply_watermark(image_path: str, opacity: float) -> None:
    img = Image.open(image_path).convert("RGBA")
    width, height = img.size

    # Font: 1.1% of image width, minimum 8px
    font_size = max(8, int(width * 0.011))
    font = ImageFont.truetype(FONT_PATH, font_size)

    dummy = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    bbox = dummy.textbbox((0, 0), SIGNATURE_TEXT, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    # Padding: 2% of width from right, 1.8% of height from bottom
    padding_x = max(12, int(width * 0.02))
    padding_y = max(8, int(height * 0.018))
    x = width - text_w - bbox[0] - padding_x
    y = height - text_h - bbox[1] - padding_y

    # Drop shadow: offset = 12% of font size, black at ~39% opacity, blurred
    shadow_offset = max(1, int(font_size * 0.12))
    shadow_layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow_layer).text(
        (x + shadow_offset, y + shadow_offset),
        SIGNATURE_TEXT,
        font=font,
        fill=(0, 0, 0, 100),
    )
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=max(1, shadow_offset)))

    # White text at the specified opacity
    alpha = int(opacity * 255)
    text_layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(text_layer).text((x, y), SIGNATURE_TEXT, font=font, fill=(255, 255, 255, alpha))

    result = Image.alpha_composite(img, shadow_layer)
    result = Image.alpha_composite(result, text_layer)
    result.convert("RGB").save(image_path, "JPEG", quality=95)
    mark_as_watermarked(image_path)
    print(f"  signed: {os.path.basename(image_path)} ({width}x{height}, font {font_size}px, opacity {int(opacity*100)}%)")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--opacity", type=float, default=None, help="Override opacity (0.0–1.0) for all images")
    parser.add_argument("--file", type=str, default=None, help="Process a single filename only (e.g. moon.jpg)")
    parser.add_argument("--font", type=str, default=None, help="Path to a .ttf/.ttc font file")
    parser.add_argument("--force", action="store_true", help="Re-watermark even if already marked in EXIF")
    args = parser.parse_args()

    global FONT_PATH
    if args.font:
        FONT_PATH = args.font
    if not FONT_PATH or not os.path.isfile(FONT_PATH):
        print(
            "Error: no font file found.\n"
            "  Expected font: Gingerink (GingerinkPersonalUse-rvJd7.ttf)\n"
            f"  Drop the .ttf file into {_SKILL_DIR}\n"
            "  or pass --font /path/to/GingerinkPersonalUse-rvJd7.ttf",
            file=sys.stderr,
        )
        sys.exit(1)

    jpg_files = sorted(glob.glob(os.path.join(PORTFOLIO_DIR, "*.jpg")))
    if args.file:
        jpg_files = [f for f in jpg_files if os.path.basename(f) == args.file]

    print(f"Processing {len(jpg_files)} image(s)...")
    for path in jpg_files:
        name = os.path.basename(path)
        if not args.force and is_watermarked(path):
            print(f"  skipped: {name} (already watermarked)")
            continue
        if args.opacity is not None:
            opacity = args.opacity
        elif name in DARK_IMAGES:
            opacity = DARK_OPACITY
        else:
            opacity = DEFAULT_OPACITY
        apply_watermark(path, opacity)
    print("Done.")


if __name__ == "__main__":
    main()
