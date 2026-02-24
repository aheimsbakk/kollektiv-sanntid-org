---
when: 2026-02-19T18:39:05Z
why: Remove technical debug message when 0 departures, use existing "No departures..." UI
what: Remove debug panel display logic showing technical fetch diagnostics
model: github-copilot/claude-sonnet-4.5
tags: [ui,debug,cleanup]
---

Removed debug panel logic that displayed technical message "Live fetch succeeded but returned 0 departures..." when API returns empty results. The existing empty state already shows user-friendly "No departures..." message. Version bumped to 1.13.1. File: src/app.js.
