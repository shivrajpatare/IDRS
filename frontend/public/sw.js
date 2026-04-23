const CACHE_NAME = 'idrs-cache-v1';
const DYNAMIC_CACHE = 'idrs-dynamic-v1';

const PRECACHE_ASSETS = [
  '/citizen',
  '/index.html',
  'https://cartodb-basemaps-c.global.ssl.fastly.net/dark_all/13/6000/3800.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
          return caches.delete(key);
        }
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  // Cache-first strategy for map tiles
  if (event.request.url.includes('cartodb-basemaps')) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request).then(res => {
        const resClone = res.clone();
        caches.open(DYNAMIC_CACHE).then(cache => cache.put(event.request, resClone));
        return res;
      }))
    );
    return;
  }

  // Stale-while-revalidate for APIs
  if (event.request.url.includes('/api/v1/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        }).catch(() => cachedResponse);
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default Network-First for other things
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
