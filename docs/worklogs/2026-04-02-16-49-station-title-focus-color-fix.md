---
when: 2026-04-02T16:49:01Z
why: Station title keyboard focus used --accent outline, inconsistent with every other interactive element which uses highlight-bg/fg tokens.
what: Align station title focus-visible style with site-wide highlight convention
model: github-copilot/claude-sonnet-4.6
tags: [css, accessibility, focus, consistency, bugfix]
---

Replaced `outline: 2px solid var(--accent)` with `background: var(--highlight-bg); color: var(--highlight-fg); outline: none` on `.station-title:focus-visible` in `src/css/header.css`, matching the pattern already used by `.station-dropdown-item`, `.station-autocomplete-list button`, and `.gps-dropdown-item`. Bumped to v1.40.21.
