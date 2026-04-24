# Kollektiv.Sanntid.org

Real-time public transport departure board for Norway. Track buses, trams, metro, trains, ferries, and coaches with live departure times from any station or stop across the country.

**Live app:** [kollektiv.sanntid.org](https://kollektiv.sanntid.org)

## How it works

This app uses [Entur's API](https://developer.entur.org/) to show live departures from Norwegian public transport. It's built with the [JourneyPlanner API](https://developer.entur.org/pages-journeyplanner-journeyplanner) and is the first app I've created using vibe coding.

## Getting Started

### Finding Your Station

There are two ways to pick a station:

**By name** — click the **⚙️ settings** button in the top right, type in the **Station or stop name** field, and select from the dropdown suggestions.

**By location** — click the **🧭 compass** button in the top left. The app requests your device's GPS position (one-time, no tracking) and lists up to **8 nearest stops** within a **2 km radius**. Each result shows the stop name, distance in metres, and transport mode icons. Click any result to load it. The dropdown closes when you select a stop or press **Escape**.

**On the map** — click the **🗺️ map** button (below the compass) to open the current station on [OpenStreetMap](https://www.openstreetmap.org/) in a new tab. Opens at **zoom level 16** with the **Transport layer** active and a **pin marker** at the station's exact coordinates.

Once a station is loaded, choose which transport types you want to see, then click **Close** to apply.

To save the station to your favorites, click the **🩶 heart button** to the left of the station name. The heart is gray when a station is not saved. Once saved, the heart turns red ❤️ — and remains **clickable**. Click it again to **remove** the station from your favorites.

### Using Favorites

Click the **station name** at the top of the screen to open your favorites list. This shows your recently viewed stations with their transport filters. Click any favorite to switch to that station.

Your favorites list stores up to 8 stations with all their settings. The most recently used station appears at the top.

To remove a station from favorites, click the red heart ❤️ on the departure board while viewing that station — it will be removed immediately.

If you have no favorites yet, the app pre-seeds **Jernbanetorget, Oslo** as a starting point so the board is never empty on first use.

### Sharing Your Board

Click the **📋 share** button (top left, next to the compass) to copy a shareable link to your clipboard. This link includes:

- Your current station
- Selected transport modes

When someone opens your link, the station is automatically added to their favorites.

## Features

### Loading More Departures

Scroll down past the last departure to progressively load more:

- **Touch/mouse drag** — pull upward from the bottom of the departure list; a ▼ indicator bounces to confirm the gesture is registered. Release to load.
- **Mouse wheel** — scroll down at the bottom of the list until the threshold is reached; loads automatically.

Departures load in steps: **1 → 2 → 3 → 5 → 8 → 13 → 21**. When the maximum (21) is reached, the indicator switches to ● and a short hint suggests using ⚙️ settings to change the default number of departures.

The extra departures are temporary — the count resets when you switch station, apply settings, or reload the app.

### Live Departures

The app displays upcoming departures with:

- **Line number and destination** for each service (e.g., "Ski ● L2 🚅")
- **Realtime indicators** — ● solid dot for live tracking, ○ hollow dot for scheduled times, ● dot for delayed
- **Delay indicator** — the indicator changes to a **red diamond** (●) when a live-tracked departure is running **2 minutes or more late**. Only shown when realtime tracking is active and the expected departure is at least 120 seconds after the originally scheduled time. Small adjustments under 2 minutes are treated as normal tracking noise and do not trigger the delay symbol.
- **Platform/gate information** — shows platforms (⚏10), gates (◆A), or stops (▪B) where available
- **Countdown timer** showing minutes until departure
- **Transport icons** (🚌 🚋 🚇 🚅 🛳️ 🚍) to identify the vehicle type
- **Cancellation notices** — cancelled departures appear with strikethrough and reduced opacity
- **Automatic updates** every 60 seconds (configurable)

### Settings Panel

Access all settings by clicking the **⚙️ settings** button:

#### Station or Stop Name

Type to search for any station or stop in Norway. The app suggests matches as you type.

#### Number of Departures

Choose how many upcoming departures to display (default: 5)

#### Update Interval

Set how often the app refreshes departure times in seconds (default: 60)

#### Text Size

Pick from five sizes: Tiny, Small, Medium, Large, or Extra Large. Changes apply immediately.

#### Transport Modes

Filter which transport types appear on your board:

- 🚌 Bus
- 🚇 Metro (T-bane)
- 🚋 Tram (Trikk)
- 🚅 Rail (Tog)
- 🛳️ Water (Ferry)
- 🚍 Coach (Long-distance bus)

Uncheck any type to hide it from your departures.

#### Language

Choose from 12 languages using the flag buttons. The entire interface updates right away.

### Theme Toggle

Click the **theme button** (left of settings) to cycle through three themes:

- 🌞 **Light** - Bright theme for daytime
- 🌤️ **Auto** - Follows your device's preference
- 🌥️ **Dark** - Easy on the eyes at night

Your theme choice is saved automatically.

### Keyboard Navigation

- Press **Tab** to navigate between station dropdown, compass button, share button, map button, theme toggle, settings, and GitHub link
- Press **Escape** to close the settings panel or GPS nearby-stops dropdown
- Tab through settings panel fields when open

## App Updates

Reload the web page. When a new version is available, you'll see a notification counting down from 5 seconds. The app will automatically reload with the latest features. All your settings and favorites are preserved.

## Run Locally

This app has no build step. To run it:

1. Clone the repository.
2. Serve the files with any local HTTP server (service workers require HTTP, not `file://`).

```sh
npx serve .
# or
python3 -m http.server
```

3. Open `http://localhost:3000` (or the port your server reports) in your browser.

## Technical Details

This is a pure JavaScript web app with no dependencies or build step. It works offline after your first visit thanks to service worker caching.

### Data Attribution

Departure data is provided by [Entur](https://entur.no/). The footer displays a translated "Data from Entur" attribution in all 12 supported languages.

### Languages Supported

English, Norwegian, German, Spanish, Italian, Greek, Persian, Hindi, Icelandic, Ukrainian, French, Polish

### Browser Requirements

Modern browsers with service worker support (Chrome 102+, Firefox 112+, Safari 15.5+)

## Contributing

Bug reports and suggestions are welcome — [open an issue](../../issues) on GitHub.

## License

MIT
