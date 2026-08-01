# Commits

When creating commits, use an appropriate trailer in the message.

- If you are Claude: `Co-authored-by: Claude <noreply@anthropic.com>`
- If you are Codex: `Co-authored-by: Codex <noreply@openai.com>`

# Keep AGENTS.md and README.md up to date

After making logical changes to the project (adding, removing, or renaming files/directories; changing architecture, conventions, or component behavior), 
check whether AGENTS.md needs to be updated to reflect the ne state.

Examples of changes that should trigger a review:
- Adding or removing a script, stylesheet, or HTML page
- Changing the theming approach or CSS custom-property contract
- Altering image-gallery behavior or naming conventions
- Modifying the top-action-button pattern or layout strategy

# Project structure and stack

## Tech Stack

- **No build tools or JS frameworks** — plain HTML, CSS, and vanilla JavaScript.
- **[Spectre.css](https://picturepan2.github.io/spectre/getting-started.html)** is the CSS framework. It provides the flexbox grid (`container`, `columns`, `column col-*`), utility classes (`bg-gray`, `bg-primary`, `text-center`, `text-light`, etc.), and component styles (`card`, `btn`, `btn-clear`). The minified bundle lives at `styles/spectre.min.css`.

## Project Structure

```
index.html                  — Single-page site (hero, intro, experience timeline, photo gallery)
CNAME                       — Custom domain config for GitHub Pages
_config.yml                 — Jekyll config that excludes agent tooling directories and all Markdown from GitHub Pages builds
.agents/
  checks/                   — Language-specific review rules
  skills/
    watermark-portfolio-images/ — Signs portfolio photos (see "Portfolio images" below)
styles/
  spectre.min.css           — Spectre.css framework (trimmed to only classes used by the site)
  index-common.css          — Theme-independent layout and component styles
  index-dark.css            — Dark theme (CSS custom properties)
  index-light.css           — Light theme (CSS custom properties)
scripts/
  dark-mode.js              — Theme toggle: system preference detection, localStorage persistence
  age.js                    — Age calculation from birth date (vanilla JS)
  image-modal.js            — Photo gallery modal (swipe, pinch-to-zoom, keyboard nav)
  scroll-to-gallery.js      — Smooth-scrolls to the "Recent shots" section on button click
  scroll-to-experience.js   — Smooth-scrolls to the "Experience" section on button click
  overview-return.js        — Floating bottom-right button that appears on scroll and smooth-scrolls to top (named to avoid ad-block "back to top" cosmetic filters)
images/                     — Portfolio photos, company logos, social icons
  portfolio/                — Gallery photos, each stored as a full-size + thumbnail pair
```

## Portfolio images

Every photo in the "Recent shots" gallery is stored as a **pair** of files in `images/portfolio/`:

| File | Dimensions |
|---|---|
| `<name>.jpg` | 2400x1600 |
| `<name>_thumbnail.jpg` | 600x400 |

Both are required. `index.html` references only the thumbnail; `scripts/image-modal.js` derives the
full-size URL for the modal by stripping `_thumbnail` from the thumbnail's `src`, so a missing
full-size file produces a broken modal rather than a visibly broken page.

Two thumbnails predate the convention: `snow` and `snow2` are 696x464. Same 3:2 ratio, so they lay
out identically — leave them alone rather than resizing.

When adding photos:

- Downscale to the sizes above with `sips --resampleWidth` (no ImageMagick in this project). Sources
  are 3:2, matching both targets, so nothing is cropped.
- Sign every new file with the `watermark-portfolio-images` skill before committing — it applies the
  signature and writes the `Artist` / `Copyright` EXIF fields. Invoke it with `--file <name>` per
  image so a directory-wide run can't re-sign existing photos.
- Prepend new `<img>` entries to the top of the `.columns` div in `#recent-shots`; the gallery is
  ordered newest-first.
- Reuse the existing class list verbatim — `column col-xs-12 col-sm-6 col-md-4 col-lg-3 col-xl-3
  col-3 portfolio-image`. The `portfolio-image` class is what `image-modal.js` collects on.
