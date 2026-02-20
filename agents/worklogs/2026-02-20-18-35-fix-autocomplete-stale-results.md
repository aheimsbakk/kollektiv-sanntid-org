---
when: 2026-02-20T18:35:39Z
why: autocomplete auto-selecting wrong station from stale candidate list
what: clear lastCandidates when starting new search to prevent stale auto-selection
model: github-copilot/claude-sonnet-4.5
tags: [autocomplete, bug-fix, options-panel, race-condition]
---

Fixed critical autocomplete bug where typing new station name and tabbing quickly would auto-select from old search results instead of new query. Issue occurred when user typed within 250ms debounce window and blurred - old lastCandidates array persisted causing wrong station selection (e.g., "Berlin ZOB" appearing when searching "Jernbanetorget"). Fixed by: (1) calling clearAutocomplete() in updateFields() to clear state across panel sessions, (2) clearing lastCandidates immediately when starting new search (>=3 chars) to prevent blur handler from auto-selecting stale results. Bumped version to 1.27.3.
