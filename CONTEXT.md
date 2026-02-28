Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.33.0.

Current Goal: Maintain and extend the production app; codebase refactored for rules compliance.

Last 3 Changes:
- src/app.js — load favorites early and apply first favorite to DEFAULTS so heart button shows correct state
- src/ui/share-button.js — simplified share link to encode only [name, stopId, modes]; added backward compat for 7-element legacy format
- src/config.js + src/ui/station-dropdown.js — added DEFAULT_FAVORITE config; auto-import default when no favorites exist

Next Steps:
- Monitor deploy workflows after fixes go live
- Await user feedback or new feature requests
