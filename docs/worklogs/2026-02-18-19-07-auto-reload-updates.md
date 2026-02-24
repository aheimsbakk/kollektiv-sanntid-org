---
when: 2026-02-18T19:07:37Z
why: Improve user experience with seamless automatic updates
what: Changed service worker update flow to auto-reload on new version
model: github-copilot/claude-sonnet-4.5
tags: [service-worker, ux, auto-update, v1.8.0]
---

Modified service worker update mechanism to automatically reload the page when a new version is detected, instead of prompting the user with Reload/Dismiss buttons. Updated `src/app.js` to immediately call `skipWaiting()` on the new service worker and simplified the toast to show only an informational message. Updated all 11 language translations for `newVersionAvailable` to include "reloading..." text. Users now get seamless updates without manual intervention. Bumped version to 1.8.0.
