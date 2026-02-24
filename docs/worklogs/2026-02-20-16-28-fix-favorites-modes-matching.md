---
when: 2026-02-20T16:28:36Z
why: modesEqual function was missing, causing favorites save/update to fail
what: Add modesEqual function and comprehensive tests for station+modes matching logic
model: github-copilot/claude-sonnet-4.5
tags: [bugfix, favorites, testing]
---

Fixed missing modesEqual function in station-dropdown.js that prevented proper matching of station+mode combinations. Added 12 new unit tests covering FIFO behavior, mode matching, and edge cases.
