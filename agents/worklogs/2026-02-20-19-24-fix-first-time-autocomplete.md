---
when: 2026-02-20T19:24:46Z
why: clearing input on focus broke first-time autocomplete with default station
what: only clear input if stopId exists, otherwise select text for editing
model: github-copilot/claude-sonnet-4.5
tags: [autocomplete, regression-fix, options-panel]
---

Fixed regression where autocomplete stopped working on first use with default station. Previous fix cleared input unconditionally on focus, preventing users from editing default station name. Changed to only clear input if stopId exists (meaning user previously selected from autocomplete), otherwise just select text for editing. This preserves both behaviors: fresh search after selection (fixes mobile) and editable default value on first use. Version 1.27.6.
