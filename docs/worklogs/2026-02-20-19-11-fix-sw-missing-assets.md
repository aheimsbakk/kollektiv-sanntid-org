---
when: 2026-02-20T19:11:51Z
why: service worker cache missing icons.css and ui/share-button.js
what: add missing files to ASSETS array in service worker
model: github-copilot/claude-sonnet-4.5
tags: [service-worker, cache, bug-fix]
---

Fixed service worker cache missing two critical files: icons.css and ui/share-button.js. These files were not in the ASSETS array, so they were never cached by the service worker and could serve stale versions from HTTP cache even after version updates. Added both files to ASSETS array to ensure they're properly cached and updated with each service worker version. This ensures share button functionality and icon styles always stay in sync with the app version. Bumped version to 1.27.5.
