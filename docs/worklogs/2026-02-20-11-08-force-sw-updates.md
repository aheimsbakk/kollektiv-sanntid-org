---
when: 2026-02-20T11:08:29Z
why: Force service worker updates to bypass HTTP cache
what: Add updateViaCache none option and periodic update checks
model: github-copilot/claude-sonnet-4.5
tags: [service-worker,cache,deployment]
---

Force service worker to bypass HTTP cache when checking for updates by adding updateViaCache none option to registration. Also added immediate update check on load and periodic checks every 60 seconds. This ensures PR previews and production deployments always detect new versions even when GitHub Pages caches files. Version bumped to 1.16.4. Files: src/app.js:141-147.
