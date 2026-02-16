---
when: 2026-02-15T03:50:00Z
why: Document where to tweak spacing for quick manual experiments
what: add inline CSS comments pointing to `.departures` gap and `.departure` row-gap
model: github-copilot/gpt-5-mini
tags: [docs,ui,style]
---

Add inline comments in `src/style.css` that mark the two places to adjust spacing: the `.departures { gap: }` (controls spacing between station rows) and `.departure { row-gap: }` (controls spacing between destination and countdown within a station). Files: src/style.css
