Title: Disable runtime Entur debug panel by default

What I changed:
- Disabled the exposure of `window.__ENTUR_DEBUG_PANEL__` from the app bootstrap so the Entur client won't be given a debug callback by default.

Reasoning:
- Debugging snapshots were being attached to the page which can leak request/response details during normal use. The user requested to turn off debugging; this change keeps the debug panel code in place but does not wire it up automatically.

Notes:
- Debugging can be re-enabled later by assigning a callback to `window.__ENTUR_DEBUG_PANEL__` in the console or by adding a flag-controlled assignment.
