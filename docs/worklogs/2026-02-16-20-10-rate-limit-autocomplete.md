---
when: 2026-02-16T20:10:39Z
why: Debounce autocomplete queries to avoid overloading the geocoder backend
what: increase autocomplete debounce to 500ms and reset on each keypress
model: github-copilot/gpt-5-mini
tags: [ui,performance,autocomplete]
---

Increase the debounce window for station autocomplete to 500ms and ensure
the timer resets on every keypress so the geocoder is not queried for every
keystroke. Files: src/ui/options.js
