---
when: 2026-02-20T10:53:40Z
why: Improve tooltip clarity and add station field tooltip
what: Add natural language tooltips with i18n support
model: github-copilot/claude-sonnet-4.5
tags: [ui,i18n,tooltips,accessibility]
---

Added tooltips for station name field, settings button, and theme toggle using natural language translations across all 12 languages. Removed parentheses from theme tooltip for cleaner presentation. Version bumped to 1.16.1. Files: src/i18n.js (all languages), src/ui/options.js:15, src/ui/theme-toggle.js:1,69,76, src/app.js:346.
