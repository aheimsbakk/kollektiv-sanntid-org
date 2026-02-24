---
when: 2026-02-20T16:56:49Z
why: Options panel was showing old text size value when reopened
what: Added TEXT_SIZE persistence to both onApply handlers in app.js
model: github-copilot/claude-sonnet-4.5
tags: [bugfix, options-panel, text-size, persistence]
---

Fixed bug where text size changes were applied to CSS but not saved to DEFAULTS object. Added `DEFAULTS.TEXT_SIZE = newOpts.TEXT_SIZE` to both the inline onApply handler (line 335) and the stored onApply handler (line 379) in src/app.js. This ensures the options panel shows the current text size value when reopened, not the old value. Version bumped to 1.25.1.
