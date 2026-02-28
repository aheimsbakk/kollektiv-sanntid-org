Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.31.5.

Current Goal: Maintain and extend the production app; codebase refactored for rules compliance.

Last 3 Changes:
- src/sw.js — added missing i18n/ module paths to ASSETS cache list; fixes offline after i18n refactor (v1.31.5)
- src/i18n/ — split i18n.js into 5 focused modules (translations, languages, detect, store, index); src/i18n.js is now a shim (v1.31.4)
- docs/worklogs/2026-02-28-17-05-refactor-options-modules.md — split options.js into src/ui/options/ modules (v1.31.3)

Next Steps:
- Monitor deploy workflows after fixes go live
- Await user feedback or new feature requests
