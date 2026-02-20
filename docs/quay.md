Here is the documentation for an agent or developer to retrieve all `QuayType` enumeration values using the Entur Journey Planner API.

Because Entur uses a standard GraphQL interface, you don't need a dedicated REST endpoint. Instead, you can use a **GraphQL Introspection Query** to ask the schema directly for all valid values of that specific enum.

### API Specification

* **Endpoint:** `https://api.entur.io/journey-planner/v3/graphql`
* **HTTP Method:** `POST`

### Required Headers

Entur has strict access policies to ensure stability. You must identify your application, or the request will be blocked or heavily rate-limited.

* `Content-Type: application/json`
* `ET-Client-Name: <company>-<application>` *(Example: `mycompany-aiagent`)*

### GraphQL Query Payload

To extract the enum values and their associated descriptions, use the `__type` meta-field:

```graphql
query GetQuayTypes {
  __type(name: "QuayType") {
    enumValues {
      name
      description
    }
  }
}

```

### Ready-to-Execute cURL Command

Here is the exact network call formatted for an agent or terminal to execute:

```bash
curl -X POST \
  https://api.entur.io/journey-planner/v3/graphql \
  -H 'Content-Type: application/json' \
  -H 'ET-Client-Name: yourcompany-youragent' \
  -d '{"query": "query { __type(name: \"QuayType\") { enumValues { name description } } }"}'

```

### Expected JSON Response

The API will return a data object containing the array of enum values. It will look similar to this:

```json
{
  "data": {
    "__type": {
      "enumValues": [
        {
          "name": "airlineGate",
          "description": "A gate at an airport."
        },
        {
          "name": "busStop",
          "description": "A stop for buses."
        }
        // ... remaining quay types
      ]
    }
  }
}

```

> **Agent Implementation Note:** If the API returns `null` for `__type`, it usually means the casing of the enum name differs slightly in the current version of the schema (e.g., `QUAY_TYPE` instead of `QuayType`). If that happens, running a full schema introspection (`query { __schema { types { name kind } } }`) will reveal the exact enum name.

Would you like me to write a small Python or Node.js script that executes this call and parses the results?