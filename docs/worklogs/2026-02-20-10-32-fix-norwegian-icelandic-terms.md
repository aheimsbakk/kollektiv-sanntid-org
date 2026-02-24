---
when: 2026-02-20T10:32:51Z
why: Use correct Norwegian and Icelandic transit terminology
what: Updated Norwegian and Icelandic translations for transit stops
model: github-copilot/claude-sonnet-4.5
tags: [fix, i18n, terminology, accuracy]
---

Updated Norwegian translation from "stoppnavn" to "holdeplassnavn" (correct term for transit stop) and Icelandic from "stoppistöðvar" to "biðstöðvar" (proper term for stop/station) in `src/i18n.js`. Reviewed all other language translations - they already use correct transit terminology. Version bumped to 1.15.9.
