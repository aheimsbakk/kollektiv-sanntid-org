---
when: 2026-02-28T20:35:58Z
why: Add Entur data attribution to the footer as required by data provider guidelines
what: Add translated "Data from Entur 🔗" line above version in footer
model: opencode/claude-sonnet-4-6
tags: [footer, i18n, attribution, ui]
---

Added a new first line to the app footer: "{dataFrom} Entur 🔗" linking to https://data.entur.no/, with `dataFrom` translated across all 12 supported languages. The footer CSS was updated to a flex-column layout with a small gap between lines. `updateFooterTranslations()` in `src/ui/ui.js` was updated to target the new `.footer-data-line` / `.footer-version-line` class structure. Bumped to v1.33.1.
