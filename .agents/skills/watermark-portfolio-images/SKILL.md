---
name: watermark-portfolio-images
description: Apply a signature watermark to portfolio photos in images/portfolio/. Use when the user asks to sign, watermark, or add a signature to portfolio images, or to re-apply or adjust the watermark opacity/font/position.
---

# Watermark Portfolio Images

Applies an "Aidan Follestad" text watermark to all JPEGs in `images/portfolio/` using the **Gingerink** font. Semi-transparent white text with a dark drop shadow for visibility on any background.

## Quick start

```bash
python3 .agents/skills/watermark-portfolio-images/watermark.py
```

Requires Pillow and piexif (`pip install Pillow piexif`). If they aren't installed in the active Python, run it through `uv` instead, which resolves them on the fly:

```bash
uv run --with Pillow --with piexif python3 .agents/skills/watermark-portfolio-images/watermark.py
```

Already-watermarked images are automatically skipped — the script writes standard EXIF fields after signing and checks for them before processing. Pass `--force` to re-watermark regardless.

| EXIF field | Value |
|---|---|
| `Artist` | `Aidan Follestad` |
| `Copyright` | `Aidan Follestad / af.codes` |

These fields are visible to anyone inspecting the image in a photo viewer, Finder, or EXIF reader. `Copyright` is used as the skip marker.

### Font setup

The script resolves the font in this order:

1. **Bundled** — any `.ttf` or `.ttc` file placed directly in `.agents/skills/watermark-portfolio-images/` is picked up automatically.
2. **CLI flag** — pass `--font /path/to/font.ttf` to specify it explicitly.

The intended font is **Gingerink**, already bundled here as `gingerink.ttf`, so no setup is needed.

## Parameters

| Setting | Value |
|---|---|
| Font | Gingerink (`gingerink.ttf`, bundled) — or pass `--font` |
| Font size | `max(8, int(width * 0.011))` — 1.1% of image width, min 8px |
| Text color | White, **50% opacity** (`128/255`) |
| Shadow color | Black, 39% opacity (`100/255`), blurred |
| Shadow offset | `max(1, int(font_size * 0.12))` — 12% of font size |
| Shadow blur | Gaussian, radius = shadow offset |
| Position | Bottom-right: `padding_x = max(12, int(width * 0.02))`, `padding_y = max(8, int(height * 0.018))` |
| JPEG quality | 95 |

## Dark images — reduced opacity

Images whose **bottom-right corner** — where the signature lands — is near-black use **30% opacity** (`77/255`) so the white text doesn't stand out too harshly. The `DARK_IMAGES` set in `watermark.py` controls this list. Judge by that corner, not by the image as a whole: a night shot with a brightly lit bottom-right reads fine at the default 50%.

To add a new dark image, list both the full-size file and its thumbnail:
```python
DARK_IMAGES = {
    "moon.jpg", "moon_thumbnail.jpg",
    "starlight.jpg", "starlight_thumbnail.jpg",
}
```

## Script options

```bash
# Watermark all images not yet marked in EXIF
python3 .agents/skills/watermark-portfolio-images/watermark.py

# Force re-watermark all images, ignoring the EXIF marker
python3 .agents/skills/watermark-portfolio-images/watermark.py --force

# Override opacity for all images
python3 .agents/skills/watermark-portfolio-images/watermark.py --opacity 0.4

# Single file
python3 .agents/skills/watermark-portfolio-images/watermark.py --file moon.jpg

# Force re-watermark a single file
python3 .agents/skills/watermark-portfolio-images/watermark.py --file moon.jpg --force
```

## Adjusting settings

- **Opacity**: change `DEFAULT_OPACITY` or `DARK_OPACITY` in `watermark.py`, or pass `--opacity`
- **Font size**: adjust the `0.011` multiplier (e.g. `0.014` = slightly larger)
- **Position**: adjust `0.02` (horizontal) and `0.018` (vertical) padding multipliers
- **Font**: drop a different `.ttf`/`.ttc` into the skill directory, or pass `--font /path/to/font.ttf`

## Re-running after changes

```bash
python3 .agents/skills/watermark-portfolio-images/watermark.py
git add images/portfolio/ && git commit -m "Update watermarks"
```
