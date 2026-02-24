---
when: 2026-02-18T18:12:35Z
why: Prepare CSS for dark/light mode by consolidating styles and enforcing design constraints
what: Refactored CSS with max 10% transparency, white text, light gray shadows on select elements
model: github-copilot/claude-sonnet-4.5
tags: [css, refactor, styling, preparation, darkmode]
---

## CSS Cleanup and Consolidation (v1.6.2)

Refactored `src/style.css` with new design constraints: max 10% transparency for all overlays (min 0.9 opacity), white text as primary color except for departure destination/situations which keep original colors, light gray shadows only on destination text, icons, and countdown timers. Moved inline styles from JS files to CSS classes (status-chip.visible, station-dropdown-menu.open, options-toast.visible). Updated CSS variables from --fg/--fg-dim to --text-primary/--text-secondary. Changed overlay variables from --overlay-weak/--overlay-shadow-color to --overlay-medium/--overlay-strong with proper opacity limits. Removed redundant shadow variables. Updated all color references across `src/ui/ui.js`, `src/ui/options.js`, `src/ui/station-dropdown.js`, and `src/app.js` to use CSS classes instead of inline styles.
