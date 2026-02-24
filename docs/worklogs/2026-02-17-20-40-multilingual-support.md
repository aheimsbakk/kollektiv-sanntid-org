---
when: 2026-02-17T20:40:33Z
why: Add multilingual support to make app accessible to international users
what: Implement i18n system with 8 language translations and flag-based switcher
model: github-copilot/claude-sonnet-4.5
tags: [feature, i18n, translation, accessibility, ux]
---

Created src/i18n.js with translation system supporting Norwegian, English, German, Spanish, Italian, Greek, Farsi, and Hindi. Auto-detects browser language with fallback to English. Added language switcher with flag buttons in options panel. Updated src/ui/options.js and src/app.js to use translations for all UI text. Station and departure names from API remain untranslated. Persists language choice in localStorage. Version bumped to 1.4.0.
