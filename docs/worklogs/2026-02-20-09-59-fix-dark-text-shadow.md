---
when: 2026-02-20T09:59:42Z
why: Fix missing text shadow variable in dark theme
what: Added --text-shadow-light to dark theme CSS variables
model: github-copilot/claude-sonnet-4.5
tags: [fix, theme, css, dark-mode]
---

Added missing `--text-shadow-light` variable to dark theme `:root` section in `src/style.css`. Dark theme now uses dark shadows (black with opacity) for departure destinations, countdowns, and mode icons. Removed unused `--text-shadow-dark` variable from light theme. Version bumped to 1.15.3.
