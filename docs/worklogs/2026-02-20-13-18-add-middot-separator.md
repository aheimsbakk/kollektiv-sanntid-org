---
when: 2026-02-20T13:18:44Z
why: Improve visual separation between line number and destination
what: Add middot separator between line number and destination
model: github-copilot/claude-sonnet-4.5
tags: [enhancement, ui, line-display]
---

Added middot (·) separator between line number and destination in src/ui/departure.js. Display format is now "L2 · Ski 🚅" instead of "L2 Ski 🚅" for better visual distinction between the line code and destination name. Bumped version to 1.18.3.
