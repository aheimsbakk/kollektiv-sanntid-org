const VERSION = '1.0.2';
const CACHE_NAME = `departures-v${VERSION}`;
const ASSETS = [
  './', './index.html', './style.css', './app.js', './manifest.webmanifest'
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

  // For other requests, prefer cache, fallback to network
  ev.respondWith(caches.match(req).then(r => r || fetch(req)));
});
