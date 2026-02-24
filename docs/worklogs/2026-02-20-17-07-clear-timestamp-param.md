---
when: 2026-02-20T17:07:56Z
why: Clean up cache-busting timestamp parameter after SW update reload
what: Clear ?t= URL parameter after service worker update completes
model: github-copilot/claude-sonnet-4.5
tags: [bugfix, service-worker, url-cleanup]
---

Added cleanup for the ?t= timestamp parameter that is added during service worker updates. When the app reloads with ?t= for cache-busting, it now clears this parameter immediately on startup using `window.history.replaceState()`. This keeps the URL clean after updates complete. Modified src/app.js lines 63-66. Version bumped to 1.25.3.
