c76deab 2026-02-21 fix: added .gitignore
55c89c0 2026-02-21 Merge pull request #19 from aheimsbakk/rename
0edf6e0 2026-02-21 refactor: remove URL update when sharing boards
5d6c11f 2026-02-21 Merge pull request #18 from aheimsbakk/rename
9611fef 2026-02-21 fix: url for repo
5d870cc 2026-02-21 feat: add configurable GitHub URL in footer
d679b25 2026-02-21 Merge pull request #17 from aheimsbakk/lessons
86f195a 2026-02-20 feat: add configurable platform symbol rules
b3b9a7d 2026-02-20 fix: use transport mode from API for platform symbols
0d1d6f8 2026-02-20 Merge pull request #16 from aheimsbakk/lessons
b235651 2026-02-20 feat: lessons learned
0e8248e 2026-02-20 feat: lessons learned
655b486 2026-02-20 chore: add LEARNED.md summarizing investigation learnings and agent rules
3de5e99 2026-02-20 Merge pull request #15 from aheimsbakk/fix-station-dropdown
f1a1821 2026-02-20 test: add sw-api-caching test to prevent regression - v1.29.1
da1bcdd 2026-02-20 feat: restore station name pre-fill on focus for better UX - v1.29.0
e2e7fde 2026-02-20 chore: remove debug logging from searchStations - v1.28.1
a8d4c33 2026-02-20 fix(sw): exclude external API requests from cache to prevent stale results - v1.28.0
533f0a8 2026-02-20 debug(api): log text parameter and response URL to find mismatch - v1.27.13
a40227d 2026-02-20 debug(filter): log raw features to identify venue layer issue - v1.27.12
b331be9 2026-02-20 debug(api): add logging to track Entur API responses - v1.27.11
5a7338a 2026-02-20 fix(autocomplete): prevent race condition with stale search results - v1.27.10
550a740 2026-02-20 debug(autocomplete): add logging to track state transitions - v1.27.9
1b3b337 2026-02-20 fix(autocomplete): detect stale input value on first keystroke
d88c713 2026-02-20 fix(autocomplete): only clear input on focus if station was selected
fed60de 2026-02-20 fix(autocomplete): only clear input on focus if station was selected
d064c73 2026-02-20 Merge pull request #14 from aheimsbakk/a-406
f296a43 2026-02-20 fix(sw): add missing files to service worker cache
330a2f4 2026-02-20 fix(autocomplete): clear input on focus for mobile compatibility
b0e7e75 2026-02-20 Merge pull request #13 from aheimsbakk/a-406
fa2ad2b 2026-02-20 docs: update context after v1.27.3 deployment
520f6df 2026-02-20 Merge pull request #12 from aheimsbakk/a-406
eb503da 2026-02-20 fix(autocomplete): prevent stale results from being auto-selected
3201c85 2026-02-20 Merge pull request #11 from aheimsbakk/a-406
640e629 2026-02-20 fix: autocomplete not working when opening with default station
fd466a8 2026-02-20 Merge pull request #10 from aheimsbakk/a-26898
4cc891b 2026-02-20 fix: add missing 'to' translation in update notification
bbe2f87 2026-02-20 fix(ui): changed share icon to clipboard
129f188 2026-02-20 feat: make all emojis configurable in config.js
45933f7 2026-02-20 docs: add share button feature to README
fbcbf03 2026-02-20 feat: redesign app icons with bold S in circle
d35d768 2026-02-20 fix: prevent background gradient from scrolling away
12902e3 2026-02-20 fix: autocomplete hanging on current station name
d2ebc69 2026-02-20 fix(ui): mobile phone text size
cd68609 2026-02-20 Merge pull request #9 from aheimsbakk/a-288
3fa345f 2026-02-20 fix: clear cache-busting timestamp parameter after SW reload
71c0d7a 2026-02-20 fix: clear URL parameter after importing shared board
029c3c2 2026-02-20 fix: persist text size changes in options panel
0eeb267 2026-02-20 feat(share): automatically add imported shared stations to favorites
52df207 2026-02-20 test(station-dropdown): suppress expected error output in corrupted data test
7b283ee 2026-02-20 fix(favorites): preserve stored settings when re-selecting from dropdown
e33d575 2026-02-20 fix(favorites): add missing modesEqual function for proper station+modes matching
d87fef5 2026-02-20 fix(settings): preserve onSave handler after language change
d062fbb 2026-02-20 fix(validation): correct worklog directory path in validation script
4998f25 2026-02-20 fix(i18n): add missing translations for all 12 languages
65c3862 2026-02-20 fix(share): use pushState to avoid page reload
4cbcdbf 2026-02-20 feat(share): improve UX with visible URL and shorter parameter
278baf2 2026-02-20 fix(i18n): update tooltips immediately on language flag click
794fe49 2026-02-20 fix: update button tooltips when language changes
b5b59d6 2026-02-20 docs: update context - share feature documented
197b2ee 2026-02-20 docs: add comprehensive share URL encoding documentation
0e3667b 2026-02-20 feat: improve share URL compression with array encoding
1ce37f3 2026-02-20 docs: update version to 1.23.1 in context
aff1854 2026-02-20 chore: bump version to 1.23.1 for localStorage fix
7e04629 2026-02-20 docs: update context with localStorage persistence fix
953978d 2026-02-20 fix: persist shared board settings to localStorage
7e97867 2026-02-20 feat: add share button for departure board URLs
d9cedf8 2026-02-20 feat: store full settings per favorite for future use
05680a6 2026-02-20 fix: unchecking last transport mode now shows all modes
58a75dd 2026-02-20 Merge pull request #8 from aheimsbakk/a-288
0426aa7 2026-02-20 fix: remove mobile breakpoint
d08dad6 2026-02-20 fix: removed technical docs from readmme
d43620d 2026-02-20 docs: update README with new departure display features
1e982f8 2026-02-20 feat: update app icons to transit + clock design
dbcb647 2026-02-20 feat: add strikethrough styling for cancelled departures
fe6e04d 2026-02-20 feat: add realtime vs scheduled indicator to departure display
b049930 2026-02-20 feat: add configurable departure line template system
ed56ba7 2026-02-20 feat: make line number separator configurable
fc6a9a5 2026-02-20 feat: add middot separator between line number and destination
2bd7b88 2026-02-20 fix: adjust platform display vertical centering to -50%
74ba2bb 2026-02-20 chore: bump version to 1.18.1 for vertical centering fix
705eb07 2026-02-20 fix: center platform display vertically on text line
19e69c8 2026-02-20 feat: add stacked platform/gate display with configurable symbols
924f594 2026-02-20 feat: add line number display to departure board
fce0546 2026-02-20 docs: remove incorrect line number mention from README
39804b8 2026-02-20 docs: rewrite README as user manual
6074ab0 2026-02-20 Merge pull request #7 from aheimsbakk/a-19512
274a3ee 2026-02-20 fix: remove periodic update checks to respect user control
bc62cf0 2026-02-20 fix: force service worker updates to bypass HTTP cache
06c7f3d 2026-02-20 fix: improve service worker cache invalidation on updates
1bbb10a 2026-02-20 fix: move stationNameTooltip to correct element
c956e7d 2026-02-20 feat: add natural language tooltips with i18n support
2918d37 2026-02-20 fix: improve service worker update detection
a362114 2026-02-20 feat: improve keyboard navigation accessibility with inert attribute
31ff007 2026-02-20 fix: use correct Norwegian and Icelandic transit terminology
44ea87b 2026-02-20 feat: update station name label to include stops
38e1a1b 2026-02-20 fix: add theme-toggle.js to service worker cache
03d171b 2026-02-20 feat: clarify save button purpose with 'Save to Favorites' text
33b072d 2026-02-20 fix: station dropdown hover text inversion for light theme
f871667 2026-02-20 fix: dropdown hover text inversion for light theme
2a3f8eb 2026-02-20 fix: add missing text shadow variable for dark theme
0f9b46d 2026-02-20 style: match header button styling with options panel
acbede1 2026-02-19 fix: use text-shadow-dark for departure elements
6133ca9 2026-02-19 fix: invert text shadows for better theme contrast
62be6fe 2026-02-19 feat: add theme toggle with light/auto/dark modes
ed2bbdb 2026-02-19 fix(ui): update options panel when station changes while open
ac166a1 2026-02-19 feat(ui): show transport mode icons in station title when filtered
44b0212 2026-02-19 fix(ui): make station dropdown width dynamic
2771163 2026-02-19 chore: delete unused demo data files
455c258 2026-02-19 feat: remove demo data fallback, always use live data
ea7522c 2026-02-19 fix(ui): remove technical debug panel message for empty results
62e7013 2026-02-19 feat(ux): separate immediate updates from save-to-favorites action
92a3e6d 2026-02-19 fix(ux): auto-check all transport modes on new station select
d4fd6ba 2026-02-19 fix(ux): hide mode icons when all transport modes selected
292cfe3 2026-02-19 fix(ui): widen station dropdown to prevent text wrapping
de7b240 2026-02-19 fix: remove immediate updates from options panel
477d209 2026-02-19 feat: save transport modes with station favorites
d9affa3 2026-02-19 fix(ui): update options panel inputs when opened
bd5849b 2026-02-19 Merge pull request #6 from aheimsbakk/a-19512
6955bda 2026-02-19 fix(ci): use git add before pull to avoid unstaged changes error
cc75383 2026-02-19 Merge pull request #5 from aheimsbakk/a-19512
775143b 2026-02-19 fix(ci): handle concurrent gh-pages updates and preserve CNAME
d33066e 2026-02-19 Merge pull request #4 from aheimsbakk/a-19512
d92f14f 2026-02-19 fix(ci): correct git push commands in all workflows
66742c1 2026-02-19 Merge pull request #3 from aheimsbakk/a-19512
7d4b143 2026-02-19 feat: rename app to Kollektiv.Sanntid.org
2222e22 2026-02-19 Create CNAME
eee3770 2026-02-19 Merge pull request #2 from aheimsbakk/a-3672
3ff49e9 2026-02-19 fix(ci): redesign PR preview for gh-pages sub-folder deployment
cd5bbf4 2026-02-19 fix(ci): redesign PR previews to use orphan previews branch
5b2435a 2026-02-19 feat(ci): add PR preview deployments using GitHub Environments
e44ebfb 2026-02-19 chore: updated defaults
7c8e539 2026-02-19 fix: glow and shadow is more clear
6d7aa2b 2026-02-18 fix(sw): improve update notification visibility and add version upgrade info
31df61a 2026-02-18 fix(options): only save settings when values actually change
f578fa9 2026-02-18 feat(i18n): add Polish language and 5-second update countdown
9f5a0ff 2026-02-18 feat(ui): auto-select text in options panel inputs on focus
6c71a1e 2026-02-18 fix(sw): cache all JavaScript modules for proper version updates
fe3a303 2026-02-18 refactor(ui): center station dropdown menu horizontally
a9d3e94 2026-02-18 fix(sw): ensure CSS updates with versioned cache invalidation
10e5bb1 2026-02-18 refactor(css): unify gear button styling with base button styles
5550068 2026-02-18 test(sw): add version consistency validation tests
550fc4a 2026-02-18 feat(sw): implement automatic reload on service worker updates
00fc0c6 2026-02-18 feat(i18n): add French, Icelandic, and Ukrainian languages
24697f7 2026-02-18 refactor(css): remove duplicate button styles
9102c8b 2026-02-18 refactor(css): unify station dropdown with autocomplete styles
eaa3060 2026-02-18 refactor(css): reduce text shadow glow intensity
b7d3988 2026-02-18 chore: bump version to 1.6.3 for shadow visibility fix
2b49e1a 2026-02-18 fix(css): make text shadows visible with white glow effect
96dd75b 2026-02-18 fix(css): use light gray shadows consistently
84321db 2026-02-18 refactor(css): consolidate styles and prepare for dark/light mode
7ab8768 2026-02-18 refactor(ui): replace GitHub text with link emoji in footer
d968c06 2026-02-18 fix(ui): correct return object in createBoardElements
bec6aa3 2026-02-18 feat(ui): add recent stations dropdown with localStorage persistence
3f7a25a 2026-02-18 refactor(i18n): simplify footer text to just 'GitHub'
3bb1946 2026-02-18 fix(ui): position footer in lower left corner of viewport
2f94d7e 2026-02-18 feat(ui): add footer with version and GitHub repository link
5c08b7d 2026-02-18 fix(app): remove duplicate refresh interval causing countdown resets
c3ca706 2026-02-17 refactor(ui): swap Tram and Rail positions in transport modes
223b090 2026-02-17 fix(ui): enforce 1 minimum for number of departures input
f110fd4 2026-02-17 fix(ui): enforce 20-second minimum for fetch interval input
9e840f7 2026-02-17 refactor(ui): change transport modes to 3x2 table layout
7c9a86f 2026-02-17 fix(i18n): detect Norwegian browser language codes nb and nn
8910849 2026-02-17 fix(i18n): language switcher updates UI instantly without reload
47735d5 2026-02-17 feat: add multilingual support with 8 languages
5c53ecb 2026-02-17 feat: improve keyboard navigation and autocomplete in options panel
7f805a2 2026-02-17 refactor: change coach icon from minibus to oncoming bus
d4ea741 2026-02-17 feat: reorganize transport modes into 2x3 table layout
deb01b3 2026-02-17 feat: improve options panel UX and responsiveness
c7c41fa 2026-02-17 docs: enforce version bumping in agent protocol workflow
af71116 2026-02-17 fix: add versioned caching to service worker for proper updates
d9a6b15 2026-02-16 fix: improve autocomplete ranking for Norwegian character stations
d22ec38 2026-02-16 refactor: remove unused transport modes (air, gondola, funicular)
d3c164e 2026-02-16 feat: add support for all transport modes
22f9728 2026-02-16 feat: filter autocomplete to show only transport stops
e0be684 2026-02-16 fix: support Norwegian characters (æøå) in station autocomplete
4d3f79e 2026-02-16 fix: store and use stopId from autocomplete to avoid label lookup failures
ec45052 2026-02-16 feat: refine autocomplete filtering and add realtime departure fields
84885b2 2026-02-16 feat(pwa): add SW update prompt and network-first navigation; prompt-to-reload flow
099dfd3 2026-02-16 perf(autocomplete): debounce backend calls with 500ms delay to avoid overload; add worklog
15b2665 2026-02-16 fix(autocomplete): ensure dropdown hidden when unused; add worklogs
b0710c6 2026-02-16 fix(autocomplete): create/remove dropdown DOM nodes on demand to ensure fully hidden when unused; manage aria-expanded
9023a15 2026-02-16 feat(accessibility): hide autocomplete list when unused using hidden + aria-hidden
f89aaa9 2026-02-16 style(autocomplete): invert colors on hover/active, remove bullets, make item gap configurable
388a7a7 2026-02-16 fix(options): restore keyboard selection for station autocomplete
6a75974 2026-02-16 feat(options): extract station autocomplete styles and make input full-width
486ab06 2026-02-16 updated agents
04bab29 2026-02-16 chore(repo): rename agent/ -> agents/ and update references
a3df0f1 2026-02-16 feat(ui): compact header countdown label to 'Updating in XXs'
5828772 2026-02-16 fix(ui): ensure refresh loop and countdown use updated FETCH_INTERVAL
94a5473 2026-02-16 feat(ui): show countdown to next refresh in header status chip
2d46360 2026-02-15 refactor: reorganize CSS with clear section comments and remove unused code
1ccfa01 2026-02-15 chore: remove node, it's included in the my opencode environment
06c3828 2026-02-15 feat(pwa): add manifest, icons and service worker; register SW for installability
96be60e 2026-02-15 chore(context): record title-sync worklog and update CONTEXT
8ca4853 2026-02-15 style(ui): consolidate debug styles & theme tokens; move debug-panel styling to CSS and replace inline styles
1e16355 2026-02-15 style: merge options panel CSS into main stylesheet and remove separate options.css
d30c70c 2026-02-15 feat(ui): responsive options panel width (360px or 100vw) and shift app accordingly
0b622ea 2026-02-15 style(ui): unify vertical spacing tokens, remove min-width, standardize departure sizing
7e9fbd6 2026-02-15 chore(ui): move per-departure situations between destination and countdown
ca6109f 2026-02-15 chore(ui): remove global situation banner; keep per-departure situations
59aa4a1 2026-02-15 fix(startup): load persisted settings before building UI so station title reflects saved config
e016d30 2026-02-15 style(ui): reserve monospace for countdown timers; use proportional font for destinations
6c70e73 2026-02-15 fix(ui): place transport emoji at end of destination text; update aria-label ordering
47b120c 2026-02-15 fix(ui): inline transport emoji with destination text; update styles and tests
febce39 2026-02-15 fix: improve instructions
8c62888 2026-02-15 fix: improve instructions
abb4082 2026-02-15 chore(agent): add worklog for repo scan and bump validator version
348b9b1 2026-02-15 fix: don't allow creation of ci/cd on in .github
2129db2 2026-02-15 chore: test prehook
1355e7c 2026-02-15 fix(pre-commit): run hook scripts via bash fallback when not executable
8371081 2026-02-15 chore: moving files around and deleted TODO
1346739 2026-02-15 Change artifact upload path to 'src/'
d35fe83 2026-02-15 docs(readme): prettify README, reference agent/AGENT.md; add worklog
560eeb3 2026-02-15 style(ui): align station/internal spacing; reduce name->icon gap; add worklogs
77188d2 2026-02-15 style(ui): tighten vertical gaps and even internal spacing between destination and countdown; add worklog
8236611 2026-02-15 fix(ui): unify destination and countdown text-size classes; add worklog
7ca8e5f 2026-02-15 chore(ui): capitalize transport mode labels in options and remove 'coach' option; add worklog
cdacf70 2026-02-15 chore(ci): auto-fix worklogs in pre-commit and validate
36e36fe 2026-02-15 chore(ci): add local pre-commit hook to validate worklogs
b42bd45 2026-02-15 chore(worklogs): archive non-conforming worklogs, add summary worklog and archive README; update validator script
5367ae1 2026-02-15 fix(scripts): stricter front-matter and body validation for worklogs
9fe02ff 2026-02-15 fix(scripts): awk front-matter extraction variable name
b91a2e0 2026-02-15 chore(hooks): remove husky pre-commit hook (user requests)
1772559 2026-02-15 chore(hooks): switch pre-commit to bash validator
53e0f6e 2026-02-15 chore(scripts): add bash worklog validator
f5a9ae6 2026-02-15 chore(hooks): add pre-commit hook to validate worklogs
3d7e7d4 2026-02-15 chore(scripts): add pre-commit worklog validator
9d92448 2026-02-15 chore(agent): align worklog template exactly with AGENT.md
b9bad88 2026-02-15 chore(agent): add worklog template per AGENT.md requirements
53e72dd 2026-02-15 docs(todo): add TODO.md with remaining actionable items
4eb037e 2026-02-15 docs(agent): update CONTEXT.md from recent worklogs
3051663 2026-02-15 feat(entur/ui): prefer journeyPattern.line.transportMode, normalize modes, move icons, remove debug UI
f0a6b85 2026-02-15 debug(ui): add 'Dump raw response' to debug panel for inspecting server JSON
f5b8c90 2026-02-15 debug(ui): add 'Capture now' to emoji debug panel to fetch and capture parsed items
c3dd44e 2026-02-14 debug(ui): add visible emoji debug button + panel to inspect window.__EMOJI_DEBUG__ snapshots
79c4a08 2026-02-14 debug: capture emoji-detection snapshots to window.__EMOJI_DEBUG__ when detection fails
d76facc 2026-02-14 chore: prefer parser-normalized mode when available
c21e42d 2026-02-14 feat: expose normalized mode in parsed entur items for UI emoji mapping
4d355dc 2026-02-14 fix: robust recursive scan for mode tokens including common nested keys and normalization
18f36b1 2026-02-14 fix: normalize shallow values and object nodes when scanning raw payload for mode tokens
665ded9 2026-02-14 diag: log raw payload key signature when emoji mode detection fails (one-time per shape)
be71758 2026-02-14 refactor: restore createDepartureNode body and ensure detection+emoji logic are inside function
222dda5 2026-02-14 test: add raw payload emoji detection tests
9facea7 2026-02-14 debug: broaden mode detection to check shallow raw fields and keys then recurse
917b4a5 2026-02-14 ui: improve mode detection by recursively scanning raw payload for transport tokens
13d7e9e 2026-02-14 fix(tests): handle DOM shim without setAttribute in departure emoji element
dc9fa27 2026-02-14 ui: add transport emojis before countdown (mapping per selection) + tests
62106c7 2026-02-14 chore: disable automatic Entur debug panel exposure (opt-in via window.__ENTUR_DEBUG_PANEL__)
77a7c8d 2026-02-14 ui: show explicit empty state when API returns no departures (don't show demo)
ff32ea3 2026-02-14 style: reduce predefined text-size scales by 20%
1c8a1c3 2026-02-14 options: add toast confirmation and debounce transport mode toggles
e11e543 2026-02-14 options: apply changes immediately on Enter, checkbox change and text-size select; persist settings
7ffe902 2026-02-14 ui: place status chip under station title; preserve centered header and absolute gear controls
63f89a8 2026-02-14 feat(entur): apply client-side fallback filtering when server rejects mode ASTs
10cbaed 2026-02-14 fix(entur): send lowercase enum tokens for whiteListedModes to match API
7029b3a 2026-02-14 fix(ui): append text-size dropdown row to options panel; add worklog
0c6621b 2026-02-14 feat(settings): add text-size dropdown; default to medium; worklog
44056de 2026-02-14 feat(settings): add text-size option (tiny..xlarge), persist and apply via CSS classes; add worklog
1e0561b 2026-02-14 feat(settings): persist options to localStorage; add ESC-to-close and focus-trap for accessibility; add worklog
cddc6c9 2026-02-14 chore(ui): remove header gear and make global gear toggle panel; update context/worklog
bbd59b4 2026-02-14 feat(ui): add slide-in options panel, global gear button, debug improvements and unit tests; update agent context and worklogs
4626a50 2026-02-14 fix(entur): ensure API_URL present and guard POSTs to avoid 501 on static server
fd26b6c 2026-02-14 fix(demo): shift past demo times into future for better UX
3fb1cf9 2026-02-14 fix(loader): load demo.json via fetch in browsers, fs in Node to avoid MIME/import errors
d996bd0 2026-02-14 chore(dev): add helper script to serve src/ for manual testing
f999562 2026-02-14 style(ui): add variables and figlet-like destination styling
e97e25f 2026-02-14 feat(scaffold): add UI primitives, node wrapper, and Node-local tests
925a8ae 2026-02-14 initial commit