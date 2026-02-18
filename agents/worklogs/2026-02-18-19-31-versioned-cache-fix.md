---
when: 2026-02-18T19:31:11Z
why: Ensure CSS updates are properly cached and invalidated on version changes
what: Fixed service worker to use versioned cache for all requests
model: github-copilot/claude-sonnet-4.5
tags: [service-worker, cache, css, fix, v1.8.3]
---

Modified service worker fetch handler in `src/sw.js` to explicitly use version-specific cache (CACHE_NAME) instead of searching all caches. This ensures CSS and other assets are properly invalidated when the service worker version changes. Changed from `caches.match(req)` (which searches all caches) to `cache.match(req)` (which searches only the current versioned cache). Added test to verify versioned cache usage. Updated fetch handler to also cache network responses for future offline use. Bumped version to 1.8.3.
