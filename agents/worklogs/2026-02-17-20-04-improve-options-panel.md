---
when: 2026-02-17T20:04:35Z
why: Improve options panel UX with better timing and clearer labels
what: Update options panel autocomplete delay, fetch interval minimum, and text size labels
model: github-copilot/claude-sonnet-4.5
tags: [enhancement, ui, options, ux]
---

Modified src/ui/options.js to lower autocomplete delay from 500ms to 250ms for faster responses, set fetch interval minimum to 20 seconds, capitalize all text size labels (Tiny, Small, Medium, Large), and change 'xlarge' to 'Extra large' for clarity. Version bumped to 1.1.0.
