Title: Move status under station and preserve centered header

What I changed:
- Moved the status chip (Live/Demo) to sit under the station title in the header.
- Kept the station title centered and positioned header controls (gear) absolutely at the right so they do not affect centering.

Files modified:
- src/ui/ui.js
- src/app.js
- src/style.css
- agent/CONTEXT.md

Reasoning:
- The previous change accidentally caused the station title and status to be left-aligned; positioning controls absolutely maintains the original centered layout while placing controls top-right.

Follow-up:
- Verified CSS rules to center `.header-left` and create `.header-right` absolute container. If requested, will add color styling to the status chip (green for Live / gray for Demo).
