---
when: 2026-02-20T15:42:32Z
why: Button tooltips were not updating when language flags clicked directly
what: Extract tooltip update into shared function called on both language change paths
model: github-copilot/claude-sonnet-4.5
tags: [i18n, ui, tooltip, bugfix]
---

Created `updateGlobalButtonTooltips()` function in src/app.js and called it from both the language flag click callback (via `onLanguageChange`) and the Apply button path. This ensures tooltips for share, theme, and settings buttons update immediately when users click language flags, not just when using the Apply button. Bumped version to 1.23.4.
