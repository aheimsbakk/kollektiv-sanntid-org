---
when: 2026-02-20T19:44:53Z
why: input events during updateFields() may interfere with autocomplete
what: add updatingFields flag to ignore programmatic input events
model: github-copilot/claude-sonnet-4.5
tags: [autocomplete, bug-fix, input-event, updateFields]
---

Added updatingFields flag to prevent input event handler from running during programmatic field updates. Browser autofill or other mechanisms may trigger input events when updateFields() sets values, interfering with lastQuery state. Now input handler returns early if updatingFields is true. Created test in autocomplete-first-load.test.mjs that verifies fix works correctly. Version 1.27.8.
