const CACHE_NAME = 'trackwave-v1';
const ASSETS = [
  '/trackwave/',
  '/trackwave/index.html',
  '/trackwave/manifest.json',
  '/trackwave/icon-192.png',
  '/trackwave/icon-512.png'
];

// Installation : mise en cache des ressources statiques
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activation : suppression des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch : réseau d'abord, cache en fallback
self.addEventListener('fetch', event => {
  // Firebase et tuiles de carte : toujours réseau
  if (event.request.url.includes('firebase') ||
      event.request.url.includes('openstreetmap') ||
      event.request.url.includes('googleapis')) {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
