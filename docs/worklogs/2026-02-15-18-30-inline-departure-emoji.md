---
when: 2026-02-15T18:30:00Z
why: Place transport emoji inline with destination text for better wrapping on narrow screens
what: Inline transport emoji into departure destination text and add accessible aria-label
model: github-copilot/gpt-5-mini
tags: [ui,style,emoji]
---

Inline transport emoji into each departure's destination text so the icon flows with the name instead of being a separate element. Files: src/ui/departure.js, src/style.css, tests/ui.emoji.test.mjs, tests/ui.emoji.rawtest.mjs
