Title: Add runtime emoji detection debugging

What I will change:
- Add lightweight runtime debug capture when emoji detection falls back to the default. The debug captures a small signature of the parsed item (destination, parser-provided mode, transportMode, detectedMode, a few raw keys) and stores it on `window.__EMOJI_DEBUG__` for inspection.

Why:
- Fallback emoji is still observed; capturing minimal runtime diagnostics will show why detection fails on real responses without dumping entire payloads.

Files to be modified:
- src/ui/departure.js
- agent/CONTEXT.md

This worklog is created before the edits as required by AGENT.md.
