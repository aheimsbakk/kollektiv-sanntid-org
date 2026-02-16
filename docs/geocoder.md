This guide details how to construct requests to the **Entur Geocoder API** to fetch transport places (stops/stations) filtered by specific transport modes.

### **Context for Agents**

* **Goal:** Resolve a user's location query (e.g., "Nationaltheatret") into a **StopPlace ID** (e.g., `NSR:StopPlace:59872`) suitable for use with the **JourneyPlanner API**.
* **Constraint:** The results must be limited to places serving specific transport modes (Bus, Tram, Metro, Rail, Water).
* **Key Challenge:** The Geocoder API uses **Categories** (e.g., `onstreetBus`), which differ from the simplified **Modes** (e.g., `bus`) used in the JourneyPlanner.

---

### **1. Endpoint Specification**

**Base URL:**

```http
https://api.entur.io/geocoder/v1/autocomplete

```

**Required Headers:**

* `ET-Client-Name`: `String` (Required). Identity of the client.
* *Format:* `<company>-<application>`
* *Example:* `mycompany-travelplanner`



---

### **2. Query Parameters**

To filter effectively, you must combine the `layers` and `categories` parameters.

#### **A. `layers**`

Set this to `venue` to strictly fetch transport stops and stations, ignoring addresses and POIs.

* **Value:** `venue`

#### **B. `categories**`

This parameter filters the venues. You must map the high-level transport mode to the specific Geocoder categories. **Do not use generic names like "bus" or "train".**

**Mapping Table:**

| Desired Mode | Required Geocoder Categories (CSV) |
| --- | --- |
| **Bus** | `onstreetBus,busStation,coachStation` |
| **Tram** | `onstreetTram,tramStation` |
| **Metro** | `metroStation` |
| **Rail** (Train) | `railStation` |
| **Water** | `harbourPort,ferryPort,ferryStop` |

**Composite Example:**
To fetch **all** requested modes (Bus, Tram, Metro, Rail, Water), construct the string:

```text
onstreetBus,busStation,coachStation,onstreetTram,tramStation,metroStation,railStation,harbourPort,ferryPort,ferryStop

```

#### **C. `multiModal` (Crucial for Hubs)**

Entur's data model separates "Parent Stations" (the main hub, e.g., "Oslo S") from "Child Stops" (specific platforms/quays).

* **Issue:** Category tags (like `railStation`) are often attached to the **Child** stops, not the Parent object.
* **Solution:** You typically want to find the specific platform if the parent doesn't explicitly match the category.
* **Value:** `parent` (default).
* *Warning:* If you filter by `categories=railStation` and the Parent Station object does not have that tag (only its children do), a strict `parent` search might yield zero results for major hubs.
* *Recommendation:* If your search yields no results for a known station, consider appending `&multiModal=all` to include child stops in the search candidates.



---

### **3. Request Construction Example**

**Scenario:** User searches for "Oslo" and wants only **Rail** and **Metro** stations.

**Constructed URL:**

```http
https://api.entur.io/geocoder/v1/autocomplete?text=Oslo&layers=venue&categories=railStation,metroStation&lang=en

```

**Curl Example:**

```bash
curl -X GET "https://api.entur.io/geocoder/v1/autocomplete?text=Oslo&layers=venue&categories=railStation,metroStation" \
     -H "ET-Client-Name: yourcompany-yourapp"

```

---

### **4. Response Parsing Logic**

The API returns a GeoJSON `FeatureCollection`. The Agent should extract the `id` from the `properties` object of the feature.

**Response Structure (Simplified):**

```json
{
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "NSR:StopPlace:59872",   // <--- ID for JourneyPlanner
        "name": "Oslo S",
        "label": "Oslo S, Oslo",
        "category": [
          "railStation",
          "metroStation"
        ]
      }
    }
  ]
}

```

**Actionable Steps for Agent:**

1. **Parse** `features` array.
2. **Extract** `properties.id` (e.g., `NSR:StopPlace:59872`).
3. **Use** this ID in the JourneyPlanner `stopPlace` parameter.