# Commits

When creating commits, use an appropriate trailer in the message.

- If you are Claude: `Co-authored-by: Claude <noreply@anthropic.com>`
- If you are Codex: `Co-authored-by: Codex <noreply@openai.com>`

# Keep AGENTS.md and README.md up to date

After making logical changes to the project (adding, removing, or renaming files/directories; changing architecture, conventions, or component behavior), 
check whether AGENTS.md needs to be updated to reflect the new state.

Examples of changes that should trigger a review:
- Adding or removing a script, stylesheet, or HTML page
- Changing the theming approach or CSS custom-property contract
- Altering image-gallery behavior or naming conventions
- Modifying the top-action-button pattern or layout strategy

# Project structure and stack

## Tech Stack

- **No build tools or JS frameworks** — plain HTML, CSS, and vanilla JavaScript.
- **No CSS framework.** The stylesheets are hand-written on the same base as the app sites (the `gh-pages` branches of Alveary, Chromahora and Carouline), so carry layout changes across from them rather than letting the four drift apart.

## Look and theming

- Colors come from the `images/af.png` logo's blue. `styles/index-light.css` and `styles/index-dark.css` hold the color tokens and the hero's glow; `styles/index-common.css` holds everything theme-independent.
- Both theme sheets ship on every load, media-scoped to `prefers-color-scheme`, as are the two `theme-color` metas, so with no override the page follows the OS with no JavaScript. `dark-mode.js` only steps in when the toggle stores an override; keep its theme colors in step with each sheet's `--bg`.
- Section headings are `<h2 class="chip">` capsules filled with `--chip-bg`, like the app sites' chips.

## Project Structure

```
index.html                  — Single-page site (hero, intro, experience timeline, apps, photo gallery)
favicon.png                 — 96x96 browser favicon derived from `images/af.png`
CNAME                       — Custom domain config for GitHub Pages
_config.yml                 — Jekyll config that excludes agent tooling, `og-image/`, and all Markdown from GitHub Pages builds
.agents/
  checks/                   — Language-specific review rules
  skills/
    watermark-portfolio-images/ — Signs portfolio photos (see "Portfolio images" below)
og-image/                   — Source and renderer for `images/og-image.png` (see "Link preview" below)
styles/
  index-common.css          — Theme-independent layout and component styles
  index-dark.css            — Dark theme (CSS custom properties)
  index-light.css           — Light theme (CSS custom properties)
scripts/
  dark-mode.js              — Theme toggle: system preference detection, localStorage persistence, themed `<picture>` sources
  age.js                    — Age calculation from birth date (vanilla JS)
  image-modal.js            — Photo gallery modal (swipe, pinch-to-zoom, keyboard nav)
  overview-return.js        — Floating bottom-right button that appears on scroll and smooth-scrolls to top (named to avoid ad-block "back to top" cosmetic filters)
images/                     — Logo, link preview, company logos
  apps/                     — App icons (light + dark pair per app) for the "Apps" section
  portfolio/                — Gallery photos, each stored as a full-size + thumbnail pair
```

## Header navigation

The Apps, Experience, and Recent shots shortcuts are fragment links using `.top-btn`. CSS handles smooth scrolling and respects reduced-motion preferences. The theme toggle remains a button.

## Apps section

The "Apps" section (`#apps`) showcases the apps, above "Recent shots". Each app is a single glass
`<a class="app-card">` in `.app-grid`, linking to its `<app>.af.codes` subdomain, that lifts on hover and keyboard
focus.

Keep the descriptions about the same length (~100 characters). The grid is three columns above 960px and stacks
at or below it, which keeps the three-column text width in a narrow band, and `text-wrap: pretty` fills each
paragraph to the same measure, so equal-length copy wraps to the same line count side by side.

Each app's icons are copied from its site's `gh-pages` branch (`images/app-icon-light.png` /
`images/app-icon-dark.png`) into `images/apps/<app>-light.png` / `<app>-dark.png`; re-copy them when an app's
icon changes.

Each icon is a `<picture>` whose dark `<source>` carries `data-theme="dark"` and a
`(prefers-color-scheme: dark)` media query, with the light image as the `<img>` fallback. `dark-mode.js`
flips every `picture source[data-theme]` when the toggle overrides the system theme, so any new themed
image should follow the same pattern.

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
- Prepend new `<img>` entries to the top of the `.gallery` div in `#recent-shots`; the gallery is
  ordered newest-first.
- Give each one `class="portfolio-image"`, which is what `image-modal.js` collects on.
- Re-render the link preview, which shows the six newest photos (see below).

## Link preview

`images/og-image.png` is the 1200x630 preview link unfurls show: the logo, name and title, every app's dark
icon, and the six newest photos, on the dark theme. `og-image/render.sh` renders it with headless Chrome from
`og-image/og-image.html`, reading the photos and icons from `index.html` so the preview matches the page.

**Run `og-image/render.sh` and commit `images/og-image.png` in the same change as anything it shows:** adding,
removing or reordering photos among the newest six, adding or removing an app or changing its icon, changing the
name or title (which `og-image.html` repeats from the hero, minus the age), the logo, or the dark theme's colors.
Then view the PNG to check nothing overflows. Keep it a PNG, since crawler support for WebP is patchy.
