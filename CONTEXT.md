Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.40.16.

Current Goal: Stable mobile PWA experience with polished top-left toolbar layout.

Last 3 Changes:

- Delayed indicator from config (v1.40.16): added `delayed` key to REALTIME_INDICATORS in config.js; departure.js now uses it instead of hardcoded realtime symbol for delayed trips
- OSM status click-to-dismiss (v1.40.15): removed 3-second auto-timeout; osmNoCoords message now stays until user clicks outside the OSM container
- Toolbar layout refactor (v1.40.14): moved share button into top-left gps-bar (right of compass); map button below compass via .gps-bar\_\_col column wrapper; removed .share-bar entirely

Next Steps:

- No outstanding items — all H/M priority issues resolved
