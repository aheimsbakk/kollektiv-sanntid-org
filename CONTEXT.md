Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.40.14.

Current Goal: Stable mobile PWA experience with polished top-left toolbar layout.

Last 3 Changes:

- Toolbar layout refactor (v1.40.14): moved share button into top-left gps-bar (right of compass); map button below compass via .gps-bar\_\_col column wrapper; removed .share-bar entirely; updated README with OSM button docs
- Fix OSM status thin-column collapse (v1.40.13): added width:max-content + min-width:160px to .osm-status so error text renders as a proper box, not a single-character column
- Fix GPS/OSM status box overflow (v1.40.12): added max-width: calc(100vw - 36px) to .gps-dropdown-menu and .osm-status; status text now wraps instead of overflowing screen

Next Steps:

- No outstanding items — all H/M priority issues resolved
