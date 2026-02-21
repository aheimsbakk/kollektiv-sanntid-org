# Rule: Asset & Cache Synchronization
Whenever you create, rename, or delete an asset file (HTML, CSS, JS, SVG, etc.), you MUST instantly update the project's caching manifest or Service Worker asset array (e.g., `ASSETS` in `sw.js`). Never perform a structural file change without also updating the cache configuration and bumping the application version to invalidate stale caches.
