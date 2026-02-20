---
when: 2026-02-20T11:55:18Z
why: Show line identifiers alongside destinations for better user orientation
what: Add publicCode (line number) display to departure board
model: github-copilot/claude-sonnet-4.5
tags: [feature, ui, entur-api]
---

Implemented line number display in format "{publicCode} {destination} {icon}" (e.g., "L2 Ski 🚅", "81 Myrvoll stasjon 🚌"). Modified src/entur.js to extract publicCode from API response and added it to parsed departure objects. Updated src/ui/departure.js to render line numbers before destinations with graceful fallback when missing. Updated README to document feature. Bumped version to 1.17.0.
