Current Goal: Implement dependency-free pure JS+CSS departure board, add Node-local tests, and enable interactive options + diagnostics.

Last 3 Changes:
- agent/worklogs/2026-02-15-02-05-remove-header-gear-and-toggle.md
- agent/worklogs/2026-02-15-01-55-place-gear-top-right-and-worklog.md
- agent/worklogs/2026-02-15-01-25-ensure-options-overlay-css.md

Next Steps:
- Persist settings to localStorage and add keyboard/ESC to close options (done).
- Add focus trap and small DOM accessibility improvements (done).

Recent UI tweak: moved status chip below station title so "Live"/"Demo" appears under the station name.

Options panel behavior: pressing Enter in text/number fields now applies settings immediately without closing the panel; toggling transport mode checkboxes and changing text size select also apply immediately.

UX tweak: small toast is shown when settings are applied; transport-mode checkbox changes are debounced (500ms) to avoid rapid network refreshes.
