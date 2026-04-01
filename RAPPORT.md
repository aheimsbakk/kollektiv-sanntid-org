# Sikkerhets- og Kvalitetsrapport — Kollektiv.Sanntid.org

**Versjon analysert:** 1.40.18  
**Dato:** 2026-04-01  
**Omfang:** Alle kildefiler i `src/`, konfigurasjon, service worker og HTML.

---

## Sammendrag

| Alvorlighetsgrad | Antall | Status |
| ---------------- | ------ | ------ |
| 🔴 HØY           | 3      | Åpne   |
| 🟡 MEDIUM        | 6      | Åpne   |
| 🟢 LAV           | 4      | Åpne   |

---

## 🔴 HØY

### H1 — XSS via `DEPARTURE_LINE_TEMPLATE`-injeksjon

**Fil:** `src/ui/departure.js`, linje 130–134  
**Problem:** `destinationText` og `lineNumberText` settes inn i `DEPARTURE_LINE_TEMPLATE` via `String.replace()`. Selv om `textContent` brukes for å sette den endelige teksten, og deretter `insertElement()` erstatter plassholdere med DOM-elementer, er det en subtil risiko: hvis `DEPARTURE_LINE_TEMPLATE` i `config.js` noensinne endres til å inneholde HTML, eller hvis `destination` fra Entur API inneholder tekst som matcher plassholder-strengene (`<<<PLATFORM>>>`, `<<<INDICATOR>>>`), kan `insertElement()` oppføre seg uventet.

Mer kritisk: `insertElement()` bruker `document.createTreeWalker` for å finne plassholdere i tekst-noder. Hvis `destinationText` tilfeldigvis inneholder strengen `<<<PLATFORM>>>` eller `<<<INDICATOR>>>`, vil `insertElement()` splitte teksten og sette inn DOM-elementer midt i destinasjonsteksten — noe som gir feil visning og potensielt uventet DOM-struktur.

**Anbefaling:** Bruk unike plassholdere som er garantert ikke forekommer i naturlig tekst (f.eks. UUID-baserte), eller bygg hele DOM-strukturen direkte uten tekst-basert templating.

---

### H2 — Manglende CSP (Content Security Policy)

**Fil:** `src/index.html`  
**Problem:** Applikasjonen har ingen Content Security Policy-header eller `<meta http-equiv="Content-Security-Policy">`-tag. Dette gjør appen sårbar for:

- **XSS:** Hvis noen klarer å injisere skript (f.eks. gjennom Entur API-responser eller localStorage-manipulasjon), vil nettleseren utføre dem.
- **Data-lekkasje:** Uten `default-src` eller `connect-src`-direktiver kan enhver script-kode gjøre vilkårlige nettverksforespørsler.
- **Clickjacking:** Ingen `frame-ancestors`-direktiv.

Siden appen er en ren klient-side PWA som hostes på GitHub Pages, bør CSP settes via `<meta>`-tag i `<head>`.

