---
when: 2026-02-18T16:51:09Z
why: Duplicate refresh intervals caused countdown to reset unpredictably
what: Removed duplicate setInterval refresh loop in app.js
model: github-copilot/claude-sonnet-4.5
tags: [bugfix, refresh, countdown]
---

Fixed countdown reset issue by removing duplicate refresh loop in `src/app.js` (lines 319-345). The app had two separate setInterval timers both updating `nextRefreshAt` variable, causing the countdown to reset before reaching zero. Now uses only the proper `startRefreshLoop()` and `doRefresh()` functions. Bumped version to 1.4.7.
