Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.33.2.

Current Goal: Maintain and extend the production app; codebase refactored for rules compliance.

Last 3 Changes:
- src/entur/parser.js — pickLocalised() helper; parseEnturResponse(json, lang) picks situation text by UI lang → en → first
- src/entur/departures.js — fetchDepartures accepts lang option, forwards to parser
- src/app/fetch-loop.js — passes getLanguage() as lang to fetchDepartures

Next Steps:
- Monitor deploy workflows after fixes go live
- Await user feedback or new feature requests
