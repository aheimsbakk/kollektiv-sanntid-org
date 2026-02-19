---
when: 2026-02-19T20:05:31Z
why: Use correct text shadow variables for each theme mode
what: Applied text-shadow-dark to departures/countdown for proper theme contrast
model: github-copilot/claude-sonnet-4.5
tags: [fix, theme, css, accessibility]
---

Updated `src/style.css` to use `--text-shadow-dark` on `.departure-destination`, `.departure-time`, and `.mode-icon` elements. Dark theme uses light/glowing shadow (white), light theme uses dark shadow (black). Both shadow variables now properly defined in both theme sections. Version bumped to 1.15.2.
