Title: Verify and log raw payloads when emoji detection fails

What I will change:
- Add a one-time diagnostic log in `src/ui/departure.js` to capture a compact signature of the `raw` payload when the mode detection returns no match.
- This helps confirm why detection returns null in real responses and guides a fix.

Per AGENT.md this worklog is created before code edits.
