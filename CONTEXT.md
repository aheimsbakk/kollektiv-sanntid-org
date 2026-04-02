Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.40.19.

Current Goal: Stable mobile PWA experience with polished top-left toolbar layout.

Last 3 Changes:

- Delayed icon README docs (v1.40.17): updated README Live Departures section to document ◆ diamond as the delayed indicator; config.js delayed symbol updated from ⬦ to ◆
- Delayed indicator from config (v1.40.16): added `delayed` key to REALTIME_INDICATORS in config.js; departure.js now uses it instead of hardcoded realtime symbol for delayed trips
- OSM status click-to-dismiss (v1.40.15): removed 3-second auto-timeout; osmNoCoords message now stays until user clicks outside the OSM container

- Version bump to v1.40.19: synchronized src/config.js, src/sw.js, and package.json after local config.js update

Next Steps:

- No outstanding items — all H/M priority issues resolved
