---
when: 2026-02-15T19:25:00Z
why: Make the web app installable as a PWA in Chrome
what: add web manifest, icons, and a basic service worker; register SW in app startup
model: github-copilot/gpt-5-mini
tags: [pwa,manifest,service-worker,worklog]
---

Add a minimal web manifest and two vector icons, plus a simple service worker that caches core assets. Register the service worker during app initialization so the site becomes installable in Chrome. Files: src/manifest.webmanifest, src/sw.js, src/icons/icon-192.svg, src/icons/icon-512.svg, src/index.html, src/app.js
