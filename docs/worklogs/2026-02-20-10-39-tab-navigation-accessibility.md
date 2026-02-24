---
when: 2026-02-20T10:39:42Z
why: Fix tab navigation to skip hidden options panel elements
what: Add inert attribute to options panel when closed
model: github-copilot/claude-sonnet-4.5
tags: [accessibility,ui,keyboard-navigation]
---

Options panel now uses the `inert` attribute to remove hidden panel elements from tab order when closed. Tab navigation flows through station dropdown → theme toggle → gear button → GitHub link only. Version bumped to 1.16.0. Files: src/ui/options.js (lines 7, 538, 558).
