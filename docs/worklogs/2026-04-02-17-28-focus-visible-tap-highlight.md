---
when: 2026-04-02T17:28:51Z
why: Remove disruptive touch focus rings on mobile while preserving keyboard accessibility across all interactive elements
what: Apply outline:none + -webkit-tap-highlight-color:transparent + :focus-visible keyboard ring to all interactive UI elements
model: github-copilot/claude-sonnet-4.6
tags: [css, accessibility, focus, mobile, pwa, buttons, dropdown, autocomplete, footer]
---

Audited all interactive elements across the CSS layer and applied a consistent focus pattern: suppress default outline and WebKit tap highlight on the base rule, restore a visible ring exclusively via `:focus-visible` for keyboard navigation. Files touched: `src/css/buttons.css` (all buttons), `src/css/header.css` (station-dropdown-item), `src/css/gps-dropdown.css` (gps-dropdown-item), `src/css/autocomplete.css` (autocomplete list buttons), `src/css/footer.css` (footer links). Bumped to v1.40.21.
