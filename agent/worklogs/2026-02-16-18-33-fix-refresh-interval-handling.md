---
when: 2026-02-16T18:33:26Z
why: Ensure countdown and refresh loop honor updated FETCH_INTERVAL from options
what: centralize refresh logic, restart interval when FETCH_INTERVAL changes
model: github-copilot/gpt-5-mini
tags: [ui,bugfix,refresh]
---

Centralized the periodic refresh into `doRefresh` and `startRefreshLoop` in `src/app.js`. The options panel now restarts the refresh loop after applying new settings so `Next update in XX seconds.` uses the updated `FETCH_INTERVAL` and the timer fires at the expected cadence.
