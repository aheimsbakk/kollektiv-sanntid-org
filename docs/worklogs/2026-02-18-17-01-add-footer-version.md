---
when: 2026-02-18T17:01:31Z
why: Add version info and GitHub link for user transparency
what: Added footer with version and GitHub repository link
model: github-copilot/claude-sonnet-4.5
tags: [feature, ui, i18n, footer]
---

Added footer component showing "Version X.X.X. Star on GitHub" in lower left corner. Created VERSION constant in `src/config.js` alongside service worker version. Updated `scripts/bump-version.sh` to update both files. Added footer translations for all 8 languages in `src/i18n.js`. Footer updates when language changes via callback from options panel. Files modified: `src/ui/ui.js`, `src/app.js`, `src/ui/options.js`, `src/config.js`, `src/i18n.js`, `scripts/bump-version.sh`. Bumped version to 1.5.0.
