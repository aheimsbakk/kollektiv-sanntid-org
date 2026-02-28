---
when: 2026-02-28T17:57:31Z
why: Service worker reload after update served stale cached assets due to ignoreSearch bypassing cache-bust and controllerchange firing before activate completed
what: Fix SW update flow so reload only happens after old caches are fully cleared
model: opencode/claude-sonnet-4-6
tags: [bugfix, service-worker, pwa, cache]
---

Fixed two compounding bugs in the SW update flow: removed `ignoreSearch: true` from the cache-first fetch handler (which was silently defeating the `?t=` cache-bust on reload), and replaced the `controllerchange` reload trigger with a `SW_ACTIVATED` message posted by the SW after `clients.claim()` completes — guaranteeing the reload only happens once old caches are deleted. Bumped to v1.31.6. Files touched: `src/sw.js`, `src/app/sw-updater.js`.
