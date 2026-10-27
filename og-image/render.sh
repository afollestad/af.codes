#!/bin/sh
# Renders images/og-image.png from og-image.html, filled with the six newest
# photos and every app's dark icon in index.html's order, so the preview always
# matches the page it was rendered from.
set -eu
cd "$(dirname "$0")/.."

photos=$(grep -o 'images/portfolio/[^"]*_thumbnail\.jpg' index.html | head -n 6 | paste -sd , -)
apps=$(grep -o 'images/apps/[^"]*-dark\.png' index.html | paste -sd , -)

chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
[ -x "$chrome" ] || { echo "Google Chrome not found at $chrome" >&2; exit 1; }

# A throwaway profile, so this never touches (or waits on) a running Chrome.
profile=$(mktemp -d)
trap 'rm -rf "$profile"' EXIT

# Chrome's own logging is noise, so a failed render shows up as the missing
# file below rather than as a stale preview that looks current.
rm -f images/og-image.png
"$chrome" \
    --headless=new --force-dark-mode --hide-scrollbars --user-data-dir="$profile" \
    --window-size=1200,630 --virtual-time-budget=5000 \
    --screenshot="$PWD/images/og-image.png" \
    "file://$PWD/og-image/og-image.html?photos=$photos&apps=$apps" 2>/dev/null

sips -g pixelWidth -g pixelHeight -g hasAlpha images/og-image.png
