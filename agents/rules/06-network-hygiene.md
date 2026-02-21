# Rule: Network & API Hygiene
1. DEBOUNCING: Any API request triggered by continuous user input (like keystrokes in a search/autocomplete field) MUST be debounced (e.g., 250ms - 500ms) to prevent backend flooding.
2. RACE CONDITIONS: Always validate that an asynchronous API response matches the current application state (e.g., the current search input value) before rendering the data. Discard stale responses immediately.
