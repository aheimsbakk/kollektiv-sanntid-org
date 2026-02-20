---
when: 2026-02-19T18:51:04Z
why: Make station dropdown width dynamic to fit longest station name with icons
what: Remove min-width and max-width constraints from station dropdown menu
model: github-copilot/claude-sonnet-4.5
tags: [ui,css,dropdown,responsive]
---

Removed min-width (250px) and max-width (400px) constraints from station dropdown menu. Dropdown now dynamically sizes to fit the longest station name including transport mode icons using width: max-content. Version bumped to 1.14.1. File: src/style.css.
