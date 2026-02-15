Title: Add raw response dump action to debug panel

What I will change:
- Add a "Dump raw response" button to the emoji debug panel which will perform a direct GraphQL POST to the Entur API for the current stop and display the full JSON response (or error text).

Why:
- Current parsed items do not include a transport mode. Dumping the raw server response will show what fields are actually present so we can decide which GraphQL selection to request.

Files to be modified:
- src/app.js
- agent/CONTEXT.md

This worklog is created prior to edits per AGENT.md.
