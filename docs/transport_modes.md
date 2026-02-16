This guide provides a definitive mapping between the **JourneyPlanner** (which outputs transport modes) and the **Geocoder** (which requires specific categories to filter search results).

### **1. The Core Concept**

* **JourneyPlanner (Output):** Uses a simplified Enum called `transportMode` (e.g., `bus`, `rail`). This is what you see in the `estimatedCalls` response.
* **Geocoder (Input):** Uses granular `categories` (e.g., `onstreetBus`, `railStation`). This is what you must use to find the correct `stopPlace` ID.

### **2. The Mapping Table**

Use this table to translate a user's request (e.g., "Find a train station") or a JourneyPlanner mode into the correct Geocoder query parameters.

| User/JP Mode | **JourneyPlanner Enum** (`transportMode`) | **Geocoder Categories** (Required for filtering) | **Notes** |
| --- | --- | --- | --- |
| **Bus** | `bus` | `onstreetBus`, `busStation` | Most common mode. Includes local stops and terminals. |
| **Coach** | `coach` | `coachStation`, `busStation` | Long-distance buses. |
| **Tram** | `tram` | `onstreetTram`, `tramStation` | Streetcars/Light rail. |
| **Train / Rail** | `rail` | `railStation` | Heavy rail/Commuter trains. |
| **Metro / Subway** | `metro` | `metroStation` | Subway systems (e.g., Oslo T-bane). |
| **Ferry / Boat** | `water` | `harbourPort`, `ferryPort`, `ferryStop` | Includes passenger ferries and car ferries. |
| **Plane** | `air` | `airport` | Major airports. |
| **Gondola / Funicular** | `gondola`, `funicular` | `liftStation` | Cable cars and funiculars. |

### **3. Logic for Agents**

#### **Scenario A: User requests a specific mode**

* **User Input:** "Find the nearest metro station to the Opera House."
* **Agent Action:**
1. Identify mode: `Metro`.
2. Lookup Geocoder Categories: `metroStation`.
3. Construct Geocoder Query:
```http
GET /autocomplete?text=Opera&layers=venue&categories=metroStation

```





#### **Scenario B: Filtering JourneyPlanner results**

* **Goal:** The user wants to see *only* bus departures from a specific stop.
* **Agent Action:**
1. Fetch *all* departures using the standard JourneyPlanner query.
2. **Client-Side Filter:** Iterate through the `estimatedCalls` array.
3. **Check:** `serviceJourney.journeyPattern.line.transportMode` == `bus`.
4. Discard non-matching results.



### **4. Edge Cases**

* **Multimodal Hubs:** Large stations (e.g., "Oslo S") act as parent stations for Trains, Buses, and Trams.
* *Geocoder Behavior:* Searching for `Oslo S` with `categories=railStation` works. Searching with `categories=busStation` might *not* return the main "Oslo S" object, but rather a specific bus terminal attached to it.
* *Agent Strategy:* If searching for a major hub, use fewer filters (or `multiModal=parent`) to find the main ID, then let the JourneyPlanner filter the actual departures.


* **"Coach" vs "Bus":** In the JourneyPlanner, `coach` (long distance) and `bus` (local) are distinct modes. However, in the physical world (Geocoder), they often share `busStation` facilities. Always include `busStation` when searching for `coach` stops.