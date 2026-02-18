---
when: 2026-02-18T17:54:21Z
why: Improve footer aesthetics with link emoji instead of text
what: Replace GitHub text with link emoji and remove trailing period from version
model: github-copilot/claude-sonnet-4.5
tags: [ui, footer, refactor]
---

## Footer UI Refinement (v1.6.1)

Changed footer GitHub link from text "GitHub" to link emoji 🔗. Removed trailing period after version number, changing format from "Version X.X.X." to "Version X.X.X". Updated both `createBoardElements` and `updateFooterTranslations` in `src/ui/ui.js`.
