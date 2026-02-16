---
when: 2026-02-16T19:56:22Z
why: Retry hiding autocomplete dropdown using CSS class-based show/hide
what: default-hide autocomplete via CSS and toggle `.open` class in JS
model: github-copilot/gpt-5-mini
tags: [ui,css,autocomplete,accessibility]
---

Retry to hide the station autocomplete by ensuring the list is hidden by
default in CSS and only visible when the `.open` class is present. Update JS
to toggle `.open` instead of relying on the `hidden` attribute which earlier
did not produce the expected result in some environments.
