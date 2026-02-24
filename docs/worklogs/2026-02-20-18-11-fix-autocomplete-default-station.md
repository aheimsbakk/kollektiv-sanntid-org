---
when: 2026-02-20T18:11:05Z
why: Autocomplete not working when opening panel with default station
what: Reset lastQuery in updateFields to fix autocomplete on first keystroke
model: github-copilot/claude-sonnet-4.5
tags: [bugfix, autocomplete, options-panel, test]
---

Fixed bug where autocomplete wouldn't work when opening options panel with default "Jernbanetorget, Oslo" station. The lastQuery variable was persisting across panel sessions, preventing searches. Added lastQuery reset in updateFields() function (line 377) so autocomplete triggers correctly on first keystroke. Created comprehensive test suite (tests/options-autocomplete.test.mjs) with 5 test cases covering the workflow. Added test to test runner. Version bumped to 1.27.2.
