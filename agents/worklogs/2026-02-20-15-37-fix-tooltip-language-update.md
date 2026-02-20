---
when: 2026-02-20T15:37:26Z
why: button tooltips were not updating when language changed
what: add tooltip update logic to language change handler
model: github-copilot/claude-sonnet-4.5
tags: [fix, i18n, tooltips, ui]
---

Fixed bug where share button, theme toggle, and settings gear tooltips remained in the original language when user changed the language setting. Added global button references storage in window.__GLOBAL_BUTTONS__ and updated language change handler in src/app.js to refresh all tooltip text using t() function when language changes. Tooltips now correctly update to match selected language.
