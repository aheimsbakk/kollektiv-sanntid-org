---
when: 2026-04-02T16:37:56Z
why: Remove disruptive tap highlight and mouse-click focus ring on mobile while preserving keyboard accessibility on desktop.
what: Optimize station title focus interaction design for touch and keyboard across devices
model: github-copilot/claude-sonnet-4.6
tags: [css, accessibility, pwa, mobile, focus, interaction]
---

Updated `.station-title` in `src/css/header.css` with three targeted CSS rules: `-webkit-tap-highlight-color: transparent` suppresses the iOS/WebKit tap flash; `:focus { outline: none }` removes the default focus ring for mouse/touch events; `:focus-visible { outline: 2px solid var(--accent) }` restores a themed keyboard-navigation ring exclusively for Tab-key focus. Bumped to v1.40.20.
