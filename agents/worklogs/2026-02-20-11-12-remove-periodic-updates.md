---
when: 2026-02-20T11:12:06Z
why: Remove aggressive periodic update checks to respect user control
what: Keep only immediate update check on page load
model: github-copilot/claude-sonnet-4.5
tags: [service-worker,ux]
---

Removed periodic 60-second update checks that forced updates on users. Now only checks for updates when user reloads the page, giving them control over when to update. The updateViaCache none setting still ensures fresh detection on reload. Version bumped to 1.16.5. Files: src/app.js:142-143.
