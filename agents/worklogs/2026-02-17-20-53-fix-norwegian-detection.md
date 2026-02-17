---
when: 2026-02-17T20:53:51Z
why: Norwegian browser language detection was not working
what: Map nb/nn language codes to no for Norwegian detection
model: github-copilot/claude-sonnet-4.5
tags: [bugfix, i18n, language-detection]
---

Fixed Norwegian language detection by mapping browser language codes `nb` (Bokmål) and `nn` (Nynorsk) to `no` in `detectBrowserLanguage()` function in `src/i18n.js`. Most Norwegian users have `nb-NO` set in their browser, not `no`. Created `tests/i18n.test.mjs` to verify detection for all supported and unsupported languages. Bumped version to 1.4.2.
