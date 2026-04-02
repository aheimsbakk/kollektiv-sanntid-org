---
when: 2026-04-02T17:21:41Z
why: Improve keyboard focus visibility on the station title button
what: Add outline-offset 3px to .station-title in header.css
model: github-copilot/claude-sonnet-4.6
tags: [css, accessibility, header, focus]
---

Added `outline-offset: 3px` to the `.station-title` rule in `src/css/header.css` so the browser's default focus outline sits slightly away from the element edge, improving keyboard navigation clarity. Bumped version to v1.40.20.
