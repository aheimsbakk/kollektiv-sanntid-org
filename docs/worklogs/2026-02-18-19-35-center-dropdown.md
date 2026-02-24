---
when: 2026-02-18T19:35:31Z
why: Improve visual alignment and consistency with centered layout
what: Centered station dropdown menu horizontally relative to station name
model: github-copilot/claude-sonnet-4.5
tags: [css, ui, dropdown, v1.8.4]
---

Updated `.station-dropdown-menu` in `src/style.css` to center horizontally relative to the station name by changing `left: 0` to `left: 50%` and adding `transform: translateX(-50%)`. This aligns with the centered layout of the rest of the application and is more visually pleasing. Bumped version to 1.8.4.
