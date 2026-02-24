---
when: 2026-02-19T18:31:58Z
why: Separate immediate updates from save-to-favorites action for better UX
what: Split options panel logic - immediate updates on change, Save button only adds to favorites
model: github-copilot/claude-sonnet-4.5
tags: [ui,ux,options-panel,favorites,refactor]
---

Refactored options panel to apply changes immediately (station, modes, text size, intervals) while Save button only adds current station+modes to favorites dropdown. Split `applyChanges()` and `saveToFavorites()` functions, added `onSave` callback parameter to `createOptionsPanel()`, updated button translations to "Save" in all 12 languages. Version bumped to 1.13.0. Files: src/ui/options.js, src/app.js, src/i18n.js, src/config.js, src/sw.js.
