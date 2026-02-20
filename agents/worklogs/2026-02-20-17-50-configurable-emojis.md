---
when: 2026-02-20T17:50:56Z
why: Make all emojis configurable for easier customization
what: Centralized emoji configuration in config.js
model: github-copilot/claude-sonnet-4.5
tags: [feature, config, emojis, customization, refactor]
---

Made all emojis used throughout the app configurable in config.js. Added two new exports: TRANSPORT_MODE_EMOJIS (bus, tram, metro, rail, water, coach, default) and UI_EMOJIS (settings, share, shareSuccess, themeLight, themeAuto, themeDark). Updated 6 files to import and use these constants: app.js, departure.js, options.js, station-dropdown.js, share-button.js, theme-toggle.js. This makes it easy to customize all emojis from a single location. Version bumped to 1.27.0.
