---
when: 2026-04-02T16:54:12Z
why: highlight-bg/fg tokens caused full element inversion on focus since station-title has no padding, not a ring.
what: Fix station title focus-visible to render a non-inverting outline ring in both themes
model: github-copilot/claude-sonnet-4.6
tags: [css, accessibility, focus, bugfix]
---

Replaced `background/color` highlight tokens with `outline: 2px solid currentColor; outline-offset: 3px` on `.station-title:focus-visible` in `src/css/header.css`. Using `currentColor` inherits `--text-primary` automatically, rendering black in light mode and white in dark mode without inverting the element. Bumped to v1.40.22.
