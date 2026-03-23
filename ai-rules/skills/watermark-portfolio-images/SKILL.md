---
name: watermark-portfolio-images
description: Apply a signature watermark to portfolio photos in images/portfolio/. Use when the user asks to sign, watermark, or add a signature to portfolio images, or to re-apply or adjust the watermark opacity/font/position.
---

# Watermark Portfolio Images

Applies an "Aidan Follestad" text watermark to all JPEGs in `images/portfolio/` using the **Gingerink** font. Semi-transparent white text with a dark drop shadow for visibility on any background.

## Quick start

```bash
python3 ai-rules/skills/watermark-portfolio-images/watermark.py
```

Requires Pillow and piexif (`pip install Pillow piexif`).

Already-watermarked images are automatically skipped — the script writes standard EXIF fields after signing and checks for them before processing. Pass `--force` to re-watermark regardless.

| EXIF field | Value |
|---|---|
| `Artist` | `Aidan Follestad` |
| `Copyright` | `Aidan Follestad / af.codes` |

These fields are visible to anyone inspecting the image in a photo viewer, Finder, or EXIF reader. `Copyright` is used as the skip marker.

### Font setup

The script resolves the font in this order:

1. **Bundled** — any `.ttf` or `.ttc` file placed directly in `ai-rules/skills/watermark-portfolio-images/` is picked up automatically.
2. **CLI flag** — pass `--font /path/to/font.ttf` to specify it explicitly.

The intended font is **Gingerink** (`GingerinkPersonalUse-rvJd7.ttf`). Download it and drop it into the skill directory (or pass it via `--font`) before running.

## Parameters

| Setting | Value |
|---|---|
| Font | Gingerink (`GingerinkPersonalUse-rvJd7.ttf`) — place in skill directory or pass `--font` |
| Font size | `max(8, int(width * 0.011))` — 1.1% of image width, min 8px |
| Text color | White, **50% opacity** (`128/255`) |
| Shadow color | Black, 39% opacity (`100/255`), blurred |
| Shadow offset | `max(1, int(font_size * 0.12))` — 12% of font size |
| Shadow blur | Gaussian, radius = shadow offset |
| Position | Bottom-right: `padding_x = max(12, int(width * 0.02))`, `padding_y = max(8, int(height * 0.018))` |
| JPEG quality | 100 |

## Dark images — reduced opacity

Images that are mostly black (e.g. `moon.jpg`, `moon_thumbnail.jpg`) use **30% opacity** (`77/255`) so the white text doesn't stand out too harshly. The `DARK_IMAGES` set in `watermark.py` controls this list.

To add a new dark image:
```python
DARK_IMAGES = {"moon.jpg", "moon_thumbnail.jpg", "starlight.jpg"}
```

## Script options

```bash
# Watermark all images not yet marked in EXIF
python3 ai-rules/skills/watermark-portfolio-images/watermark.py

# Force re-watermark all images, ignoring the EXIF marker
python3 ai-rules/skills/watermark-portfolio-images/watermark.py --force

# Override opacity for all images
python3 ai-rules/skills/watermark-portfolio-images/watermark.py --opacity 0.4

# Single file
python3 ai-rules/skills/watermark-portfolio-images/watermark.py --file moon.jpg

# Force re-watermark a single file
python3 ai-rules/skills/watermark-portfolio-images/watermark.py --file moon.jpg --force
```

## Adjusting settings

- **Opacity**: change `DEFAULT_OPACITY` or `DARK_OPACITY` in `watermark.py`, or pass `--opacity`
- **Font size**: adjust the `0.011` multiplier (e.g. `0.014` = slightly larger)
- **Position**: adjust `0.02` (horizontal) and `0.018` (vertical) padding multipliers
- **Font**: drop a different `.ttf`/`.ttc` into the skill directory, or pass `--font /path/to/font.ttf`

## Re-running after changes

```bash
python3 ai-rules/skills/watermark-portfolio-images/watermark.py
git add images/portfolio/ && git commit -m "Update watermarks"
```
