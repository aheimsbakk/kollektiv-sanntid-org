---
when: 2026-02-20T16:09:33Z
why: Four hardcoded strings were not translated across all supported languages
what: Add translations for upgradingFrom, noDepartures, live, error to all 12 languages
model: github-copilot/claude-sonnet-4.5
tags: [i18n, translations, bugfix]
---

Added 4 missing translation keys to all 12 languages and updated app.js to use t() for hardcoded strings.
