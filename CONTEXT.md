Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.40.23.

Current Goal: Stable mobile PWA experience with polished touch and keyboard interaction.

Last 3 Changes:

- Station title first-touch focus ring fix (v1.40.23): :active outline:none in CSS; deferred populateMenu() via Promise.resolve() in station-dropdown.js; focus({ preventScroll:true }); passive touchstart primer on document.body in app.js
- Station title focus ring fix (v1.40.22): replaced highlight-bg/fg inversion with outline:2px solid currentColor on :focus-visible
- Station title focus color fix (v1.40.21): replaced accent outline with highlight-bg/fg tokens on :focus-visible

Next Steps:

- No outstanding items — all H/M priority issues resolved
