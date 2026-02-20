const VERSION = '1.15.7';
const CACHE_NAME = `departures-v${VERSION}`;
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './config.js',
  './entur.js',
  './i18n.js',
  './time.js',
  './ui/ui.js',
  './ui/departure.js',
  './ui/header.js',
  './ui/options.js',
  './ui/station-dropdown.js',
  './ui/theme-toggle.js',
  './manifest.webmanifest'
];

// Install: cache core assets. Do NOT call skipWaiting here so we can
// prompt users before activating a new worker.
self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

// Activate: claim clients and remove old caches
self.addEventListener('activate', (ev) => {
  ev.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => { if (k !== CACHE_NAME) return caches.delete(k); }));
    await clients.claim();
  })());
});

// Listen for messages from the page (e.g. SKIP_WAITING)
self.addEventListener('message', (ev) => {
  if (!ev.data) return;
  if (ev.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch: use network-first for navigation requests so users get fresh HTML,
// fall back to cache when offline. For other requests prefer cache-first.
self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  const isNavigation = req.mode === 'navigate' || (req.method === 'GET' && req.headers.get('accept') && req.headers.get('accept').includes('text/html'));
  if (isNavigation) {
    ev.respondWith((async () => {
      try {
        const netRes = await fetch(req);
        // update the cache with the latest HTML
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, netRes.clone()).catch(()=>{});
        return netRes;
      } catch (e) {
        const cached = await caches.match(req) || await caches.match('./');
        return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    })());
    return;
  }

  // For other requests (CSS, JS, etc), use cache-first from the current versioned cache only
  ev.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    if (cached) return cached;
    
    try {
      const netRes = await fetch(req);
      // Cache the response for future use
      cache.put(req, netRes.clone()).catch(()=>{});
      return netRes;
    } catch (e) {
      // Offline and not in cache
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    }
  })());
});
