---
when: 2026-02-20T15:21:15Z
why: shared board settings were not persisting on fresh browsers
what: save shared settings to localStorage after URL decode
model: github-copilot/claude-sonnet-4.5
tags: [fix, share, persistence, localStorage]
---

Fixed bug where shared board URLs did not work correctly on fresh browsers. When opening a shared URL on a browser that had never accessed the app before, the settings would display correctly initially but revert to defaults (Jernbanetorget) after URL cleanup or page refresh. Root cause: shared settings were applied to DEFAULTS but not saved to localStorage. Added localStorage.setItem call immediately after applying decoded shared settings in src/app.js to ensure settings persist across page reloads.
