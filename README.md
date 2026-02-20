# Kollektiv.Sanntid.org

Real-time public transport departure board for Norway. Track buses, trams, trains, and ferries with live departure times from any station or stop across the country.

## About

This app uses [Entur's API](https://developer.entur.org/) to show live departures from Norwegian public transport. It's built with the [JourneyPlanner API](https://developer.entur.org/pages-journeyplanner-journeyplanner) and is the first app I've created using vibe coding.

## Getting Started

### Finding Your Station

1. Open the app and click the **⚙️ settings** button in the top right
2. In the **Station or stop name** field, start typing your station name
3. Select your station from the dropdown suggestions
4. Choose which transport types you want to see (bus, tram, metro, etc.)
5. Click **Save to Favorites** to remember this station

Your departure board will now show live times for the next departures from your chosen station.

### Using Favorites

Click the **station name** at the top of the screen to open your favorites list. This shows your recently viewed stations with their transport filters. Click any favorite to instantly switch to that station.

## Features

### Live Departures

The app displays upcoming departures with:
- **Line number and destination** for each service (e.g., "Ski ● L2 🚅")
- **Realtime indicators** - ● solid dot for live tracking, ○ hollow dot for scheduled times
- **Platform/gate information** - Shows platforms (⚏10), gates (◆A), or stops (▪B) where available
- **Countdown timer** showing minutes until departure
- **Transport icons** (🚌 🚋 🚇 🚅 🛳️ 🚍) to identify the vehicle type
- **Cancellation notices** - Cancelled departures appear with strikethrough and reduced opacity
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
Choose from 12 languages using the flag buttons. The entire interface updates instantly.

### Theme Toggle

Click the **theme button** (left of settings) to cycle through three themes:
- 🌞 **Light** - Bright theme for daytime
- 🌤️ **Auto** - Follows your device's preference
- 🌥️ **Dark** - Easy on the eyes at night

Your theme choice is saved automatically.

### Keyboard Navigation

- Press **Tab** to navigate between station dropdown, theme toggle, settings, and GitHub link
- Press **Escape** to close the settings panel
- Tab through settings panel fields when open

## Customization

For advanced users, the app supports extensive customization via `src/config.js`:

### Departure Display Template

Customize the order and format of departure information by editing `DEPARTURE_LINE_TEMPLATE`:

```javascript
// Default format: Destination first with realtime indicator
'{destination} {indicator} {lineNumber} {emoji} {platform}'

// Other examples:
'{lineNumber} · {destination} {emoji}{platform}'  // Line number first
'{emoji} {lineNumber} - {destination}{platform}'  // Emoji first
'{destination} {emoji}{platform} ({lineNumber})'  // Line in parentheses
```

Available placeholders:
- `{destination}` - Where the service is headed (e.g., "Ski", "Myrvoll stasjon")
- `{lineNumber}` - Route number (e.g., "L2", "81", "17")
- `{emoji}` - Transport mode icon (🚌 🚋 🚇 🚅 🛳️ 🚍)
- `{indicator}` - Realtime status (● live data, ○ scheduled)
- `{platform}` - Platform/gate/stop information (⚏10, ◆A, ▪B)

### Realtime Indicators

Change the symbols that indicate realtime vs scheduled departures:

```javascript
export const REALTIME_INDICATORS = {
  realtime: '●',    // Live tracking data
  scheduled: '○'    // Static timetable
};
```

### Platform Symbols

Customize symbols for different stop types:

```javascript
export const PLATFORM_SYMBOLS = {
  platform: '⚏',  // Train/metro platforms (numeric codes)
  gate: '◆',      // Bus station gates (letter codes)
  stop: '▪',      // Tram/bus stops (letter codes)
  berth: '⚓',     // Ferry berths
  default: '•'    // Unknown types
};
```

### Cancellation Styling

Modify how cancelled departures appear by editing the CSS class `.departure-cancelled` in `src/style.css`.

## Updates

When a new version is available, you'll see a notification counting down from 5 seconds. The app will automatically reload with the latest features. All your settings and favorites are preserved.

## Technical Details

This is a pure JavaScript web app with no dependencies or build step. It works offline after your first visit thanks to service worker caching.

### Languages Supported
English, Norwegian, German, Spanish, Italian, Greek, Persian, Hindi, Icelandic, Ukrainian, French, Polish

### Browser Requirements
Modern browsers with service worker support (Chrome 102+, Firefox 112+, Safari 15.5+)

## License

MIT
