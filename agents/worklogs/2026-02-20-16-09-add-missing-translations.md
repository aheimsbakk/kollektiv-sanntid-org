---
when: 2026-02-20T16:09:33Z
why: Four hardcoded strings were not translated across all supported languages
what: Add translations for upgradingFrom, noDepartures, live, error to all 12 languages
model: github-copilot/claude-sonnet-4.5
tags: [i18n, translations, bugfix]
---

Added missing translation keys to all 12 supported languages (en, no, de, es, it, el, fa, hi, is, uk, fr, pl): `upgradingFrom`, `noDepartures`, `live`, and `error`. Updated src/app.js to use t() for these previously hardcoded strings. All status messages and UI text now properly translate when users switch languages. Bumped version to 1.24.2.
