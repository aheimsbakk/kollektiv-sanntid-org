---
when: 2026-02-18T20:11:38Z
why: Improve update notification visibility and add version upgrade information
what: Fixed update toast styling, position, and visibility with version upgrade message
model: github-copilot/claude-sonnet-4.5
tags: [ui, service-worker, update, ux]
---

Fixed update notification to be visible for full 5 seconds with proper styling matching footer. Added dedicated CSS for #sw-update-toast in same position as footer. Hides footer version text during update display. Shows "Upgrading from x.x.x to x.x.x" message by fetching new version from waiting service worker. Updated src/app.js and src/style.css. Bumped version to 1.9.2.
