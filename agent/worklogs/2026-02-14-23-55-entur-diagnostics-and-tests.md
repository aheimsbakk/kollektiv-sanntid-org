---
when: 2026-02-14T23:55:00Z
why: add diagnostics when Entur returns no departures and add unit test for empty GraphQL responses
what: log a concise diagnostic when fetchDepartures parses zero departures and add `tests/entur.empty.test.mjs`.
model: github-copilot/gpt-5-mini
tags: [tests, debug, entur]
---

Added a small diagnostic log in `fetchDepartures` to print a compact summary when Entur returns no departures and added `tests/entur.empty.test.mjs` to cover empty-response behavior.
