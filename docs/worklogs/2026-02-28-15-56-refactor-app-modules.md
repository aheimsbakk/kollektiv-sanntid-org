---
when: 2026-02-28T15:53:08Z
why: Split monolithic app.js into focused single-responsibility modules for maintainability
what: Refactor src/app.js into src/app/ directory with 7 focused modules + thin bootstrap
model: opencode/claude-sonnet-4-6
tags: [refactor, app, srp, modules]
---

Rewrote `src/app.js` (550 lines) as a ~110-line thin bootstrap and extracted its seven concerns into `src/app/`: `settings.js` (localStorage load/save, applyTextSize), `url-import.js` (shared-board URL decode), `render.js` (departure list rendering), `fetch-loop.js` (doRefresh, startRefreshLoop, tickCountdowns), `handlers.js` (station select, favorite toggle, apply settings, language change), `action-bar.js` (share/theme/settings buttons), and `sw-updater.js` (SW registration and update toast). Updated `src/sw.js` asset cache list and fixed `tests/sw.test.mjs` to locate `showUpdateNotification` in its new module. Bumped to v1.31.2.
