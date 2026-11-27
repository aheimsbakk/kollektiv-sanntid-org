---
topic: 'Codebase audit findings v1.42.0'
importance: medium
category: warning
tags: [audit, rule-violations, timeouts, file-size, dead-code]
created: 2026-11-27T19:18:05Z
model: kompis/qwen3.8-flash-next-iq3_s
expires: 2027-05-27T00:00:00Z
---

Audit at v1.42.0 (2026-11-27) — fixed in the same session: network timeouts on
all Entur fetches (`NETWORK_TIMEOUT_MS`), doRefresh generation guard, unified
settings validation in `src/app/settings.js` (bounds: departures 1–50, interval
20–600), url-import language via `setLanguage`, dead exports removed
(`computeDiff`, `findKey`, `CANCELLATION_WRAPPER`), `ci.yml`, and
`tests/sw-assets-sync.test.mjs`. Still open: `station-dropdown.js` (415 lines),
`scroll-more.js` (339), and `station-autocomplete.js` (315) exceed the 300-line
cap and need splitting (tracked in todo.txt).
