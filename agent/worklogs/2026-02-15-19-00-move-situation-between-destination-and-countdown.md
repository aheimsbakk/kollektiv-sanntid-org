---
when: 2026-02-15T19:00:00Z
why: Improve visual grouping by placing per-departure situations between destination and countdown
what: Move `.departure-situations` DOM node to appear between destination text and countdown timer
model: github-copilot/gpt-5-mini
tags: [ui,style]
---

Move the per-departure situation line so it sits between the destination and the countdown. This keeps related information visually grouped and avoids confusing the countdown when situations wrap. Files: src/ui/departure.js
