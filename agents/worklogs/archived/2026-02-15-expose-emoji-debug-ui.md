Title: Expose emoji detection debug UI for easier inspection

What I will change:
- Add a small persistent "🐞 Debug" button and a polling display that surfaces `window.__EMOJI_DEBUG__` contents in the app UI so developers can quickly inspect why emoji detection falls back.

Why:
- The user couldn't find the debug snapshots on `window`. A visible UI affordance makes diagnostics discoverable and avoids needing to open the console.

Files to be modified:
- src/app.js
- src/style.css
- agent/CONTEXT.md

This worklog is created before making the edits, per AGENT.md.
