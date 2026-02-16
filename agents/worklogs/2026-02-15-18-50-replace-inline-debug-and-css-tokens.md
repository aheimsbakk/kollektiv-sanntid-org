---
when: 2026-02-15T18:50:00Z
why: Consolidate styling tokens and remove inline debug styles so theming works via CSS variables
what: replace inline debug-panel styles with CSS class and introduce overlay/shadow/border tokens; update debug usage in src/ui/ui.js and tokens in src/style.css
model: github-copilot/gpt-5-mini
tags: [css,ui,worklog]
---

Convert debug panel from inline styles to a CSS-controlled `.debug-panel` with an `open` class and add tokens for overlays, shadows, and muted borders.
