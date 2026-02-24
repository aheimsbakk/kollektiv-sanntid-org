---
when: 2026-02-20T13:20:34Z
why: Allow users to customize line number separator for personal preference
what: Make line number separator configurable in config.js
model: github-copilot/claude-sonnet-4.5
tags: [enhancement, config, customization]
---

Added LINE_NUMBER_SEPARATOR constant to src/config.js (default: ' · '). Updated src/ui/departure.js to import and use this configurable separator instead of hardcoded middot. Users can now easily customize to alternatives like ' - ', ' | ', or ' ' (space only) by editing config.js. Bumped version to 1.18.4.
