Title: Add "Capture now" action to emoji debug panel

What I will change:
- Enhance the emoji debug UI to include a "Capture now" control that triggers an immediate live fetch and captures parsed departure snapshots into `window.__EMOJI_DEBUG__` for easy inspection.

Why:
- Users reported no snapshots in the debug panel because it only recorded failed detections during normal renders. A manual capture lets developers force a snapshot even when detection doesn't fail.

Files to be modified:
- src/app.js
- agent/CONTEXT.md

This worklog is created before the edits per AGENT.md.
