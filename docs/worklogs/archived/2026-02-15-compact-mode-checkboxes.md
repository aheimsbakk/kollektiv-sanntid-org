Title: make transport mode checkboxes more compact

What: UI tweak to make the transport-mode checkboxes in Settings more compact and denser so the list consumes less vertical space.

Why: Users requested a denser settings layout; compact arrangement improves usability when many modes are shown on small screens.

Files touched:
- src/ui/options.js (no logic changes; labels already in place)
- src/style.css (layout & sizing tweaks for .modes-checkboxes, .mode-icon, checkbox sizing)

Notes: kept icons and labels for accessibility; icons remain aria-hidden. No behavior/serialization changes.
