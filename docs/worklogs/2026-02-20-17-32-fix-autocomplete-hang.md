---
when: 2026-02-20T17:32:01Z
why: Autocomplete was hanging on current station name when user started typing
what: Clear lastQuery on focus and improve blur auto-selection logic
model: github-copilot/claude-sonnet-4.5
tags: [bugfix, autocomplete, options-panel, ux]
---

Fixed autocomplete hanging issue in options panel station input. The problem was that `lastQuery` variable prevented re-searching if user typed the same text as before. Now clears `lastQuery` on focus (line 351) so typing always triggers new search. Also improved blur behavior to only auto-select first result if user was actually typing (no stopId set), preventing re-selection of current station (line 504). Modified src/ui/options.js. Version bumped to 1.25.4.
