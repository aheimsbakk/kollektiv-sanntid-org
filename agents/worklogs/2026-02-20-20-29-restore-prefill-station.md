---
when: 2026-02-20T20:29:31Z
why: restore pre-fill station name feature for better UX
what: options panel now pre-fills and selects station name on focus
model: github-copilot/claude-sonnet-4.5
tags: [feature, ux, options, station, v1.29.0]
---

Restored the feature where the station input field pre-fills with the current station name and selects it on focus. This provides better visual context for users while still allowing them to immediately start typing to search for a different station. Previously removed during bug investigation, now safe to restore after fixing the service worker cache bug. Version bumped to 1.29.0.
