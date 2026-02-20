---
when: 2026-02-20T23:00:48Z
why: use transport mode from API instead of publicCode format for platform symbols
what: refactor PLATFORM_SYMBOLS to map by transport mode and update departure.js logic
model: github-copilot/claude-sonnet-4.5
tags: [platform, symbols, bus, api, refactor]
---

Changed platform symbol selection to use transport mode from API instead of guessing from publicCode format. This fixes symbol display for alphanumeric bus platforms like "B10" at Oslo bussterminal.
