# Share URL Encoding

This document describes the URL encoding format used for sharing departure board configurations.

## Overview

The share button allows users to share their current departure board configuration via URL. The URL contains all settings (station, modes, preferences) encoded as a compact base64 string.

**URL Format (v1.24.0+):**
```
https://kollektiv.sanntid.org/?b=<base64-encoded-settings>
```

**Legacy URL Format (pre-v1.24.0):**
```
https://kollektiv.sanntid.org/?board=<base64-encoded-settings>
```

Both formats are supported for backward compatibility.

## Encoding Format

### Current Format (v1.23.2+): Array Encoding

Settings are encoded as a **compact JSON array** to minimize URL length:

```javascript
[
  stationName,      // String: "Oslo Bussterminal"
  stopId,          // String: "NSR:StopPlace:58366"
  transportModes,  // Array: ["bus", "tram", "metro"]
  numDepartures,   // Number: 10
  fetchInterval,   // Number: 60
  textSize,        // String: "large"
  language         // String: "no"
]
```

**Example:**
```json
["Oslo Bussterminal","NSR:StopPlace:58366",["bus","tram","metro"],10,60,"large","no"]
```

This array is then:
1. JSON stringified
2. Base64 encoded with `btoa(unescape(encodeURIComponent(json)))`
3. Made URL-safe: Replace `+` → `-`, `/` → `_`, remove `=`

**Result:**
```
WyJPc2xvIEJ1c3N0ZXJtaW5hbCIsIk5TUjpTdG9wUGxhY2U6NTgzNjYiLFsiYnVzIiwidHJhbSIsIm1ldHJvIl0sMTAsNjAsImxhcmdlIiwibm8iXQ
```

### Legacy Format (pre-v1.23.2): Object Encoding

Older URLs use object format with single-letter keys:

```javascript
{
  "n": stationName,
  "s": stopId,
  "m": transportModes,
  "d": numDepartures,
  "i": fetchInterval,
  "t": textSize,
  "l": language
}
```

The decoder automatically detects and supports both formats.

## Compression Comparison

**URL Parameter:**
- **New (v1.24.0+):** `?b=` (1 char) saves 5 bytes per share
- **Legacy:** `?board=` (6 chars)

| Format | Example Size | Typical URL | Savings |
|--------|--------------|-------------|---------|
| **Array + short param** | 114 bytes | 146 bytes | **28.7%** |
| Array + long param | 114 bytes | 151 bytes | 24.5% |
| Object (legacy) | 151 bytes | 191 bytes | baseline |

**Worst-case scenario** (long station name + all transport modes):
- Array: 190 bytes (227 byte URL)
- Object: 230 bytes (267 byte URL)  
- **Savings: 17.4%**

## Decoding Process

1. Restore URL-safe base64 to standard base64 (`-` → `+`, `_` → `/`, add padding `=`)
2. Decode base64: `decodeURIComponent(escape(atob(base64)))`
3. Parse JSON
4. Detect format (array vs object) using `Array.isArray(data)`
5. Extract values:
   - **Array format:** Destructure `[n, s, m, d, i, t, l] = data`
   - **Object format:** Destructure `{n, s, m, d, i, t, l} = data`
6. Validate all fields
7. Apply settings to DEFAULTS
8. Save to localStorage
9. Add to favorites
10. Clean URL (remove `?board=` parameter)

## Validation Rules

| Field | Type | Validation | Default |
|-------|------|------------|---------|
| Station Name | String | 1-200 chars, required | - |
| Stop ID | String | 1-100 chars, required | - |
| Transport Modes | Array | Valid modes only¹ | All modes |
| Num Departures | Number | 1-20 range | 5 |
| Fetch Interval | Number | 20-300 seconds | 60 |
| Text Size | String | Valid size² | 'large' |
| Language | String | 2-3 letter code | 'en' |

¹ Valid modes: `['bus', 'tram', 'metro', 'rail', 'water', 'coach']`  
² Valid sizes: `['tiny', 'small', 'medium', 'large', 'xlarge']`

## Implementation

**Encoding** (see `src/ui/share-button.js`):
```javascript
export function encodeSettings(settings) {
  const data = [
    settings.STATION_NAME,
    settings.STOP_ID,
    settings.TRANSPORT_MODES,
    settings.NUM_DEPARTURES,
    settings.FETCH_INTERVAL,
    settings.TEXT_SIZE,
    settings.language
  ];
  
  const json = JSON.stringify(data);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
```

**Decoding** (see `src/ui/share-button.js`):
```javascript
export function decodeSettings(encoded) {
  // Restore base64
  let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  
  // Decode and parse
  const json = decodeURIComponent(escape(atob(base64)));
  const data = JSON.parse(json);
  
  // Support both formats
  let [n, s, m, d, i, t, l] = Array.isArray(data) 
    ? data 
    : [data.n, data.s, data.m, data.d, data.i, data.t, data.l];
  
  // Validate and return settings object
  // ... (see implementation for full validation)
}
```

## Why Array Encoding?

We evaluated three compression strategies:

### 1. No Compression (baseline)
- Simple base64 encoding
- 191 byte typical URL
- ❌ Longest URLs

### 2. Gzip Compression (rejected)
- Uses `CompressionStream` API
- Only 4-5% savings (186 bytes)
- ❌ Browser compatibility concerns
- ❌ Complex async code
- ❌ Overhead for small payloads

### 3. Array Encoding (chosen)
- Eliminates object key overhead
- 17-24% savings (151 bytes)
- ✅ Works in all browsers
- ✅ Simple synchronous code
- ✅ Best compression for small payloads
- ✅ Backward compatible

## User Experience

**Sharing (v1.24.0+):**
1. User clicks 🔗 share button in top-right
2. URL is copied to clipboard
3. Browser navigates to the shareable URL (shows `?b=...` in address bar)
4. User can now copy the full URL from the browser address bar or share the already-copied link

**Opening Shared Link:**
1. User visits shared URL (`?b=...` or legacy `?board=...`)
2. Settings are decoded and validated
3. Board immediately shows shared station
4. Settings are saved to localStorage (persist across refreshes)
5. URL parameter remains visible (allows user to see and share the link)
6. Shared boards are NOT automatically added to favorites (user can manually save if desired)

## Browser Compatibility

- **Encoding:** Works in all modern browsers (ES6+)
- **Clipboard API:** Falls back to modal if unavailable
- **No external dependencies:** Pure vanilla JavaScript

## Future Considerations

If URL length becomes an issue with very long station names:
- Consider truncating station names to 50 chars for URL only
- Store full name in localStorage after decode
- Or implement additional compression (LZ-string, etc.)

Current URLs are well within reasonable limits:
- Typical: 151 bytes (comfortable for all platforms)
- Worst-case: 227 bytes (still well under 2000 char URL limit)
