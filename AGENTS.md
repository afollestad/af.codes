# af.codes

Personal website for Aidan Follestad, hosted at [af.codes](https://af.codes).

## Tech Stack

- **No build tools or JS frameworks** — plain HTML, CSS, and vanilla JavaScript.
- **[Spectre.css](https://picturepan2.github.io/spectre/getting-started.html)** is the CSS framework. It provides the flexbox grid (`container`, `columns`, `column col-*`), utility classes (`bg-gray`, `bg-primary`, `text-center`, `text-light`, etc.), and component styles (`card`, `btn`, `btn-clear`). The minified bundle lives at `styles/spectre.min.css`.

## Project Structure

```
index.html                  — Single-page site (hero, intro, experience timeline, photo gallery)
CNAME                       — Custom domain config for GitHub Pages
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
images/                     — Portfolio photos, company logos, social icons
privacypolicies/            — Privacy policy pages for past Android apps
```

## Top Action Buttons

The theme toggle and scroll-to-gallery buttons share the `.top-actions` container (fixed top-right) and the `.top-btn` class for consistent sizing, opacity, and hover behavior. The container uses `position: fixed` globally but switches to `position: absolute` inside `.section-hero`.

## Theming

Dark and light themes are controlled by two separate CSS files (`index-dark.css` and `index-light.css`) that define CSS custom properties on `:root`. The `dark-mode.js` script swaps which stylesheet is active by toggling the `media` attribute. Theme preference is persisted in `localStorage` under the key `theme`. If the user hasn't chosen, the system `prefers-color-scheme` media query is respected.

When changing the primary color, update both the CSS custom property in the theme file **and** the hardcoded hex in `scripts/dark-mode.js` (`applyThemeColor`).

## Hover & Interaction

Hover-only effects (e.g. link raise, button highlight) must be wrapped in `@media (hover: hover) and (pointer: fine)` so they never fire on touch screens.

## Image Gallery

Portfolio photos in `index.html` use `_thumbnail` suffixed filenames. The modal (`image-modal.js`) strips `_thumbnail` from the src to load the full-resolution image. It supports:
- Horizontal swipe to navigate between images
- Vertical swipe to dismiss
- Pinch-to-zoom and double-tap/double-click zoom
- Trackpad zoom (ctrl+scroll) and Safari gesture events
- Keyboard navigation (ArrowLeft, ArrowRight, Escape)
- Adjacent image preloading
