---
when: 2026-02-17T21:01:34Z
why: Long translated mode names need more horizontal space
what: Changed transport modes from 2x3 to 3x2 table layout
model: github-copilot/claude-sonnet-4.5
tags: [ui, i18n, layout]
---

Reorganized transport modes table from 2x3 to 3x2 layout to accommodate longer translated names. New layout: Row 1: Bus/Metro, Row 2: Rail/Tram, Row 3: Water/Coach. Updated `POSSIBLE` array and `updateTranslations()` function in `src/ui/options.js`. Bumped version to 1.4.3.
