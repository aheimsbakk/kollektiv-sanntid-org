---
when: 2026-02-20T16:18:47Z
why: Save to favorites stopped working after changing language in settings panel
what: Preserve onSave handler when recreating options panel after language change
model: github-copilot/claude-sonnet-4.5
tags: [bugfix, favorites, i18n]
---

Fixed bug where Save button stopped working after language change by preserving both _onApply and _onSave handlers before Object.assign in app.js:300-310.
