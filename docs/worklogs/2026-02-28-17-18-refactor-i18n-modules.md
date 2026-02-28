---
when: 2026-02-28T17:18:03Z
why: Apply Single Responsibility Principle to the monolithic i18n.js
what: Split src/i18n.js into 5 focused modules under src/i18n/
model: opencode/claude-sonnet-4-6
tags: [refactor, i18n, srp, modules]
---

Split the 951-line `src/i18n.js` into `src/i18n/translations.js` (static string data), `src/i18n/languages.js` (flag/name metadata), `src/i18n/detect.js` (pure browser language detection), `src/i18n/store.js` (runtime state + localStorage persistence), and `src/i18n/index.js` (public facade). `src/i18n.js` is now a 3-line backward-compat shim — all 14 existing importers are unchanged. Bumped to v1.31.4.
