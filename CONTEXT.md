Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.40.15.

Current Goal: Stable mobile PWA experience with polished top-left toolbar layout.

Last 3 Changes:

- OSM status click-to-dismiss (v1.40.15): removed 3-second auto-timeout; osmNoCoords message now stays until user clicks outside the OSM container
- Toolbar layout refactor (v1.40.14): moved share button into top-left gps-bar (right of compass); map button below compass via .gps-bar\_\_col column wrapper; removed .share-bar entirely; updated README with OSM button docs
- Fix OSM status thin-column collapse (v1.40.13): added width:max-content + min-width:160px to .osm-status so error text renders as a proper box, not a single-character column

Next Steps:

- No outstanding items — all H/M priority issues resolved
