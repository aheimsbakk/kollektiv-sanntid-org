---
when: 2026-02-18T20:06:00Z
why: Prevent unnecessary updates when input fields haven't changed
what: Added change detection to options panel before applying/saving settings
model: github-copilot/claude-sonnet-4.5
tags: [ui, options, performance, optimization]
---

Modified options panel to track initial values when opened and only call onApply/save to localStorage when values actually change. Prevents unnecessary data fetches and saves when user focuses/blurs inputs without making changes. Updated src/ui/options.js. Bumped version to 1.9.1.