**Anbefaling:** Legg til en streng CSP:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.entur.io https://www.openstreetmap.org; img-src 'self' data:; manifest-src 'self';"
/>
```

---

### H3 — `atob()` i `decodeSettings()` uten størrelsesbegrensning

**Fil:** `src/ui/share-button.js`, linje 56  
**Problem:** `decodeSettings()` kaller `atob(base64)` uten å begrense lengden på input. En ondsinnet URL med en ekstremt stor `?b=`-parameter kan føre til:

- **Minne-utmattelse (DoS):** `atob()` allokerer minne proporsjonalt med input-størrelsen. En parameter på flere MB kan krasje nettleser-fanen.
- **ReDoS-liknende effekt:** Selv om `atob()` ikke er regex-basert, kan den store allokeringen blokkere hovedtråden.

**Anbefaling:** Legg til en lengdesjekk før `atob()`:

```js
if (encoded.length > 4096) return null; // rimelig grense for base64-innstillinger
```

---

## 🟡 MEDIUM

### M1 — `DEFAULTS`-objektet er muterbart og deles globalt

**Filer:** `src/config.js`, `src/app.js`, `src/app/handlers.js`, `src/app/settings.js`, `src/app/url-import.js`  
**Problem:** `DEFAULTS` eksporteres som et vanlig objekt og muteres direkte av flere moduler (`handlers.js`, `url-import.js`, `settings.js`, `action-bar.js`). Dette skaper flere problemer:

1. **TOCTOU-racer:** Selv om `fetch-loop.js` tar snapshots før `await` (linje 78–84), er det ingen garanti for at andre moduler ikke muterer `DEFAULTS` mellom snapshot og bruk.
2. **Testbarhet:** Det er umulig å teste moduler isolert uten å mocke hele `DEFAULTS`-objektet.
3. **Uventede sideeffekter:** `url-import.js` muterer `DEFAULTS` direkte (linje 46–54) uten validering av GPS-koordinater — i motsetning til `settings.js` som validerer grundig.

**Anbefaling:** Innfør et immutable state-mønster eller et settings-objekt med getter/setter som validerer ved hver mutasjon.

---

### M2 — `url-import.js` mangler validering av GPS-koordinater fra share-URL

**Fil:** `src/app/url-import.js`, linje 53–54  
**Problem:** Når GPS-koordinater importeres fra en share-URL, settes de direkte på `DEFAULTS.LAT` og `DEFAULTS.LON` uten validering:

```js
if (shared.lat != null) DEFAULTS.LAT = shared.lat;
if (shared.lon != null) DEFAULTS.LON = shared.lon;
```

Selv om `decodeSettings()` i `share-button.js` validerer koordinater (linje 150–163), er det ingen garanti for at denne valideringen alltid kjøres før `url-import.js` bruker verdiene. Hvis `decodeSettings()` noensinne endres eller omgås, kan ugyldige koordinater ende opp i `DEFAULTS`.

**Anbefaling:** Legg til validering i `url-import.js` også, eller stol utelukkende på `decodeSettings()`s validering og dokumenter avhengigheten eksplisitt.

---

### M3 — Potensiell minnelekkasje i `gps-dropdown.js` ved gjentatte åpninger

**Fil:** `src/ui/gps-dropdown.js`, linje 197–202  
**Problem:** Hver gang GPS-knappen klikkes, opprettes en ny `setTimeout` (`geoFallbackId`, linje 197) som en hard fallback på 12 sekunder. Hvis brukeren raskt åpner og lukker dropdown flere ganger, kan flere fallback-timere stables. Selv om `geoCallbackFired`-flagget forhindrer at de alle fyrer, forblir timerne i minnet til de utløper.

**Anbefaling:** Lagre `geoFallbackId` i en closure-variabel og kall `clearTimeout()` ved nedleggelse eller ny åpning.

---

### M4 — `fetch-loop.js` sin `visibilitychange`-handler kan forårsake dobbel refresh

**Fil:** `src/app/fetch-loop.js`, linje 146–154  
**Problem:** `startRefreshLoop()` fjerner og legger til en ny `visibilitychange`-handler hver gang den kalles (ved stasjonsbytte og innstillingsendring). Selv om koden fjerner den gamle handleren før den legger til en ny (linje 143–144), er det et vindu der både den nye intervallet og wake-up-guard kan trigge `doRefresh()` samtidig hvis `visibilitychange` fyrer rett etter `startRefreshLoop()`.

`fetchInFlight`-guarden (linje 76) forhindrer dobbel fetching, men wake-up-guarden vil likevel kaste bort en `doRefresh()` som returnerer umiddelbart — og resetter `ticksUntilRefresh` i `finally`-blokken (linje 114), noe som kan forstyrre nedtellingen.

**Anbefaling:** La wake-up-guarden respektere `fetchInFlight` og unngå å resette `ticksUntilRefresh` hvis en fetch allerede er i gang.

---

### M5 — `sw.js` cachestrategi for navigasjonsforespørsler kan servere stale HTML

**Fil:** `src/sw.js`, linje 116–139  
**Problem:** Navigasjonsforespørsler bruker network-first med cache-fallback. Hvis nettverket feiler (offline), faller den tilbake til `caches.match(req)` eller `caches.match('./')`. Problemet er at `cache.put(req, netRes.clone())` (linje 130) cachere HTML-responsen uten å sjekke om den er gyldig. Hvis en midlertidig feil (f.eks. 503 fra GitHub Pages) cachelagres, vil påfølgende offline-forsøk servere feilresponsen.

**Anbefaling:** Sjekk `netRes.ok` før `cache.put()`:

```js
if (netRes.ok) cache.put(req, netRes.clone()).catch(...);
```

---

### M6 — `station-autocomplete.js` sin `blur`-handler kan trigge uønsket `onSelect`

**Fil:** `src/ui/options/station-autocomplete.js`, linje 220–234  
**Problem:** Når brukeren taster inn et stasjonsnavn og klikker utenfor input-feltet (f.eks. på en annen knapp), vil `blur`-handleren vente 150 ms og deretter automatisk velge det første kandidatresultatet — selv om brukeren kanskje ikke ønsket å velge noe. Dette kan overskrive en eksisterende stasjonsinnstilling med et feil resultat.

Spesielt problematisk: Hvis brukeren skriver delvis, venter på resultater, og deretter klikker "Apply" eller en annen knapp, vil `blur`-handleren velge det første resultatet før knappens click-handler eksekverer.

**Anbefaling:** Sjekk om `document.activeElement` er en interaktiv element (knapp, lenke) i blur-handlerens timeout, og hopp over auto-select i så fall.

---

## 🟢 LAV

### L1 — `detectModeFromRaw()` i `modes.js` har potensiell uendelig løkke

**Fil:** `src/entur/modes.js`, linje 94–122  
**Problem:** Den rekursive dype skanningen bruker en `seen`-Set for å unngå sykluser, men sjekker kun objektreferanser (`seen.has(cur)`). Hvis API-responsen inneholder primitive verdier som dukker opp mange ganger (f.eks. den samme strengen i tusenvis av noder), vil hver forekomst behandles individuelt. I praksis er dette neppe et problem med Entur API-responser, men det er teoretisk mulig med en ondsinnet eller feilaktig respons.

**Anbefaling:** Legg til en maksimal dybde- eller nodegrense (f.eks. 500 noder) som en sikkerhetsventil.

---

### L2 — `scroll-more.js` lytter på `window` for `mousemove`, `mouseup` og `wheel`

**Fil:** `src/app/scroll-more.js`, linje 286–289  
**Problem:** Tre `window`-lyttere er aktive så lenge appen kjører. Selv om de fjernes korrekt i `destroy()`, betyr det at hver musebevegelse og scroll-hendelse på hele siden trigge en funksjonssjekk (`if (!pointerActive) return;`). På mobile enheter med begrenset CPU kan dette bidra til unødvendig batteribruk.

**Anbefaling:** Vurder å legge til lytterne kun når `pointerActive === true` og fjern dem ved `onPointerEnd`.

---

### L3 — Manglende `rel="noopener"` på OSM-lenke

**Fil:** `src/ui/osm-button.js`, linje 108  
**Problem:** `window.location.href = buildOsmUrl(...)` navigerer i samme fane, så `rel="noopener"` er ikke relevant her. Men hvis dette noensinne endres til `window.open()`, må `noopener` legges til for å forhindre tabnabbing.

**Status:** Ikke et aktivt problem, men verdt å merke seg for fremtidige endringer.

---

### L4 — `theme-toggle.js` sin `mediaQuery`-lytter fjernes kun ved `button.destroy()`

**Fil:** `src/ui/theme-toggle.js`, linje 162–169  
**Problem:** `initTheme()` (linje 175–178) kalles ved oppstart og kaller `applyTheme()` uten å opprette en knapp. `createThemeToggle()` oppretter lytteren og eksponerer `destroy()`, men `app.js` kaller aldri `themeBtn.destroy()`. Ved BFCache-restore eller side-navigasjon kan lytteren bli hengende.

**Anbefaling:** Kall `themeBtn.destroy()` i `pagehide`-handleren i `app.js`, på samme måte som for `stationDropdown` og `gps-dropdown`.

---

## ✅ Styrker ved kodebasen

Følgende områder er godt implementert og følger repoets regler:

| Område                               | Vurdering                                                                                                                                     |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Input-validering i `settings.js`** | Grundig validering av alle localStorage-verdier med type-sjekk, område-sjekk og `Number.isFinite()`                                           |
| **TOCTOU-guard i `fetch-loop.js`**   | Snapshots av `DEFAULTS` tas før første `await` — korrekt håndtering av race conditions                                                        |
| **Event listener cleanup**           | `destroy()`-metoder i `station-dropdown`, `gps-dropdown`, `scroll-more`, `panel-lifecycle` og `theme-toggle` fjerner dokument-lyttere korrekt |
| **BFCache-håndtering**               | `pageshow` med `event.persisted` og `pagehide` med listener-fjerning er korrekt implementert                                                  |
| **Service Worker**                   | Versjonert cache-navn, `cache: 'reload'` ved install, korrekt fjerning av gamle cacher                                                        |
| **XSS-forebygging**                  | `textContent` brukes konsekvent i stedet for `innerHTML` i `departure.js`                                                                     |
| **Feilhåndtering**                   | Alle `catch`-blokker har minst `console.warn` — ingen helt tomme catch-blokker (unntatt bevisst ignorerte ikke-kritiske feil)                 |
| **Modulær arkitektur**               | Tydelig separasjon av ansvar: `entur/` for API, `i18n/` for oversettelser, `ui/` for komponenter, `app/` for orkestrering                     |
| **AbortController**                  | `station-autocomplete.js` bruker `AbortController` for å kansellere utdaterte søk — korrekt implementert                                      |
| **Debouncing/throttling**            | Debounce på autocomplete (250 ms), transport-modus (500 ms), scroll-more (600 ms) — alle korrekt implementert                                 |
| **Engelsk-språklige artefakter**     | Alle variabler, funksjoner, kommentarer og commit-meldinger er på engelsk                                                                     |

---

## Regelsamsvar (repo-regler)

| Regel                             | Beskrivelse                                                             | Status                  |
| --------------------------------- | ----------------------------------------------------------------------- | ----------------------- |
| §1 Protocol Alignment             | Følger AGENTS.md og BLUEPRINT.md                                        | ✅                      |
| §2 English-Only                   | Alle artefakter på engelsk                                              | ✅                      |
| §3 Strict Scoping                 | Kirurgiske endringer, ingen drive-by refactoring                        | ✅                      |
| §4 Verify Before Acting           | Ingen fabricerte API-kall eller antatte strukturer                      | ✅                      |
| §5 Secrets & Logging              | Ingen hardkodede hemmeligheter, ingen sensitive data i logger           | ✅                      |
| §6 Safe Execution                 | Ingen `eval()`, ingen dynamisk streng-eksekvering                       | ✅                      |
| §7 Authorization                  | Ikke relevant (ingen server-side endpoints)                             | —                       |
| §8 System Isolation               | Ingen globale avhengigheter, ingen `--break-system-packages`            | ✅                      |
| §9 Strict Boundaries & SRP        | God modulær struktur, men `station-dropdown.js` (405 linjer) bryter SRP | ⚠️                      |
| §10 Naming Conventions            | `kebab-case` for filer, konsistent navngiving                           | ✅                      |
| §11 Error Handling                | Alle catch-blokker har logging eller bevisst ignorering                 | ✅                      |
| §12 Network Resilience            | Timeouts på geolocation (10 s), AbortController for søk                 | ✅                      |
| §13 Resource Cleanup              | `destroy()`-metoder for alle komponenter med dokument-lyttere           | ✅ (se L4)              |
| §14 Bounded Caches                | `NUM_FAVORITES` begrenser favorites-listen                              | ✅                      |
| §15 State Management              | Unidireksjonelle mutasjoner, `fetchInFlight`-guard                      | ✅                      |
| §16 Presentation/Logic Separation | DOM-logikk i `ui/`, forretningslogikk i `entur/` og `app/`              | ✅                      |
| §17 Modular File Structure        | De fleste filer under 250 linjer                                        | ⚠️ (se M3 i ANALYZE.md) |
| §18 DRY                           | `ALL_TRANSPORT_MODES` sentralisert, ingen kopiert kode                  | ✅                      |
| §19 Test-Driven Fixes             | 40+ testfiler i `tests/`                                                | ✅                      |
| §20 Workspace Hygiene             | `.gitignore` dekker vanlige artefakter                                  | ✅                      |
| §21 Explicit Registry             | `sw.js` ASSETS-array synkronisert med faktiske filer                    | ✅                      |
| §22 Backward Compatibility        | Re-export shim i `ui/options.js` for backward compat                    | ✅                      |
| §23 Dependencies                  | Ingen eksterne npm-avhengigheter i produksjonskode                      | ✅                      |
| §24 Automation                    | Scripts i `scripts/` med executable bit                                 | ✅                      |
| §25 Strict Templating             | Worklog-format fulgt                                                    | ✅                      |
| §26 Synchronized Docs             | Kode og dokumentasjon matcher                                           | ✅                      |

---

## Anbefalte prioriteringer

1. **H2 (CSP)** — Lav innsats, høy gevinst for sikkerhet
2. **H3 (atob størrelsesgrense)** — Én linje, forhindrer DoS
3. **H1 (XSS via plassholdere)** — Bytt til UUID-baserte plassholdere
4. **M1 (DEFAULTS immutabilitet)** — Større refactor, men forbedrer testbarhet og sikkerhet
5. **M6 (blur auto-select)** — Kan forvirre brukere
6. **L4 (theme-toggle destroy)** — Konsistent med øvrig teardown-mønster
