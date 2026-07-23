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
  overview-return.js        — Floating bottom-right button that appears on scroll and smooth-scrolls to top (named to avoid ad-block "back to top" cosmetic filters)
images/                     — Portfolio photos, company logos, social icons
```
