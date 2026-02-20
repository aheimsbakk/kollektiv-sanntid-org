---
when: 2026-02-20T19:01:36Z
why: autocomplete searches stuck using first search query on subsequent searches
what: clear input value on focus instead of using select() for mobile compatibility
model: github-copilot/claude-sonnet-4.5
tags: [autocomplete, bug-fix, mobile, options-panel]
---

Fixed autocomplete bug where subsequent searches would use the first search query regardless of what user typed. Issue occurred on mobile browsers where `select()` doesn't work well - when text was selected and user started typing, the input value didn't update properly, causing searches to use old station name. Changed focus handler from `select()` to completely clear input value, stopId, lastQuery, and autocomplete state. This forces fresh search on every focus, which is better UX. Bumped version to 1.27.4.
