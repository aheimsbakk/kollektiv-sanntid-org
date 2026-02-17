---
when: 2026-02-17T20:49:41Z
why: Language switcher required page reload to update UI text
what: Added updateTranslations() function for instant UI updates
model: github-copilot/claude-sonnet-4.5
tags: [bugfix, i18n, ui]
---

Fixed language switcher bug by adding `updateTranslations()` function in `src/ui/options.js` that updates all translatable DOM elements (labels, buttons, dropdown options) when language is changed. This eliminates the need for page reload. Bumped version to 1.4.1.
