---
when: 2026-02-20T17:58:31Z
why: Missing translation for "to" in update notification message
what: Added "to" translation key to all 12 languages
model: github-copilot/claude-sonnet-4.5
tags: [bugfix, i18n, translations]
---

Fixed missing translation in service worker update notification. The word "to" between version numbers was hardcoded in English. Added translation key "to" to all 12 languages (en, no, de, es, it, el, fa, hi, is, uk, fr, pl) with appropriate translations. Updated app.js line 245 to use t('to') instead of hardcoded "to". Version bumped to 1.27.1.
