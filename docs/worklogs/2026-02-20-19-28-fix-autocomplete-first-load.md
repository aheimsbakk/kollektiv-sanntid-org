---
when: 2026-02-20T19:28:53Z
why: autocomplete broken on first app load with default station
what: only clear input on focus if stopId exists, otherwise select text
model: github-copilot/claude-sonnet-4.5
tags: [autocomplete, bug-fix, regression, first-run]
---

Fixed regression where autocomplete didn't work on first app load with default station "Jernbanetorget". Previous fix cleared input on every focus, which broke first-run scenario where user hasn't selected a station yet. Now only clears input if stopId exists (meaning user previously selected a station), otherwise just selects text for easy editing. This maintains mobile fix while allowing autocomplete to work on fresh app load. Version 1.27.6.
