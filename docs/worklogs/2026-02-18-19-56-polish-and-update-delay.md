---
when: 2026-02-18T19:56:10Z
why: Add Polish language and improve update notification with countdown
what: Added Polish translations, 5-second countdown before reload, removed unused translations
model: github-copilot/claude-sonnet-4.5
tags: [i18n, polish, service-worker, update, cleanup]
---

Added Polish language (12 total languages now). Implemented 5-second countdown before auto-reload on service worker updates to give users time to see the notification. Removed unused 'reload' and 'dismiss' translations from all languages. Updated src/i18n.js and src/app.js. Bumped version to 1.9.0.
