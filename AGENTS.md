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
index.html                  — Single-page site (hero, intro, experience timeline, photo gallery, apps)
favicon.png                 — 96x96 browser favicon derived from `images/af.png`
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
  dark-mode.js              — Theme toggle: system preference detection, localStorage persistence, themed `<picture>` sources
  age.js                    — Age calculation from birth date (vanilla JS)
  image-modal.js            — Photo gallery modal (swipe, pinch-to-zoom, keyboard nav)
  scroll-to-gallery.js      — Smooth-scrolls to the "Recent shots" section on button click
  scroll-to-experience.js   — Smooth-scrolls to the "Experience" section on button click
  overview-return.js        — Floating bottom-right button that appears on scroll and smooth-scrolls to top (named to avoid ad-block "back to top" cosmetic filters)
images/                     — Portfolio photos, company logos, social icons
  apps/                     — App icons (light + dark pair per app) for the "Apps" section
  portfolio/                — Gallery photos, each stored as a full-size + thumbnail pair
```

## Apps section

The "Apps" section (`#apps`) showcases the iOS apps. Each app is a single `<a class="app-card">` linking to its
`<app>.af.codes` subdomain. The card surface is invisible at rest and lifts off the background on hover and
keyboard focus, colored by the `--card-hover-background-color` / `--card-hover-shadow` custom properties in both
theme stylesheets. `.app-card` is excluded from the global `.bg-gray a` underline and hover-scale rules in
`index-common.css`, the same way `.icon` and `.docs-logo` are.

Keep the descriptions about the same length (~100 characters). The grid is three columns above 960px and stacks
at or below it (`col-lg-12`), which keeps the three-column text width in a narrow band, and `text-wrap: pretty`
fills each paragraph to the same measure, so equal-length copy wraps to the same line count side by side.

Each app's icons are copied from its site's `gh-pages` branch (`images/app-icon-light.png` /
`images/app-icon-dark.png`) into `images/apps/<app>-light.png` / `<app>-dark.png`; re-copy them when an app's
icon changes. Alveary's site has no finished icon (it layers the bee over a CSS gradient), so `alveary-*.png` are
composited at 256x256: its site's gradient (`#F7C133` → `#F2AC00` light, `#3a3a37` → `#232320` dark, top to 70%),
the bee layer from its repo's `AppIcon.icon/Assets` at 90% scale nudged up 1.55%, clipped to
`chromahora-light.png`'s alpha so the silhouette matches the other icons exactly.

Each icon is a `<picture>` whose dark `<source>` carries `data-theme="dark"` and a
`(prefers-color-scheme: dark)` media query, with the light image as the `<img>` fallback. `dark-mode.js`
flips every `picture source[data-theme]` when the toggle overrides the system theme, so any new themed
image should follow the same pattern. Don't give app icons the `.icon` class: the dark theme inverts
`.icon img`.

## Portfolio images

Every photo in the "Recent shots" gallery is stored as a **pair** of files in `images/portfolio/`:

| File | Dimensions |
|---|---|
| `<name>.jpg` | 2400x1600 |
| `<name>_thumbnail.jpg` | 600x400 |

Both are required. `index.html` references only the thumbnail; `scripts/image-modal.js` derives the
full-size URL for the modal by stripping `_thumbnail` from the thumbnail's `src`, so a missing
full-size file produces a broken modal rather than a visibly broken page.

One thumbnail predates the convention: `snow2` is 696x464. Same 3:2 ratio, so it lays out
identically — leave it alone rather than resizing.

When adding photos:

- Downscale to the sizes above with `sips --resampleWidth` (no ImageMagick in this project). Sources
  are 3:2, matching both targets, so nothing is cropped.
- Convert any non-sRGB source (check with `sips -g profile`) to sRGB first with `sips --matchTo
  "/System/Library/ColorSync/Profiles/sRGB Profile.icc"`. The watermark script re-saves without an
  ICC profile, so browsers read the pixels as sRGB and wide-gamut colors would come out dull.
- Sign every new file with the `watermark-portfolio-images` skill before committing — it applies the
  signature and writes the `Artist` / `Copyright` EXIF fields. Invoke it with `--file <name>` per
  image so a directory-wide run can't re-sign existing photos.
- Prepend new `<img>` entries to the top of the `.columns` div in `#recent-shots`; the gallery is
  ordered newest-first.
- Reuse the existing class list verbatim — `column col-xs-12 col-sm-6 col-md-4 col-lg-3 col-xl-3
  col-3 portfolio-image`. The `portfolio-image` class is what `image-modal.js` collects on.
