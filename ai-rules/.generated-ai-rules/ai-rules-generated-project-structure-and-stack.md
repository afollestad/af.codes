## Tech Stack

- **No build tools or JS frameworks** — plain HTML, CSS, and vanilla JavaScript.
- **[Spectre.css](https://picturepan2.github.io/spectre/getting-started.html)** is the CSS framework. It provides the flexbox grid (`container`, `columns`, `column col-*`), utility classes (`bg-gray`, `bg-primary`, `text-center`, `text-light`, etc.), and component styles (`card`, `btn`, `btn-clear`). The minified bundle lives at `styles/spectre.min.css`.

## Project Structure

```
index.html                  — Single-page site (hero, intro, experience timeline, photo gallery)
CNAME                       — Custom domain config for GitHub Pages
_config.yml                 — Jekyll config that excludes `ai-rules/` and `AGENTS.md` from GitHub Pages builds
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
images/                     — Portfolio photos, company logos, social icons
ai-rules/skills/
  watermark-portfolio-images/ — Skill + script to apply signature watermark to portfolio images
```
