---
when: 2026-02-15T18:55:00Z
why: Global situation banner conflicts with compact layouts and duplicates per-departure situations
what: Remove the top-level situation banner while preserving per-departure situation display
model: github-copilot/gpt-5-mini
tags: [ui,style]
---

Remove the single global situation banner to avoid duplicating alerts and causing layout issues on narrow screens. Departure-level situation lines are preserved and remain visible per item. Files: src/ui/ui.js, src/style.css, src/app.js
