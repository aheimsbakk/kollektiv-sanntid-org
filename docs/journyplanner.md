This guide describes how an automated agent can fetch **real-time departure information** (estimates, delays, and platform changes) using the Entur JourneyPlanner API.

### **1. API Essentials**

* **Endpoint:** `https://api.entur.io/journey-planner/v3/graphql`
* **Method:** `POST`
* **Content-Type:** `application/json`
* **Required Header:** `ET-Client-Name`
* *Format:* `<company>-<application>` (e.g., `mycompany-travelassistant`)
* *Note:* Requests without this header may be blocked or rate-limited.



### **2. Core Concept: `estimatedCalls**`

To get real-time data, you do not query a separate "real-time" endpoint. Instead, you query the **`stopPlace`** and request its **`estimatedCalls`**.

* **`aimedDepartureTime`**: The original scheduled time (from the timetable).
* **`expectedDepartureTime`**: The real-time predicted time.
* If the vehicle is **on time**, these two timestamps will be identical.
* If the vehicle is **delayed**, `expected` will be later than `aimed`.


* **`realtime`**: A boolean flag.
* `true`: The `expectedDepartureTime` is based on live GPS/feed data.
* `false`: No live contact; `expectedDepartureTime` falls back to the schedule.



### **3. The GraphQL Query**

The agent should generate a JSON payload containing this query.

**Variables to inject:**

* `$id`: The StopPlace ID (e.g., `NSR:StopPlace:59872` from the Geocoder API).
* `$numberOfDepartures`: Integer (e.g., 10).

**Query String:**

```graphql
query getRealTimeDepartures($id: String!, $numberOfDepartures: Int!) {
  stopPlace(id: $id) {
    id
    name
    estimatedCalls(numberOfDepartures: $numberOfDepartures, includeCancelledTrips: true) {
      realtime
      aimedDepartureTime
      expectedDepartureTime
      actualDepartureTime
      cancellation
      predictionInaccurate
      destinationDisplay {
        frontText
      }
      quay {
        id
        publicCode
      }
      serviceJourney {
        journeyPattern {
          line {
            id
            publicCode
            transportMode
          }
        }
      }
      situations {
        summary {
          value
          language
        }
        description {
          value
          language
        }
      }
    }
  }
}

```

### **4. Response Parsing Logic**

The agent should implement the following logic when processing the `data.stopPlace.estimatedCalls` array:

1. **Check Status:**
* If `cancellation` is `true`, mark the trip as **CANCELLED**.
* If `realtime` is `false`, mark the trip as **SCHEDULED ONLY** (approximate).


2. **Calculate Delay:**
* Parse `aimedDepartureTime` and `expectedDepartureTime` into Date objects.
* `Delay = expectedDepartureTime - aimedDepartureTime`.
* *Agent Hint:* If Delay > 0, the bus is late. If Delay < 0, it is early.


3. **Identify Platform:**
* Read `quay.publicCode`. This is the platform number displayed to humans (e.g., "3" or "A").


4. **Handle Disruptions:**
* If the `situations` array is not empty, extract the `summary.value` text. This contains critical alerts (e.g., "Rail replacement bus", "Track work").



### **5. Example Request Body**

To fetch the next 5 departures for Oslo S (`NSR:StopPlace:59872`), the agent should send:

```json
{
  "query": "query getRealTimeDepartures($id: String!, $numberOfDepartures: Int!) { stopPlace(id: $id) { name estimatedCalls(numberOfDepartures: $numberOfDepartures, includeCancelledTrips: true) { realtime aimedDepartureTime expectedDepartureTime cancellation destinationDisplay { frontText } quay { publicCode } serviceJourney { journeyPattern { line { publicCode transportMode } } } } } }",
  "variables": {
    "id": "NSR:StopPlace:59872",
    "numberOfDepartures": 5
  }
}

```