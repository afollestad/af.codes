#!/bin/sh
# Renders images/og-image.png from og-image.html, filled with the six newest
# photos and every app's dark icon in index.html's order, so the preview always
# matches the page it was rendered from.
set -eu
cd "$(dirname "$0")/.."

chrome="${CHROME_PATH:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
command -v "$chrome" >/dev/null || { echo "Chrome not found at $chrome; set CHROME_PATH." >&2; exit 1; }

# A throwaway profile, so this never touches (or waits on) a running Chrome,
# beside the downloaded icons. Under /tmp rather than $TMPDIR, whose macOS
# folder names can hold a "+", which the page's query string reads as a space.
work=$(mktemp -d /tmp/og-image.XXXXXX)
trap 'rm -rf "$work"' EXIT
mkdir "$work/profile" "$work/icons"

photos=$(grep -o 'images/portfolio/[^"]*_thumbnail\.jpg' index.html | head -n 6 | paste -sd , -)

# The page loads each icon from its app's site. Downloading them first fails the
# render on an unreachable icon, where Chrome would leave a silent gap.
apps=
n=0
for url in $(grep -o 'https://[a-z]*\.af\.codes/images/app-icon-dark\.png' index.html); do
    n=$((n + 1))
    curl -fsSL --retry 2 -o "$work/icons/$n.png" "$url" || { echo "Couldn't download $url." >&2; exit 1; }
    apps="${apps:+$apps,}file://$work/icons/$n.png"
done
[ -n "$apps" ] || { echo "No app icons found in index.html." >&2; exit 1; }

# Chrome's own logging is noise, so a failed render shows up as the missing
# file below rather than as a stale preview that looks current.
rm -f images/og-image.png
"$chrome" \
    --headless=new --force-dark-mode --hide-scrollbars --user-data-dir="$work/profile" \
    --window-size=1200,630 --virtual-time-budget=5000 \
    --screenshot="$PWD/images/og-image.png" \
    "file://$PWD/og-image/og-image.html?photos=$photos&apps=$apps" 2>/dev/null

# Chrome exits 0 even when it can't write the screenshot, and so does sips on a
# missing file, so check the file itself.
[ -s images/og-image.png ] || { echo "Render failed: images/og-image.png was not written." >&2; exit 1; }
sips -g pixelWidth -g pixelHeight -g hasAlpha images/og-image.png
