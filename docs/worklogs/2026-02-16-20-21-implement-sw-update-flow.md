---
when: 2026-02-16T20:22:05Z
why: implement a user-visible service worker update flow to avoid stale cache issues
what: add update-prompt registration logic in src/app.js and show in-app reload toast
model: github-copilot/gpt-5-mini
tags: [pwa,service-worker,ux]
---

Add a non-blocking in-app prompt that appears when a new service worker is installed and waiting. The prompt allows the user to reload immediately (sends SKIP_WAITING) or dismiss. Files changed: src/app.js. No tests required. 
