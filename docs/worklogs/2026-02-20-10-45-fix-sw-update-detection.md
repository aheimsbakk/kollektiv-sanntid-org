---
when: 2026-02-20T10:45:48Z
why: Fix service worker update detection requiring hard reload
what: Add updateViaCache none and periodic update checks
model: github-copilot/claude-sonnet-4.5
tags: [service-worker,pwa,cache,bug-fix]
---

Service worker now registers with `updateViaCache: 'none'` to bypass HTTP cache for sw.js, and checks for updates every 60 seconds via `reg.update()`. This ensures users receive updates automatically without requiring hard reload. Version bumped to 1.16.1. Files: src/app.js (lines 141-143, 225-228).
