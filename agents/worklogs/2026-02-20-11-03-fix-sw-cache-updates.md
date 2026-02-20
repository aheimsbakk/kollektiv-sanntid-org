---
when: 2026-02-20T11:03:24Z
why: Fix service worker cache invalidation on updates
what: Improve cache matching and force hard reload on SW updates
model: github-copilot/claude-sonnet-4.5
tags: [service-worker,cache,fix]
---

Fixed service worker update issues by adding cache matching with ignoreSearch option and forcing hard reload with timestamp query parameter to bypass browser cache. This ensures users always get the latest version of all assets after service worker updates. Version bumped to 1.16.3. Files: src/sw.js:68-72, src/app.js:219.
