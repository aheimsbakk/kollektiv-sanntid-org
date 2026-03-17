To display a specific location with a marker (flag) using the **Transport Layer** on OpenStreetMap, you need to use the `layers` parameter in the URL.

The Transport Layer (Thunderforest) is represented by the letter **`T`** in OSM's URL structure.

### The URL Structure
To show a marker at a specific coordinate with the transport map active, use this format:

`https://www.openstreetmap.org/?mlat=[LAT]&mlon=[LON]&zoom=[1-19]&layers=T`

* **`mlat` & `mlon`**: Sets the "Marker Latitude/Longitude" (the actual flag).
* **`layers=T`**: Forces the map to use the **Transport Map** layer instead of the standard one.
* **`zoom`**: Usually, **15** or **16** is best for seeing transit stops and details.

---

### Concrete Example: Oslo Central Station
If you want to point to Oslo Central Station specifically on the Transport Layer:

**The URL:**
`https://www.openstreetmap.org/?mlat=59.9111&mlon=10.7528&zoom=16&layers=T`

### Comparison of Layers
If you want to toggle between different looks, you can change the `layers` letter:

| Layer Name | URL Parameter | Description |
| :--- | :--- | :--- |
| **Standard** | (None or `layers=M`) | Default map. |
| **Transport** | `layers=T` | Highlights train lines, bus stops, and hubs. |
| **Cycle Map** | `layers=C` | Highlights bike paths and terrain. |
| **Humanitarian** | `layers=H` | Focused on infrastructure and resources. |

---

### Pro Tip: Adding a Label
OpenStreetMap's basic URL doesn't allow a custom text label inside the "flag" via the URL alone. However, if you are using this for a website or a quick share, the **Transport Layer** is excellent because it automatically renders the icons for train stations and bus stops underneath your marker.

**Would you like me to show you how to embed this specific transport map into a website using a small piece of HTML (an iframe)?**


Zoom-nivået i OpenStreetMap (og de fleste andre digitale kart) fungerer logaritmisk. Det betyr at for hvert trinn du zoomer inn, dobles detaljnivået, og arealet du ser på skjermen halveres.

Zoom-skalaen går vanligvis fra **0** (hele verden) til **19** (veldig detaljert gatenivå).

### Slik beregner du zoom for en 500 meter radius
Hvis du ønsker å se en radius på 500 meter, betyr det at du vil ha et kartutsnitt som dekker totalt **1000 meter (1 km)** på tvers.

For en vanlig mobilskjerm eller en bærbar PC, vil følgende zoom-nivåer gi deg omtrent dette utsnittet:

* **Zoom 15:** Dekker ca. 1.5 – 2 km på tvers. Dette gir deg god oversikt over nabolaget med din posisjon i midten og 500 m radius godt innenfor kantene.
* **Zoom 16:** Dekker ca. 800 m – 1 km på tvers. Dette er det mest presise nivået hvis du vil at 500 meter radiusen skal fylle nesten hele skjermbredden.



### Hvorfor varierer det?
Det er viktig å huske at 500 meter ser "lengre" ut på kartet jo lenger unna ekvator du befinner deg (på grunn av Mercator-projeksjonen).
* Ved **Ekvator**: Zoom 16 er ca. 2,3 meter per piksel.
* I **Oslo**: Zoom 16 er ca. 1,1 meter per piksel.

**Konklusjon for Norge:** Bruk **`zoom=16`** i URL-en din for å få et utsnitt som tilsvarer omtrent 500 meter til hver side fra markøren.

### Eksempel-URL (Transportlag med 500m utsnitt):
`https://www.openstreetmap.org/?mlat=59.9111&mlon=10.7528&zoom=16&layers=T`

### Tabell over Zoom-nivåer (ca. verdier for Norge):
| Zoom-nivå | Synlig bredde på skjerm | Bruksområde |
| :--- | :--- | :--- |
| **13** | ca. 8 km | Hele byen |
| **14** | ca. 4 km | Bydel |
| **15** | ca. 2 km | Nabolag |
| **16** | ca. 1 km | **500m radius (Anbefalt)** |
| **17** | ca. 500 m | Noen få kvartaler |
| **18** | ca. 250 m | Enkeltbygninger |
