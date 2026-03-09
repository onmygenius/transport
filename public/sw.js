// Versiune cache - INCREMENTEAZĂ LA FIECARE DEPLOY
const CACHE_VERSION = 'v2';
const CACHE_NAME = `freightex-${CACHE_VERSION}`;
const urlsToCache = [
  '/logo-pwa.png'
];

// INSTALL: Cache assets statice
self.addEventListener('install', (event) => {
  // Skip waiting - activează imediat noua versiune
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// ACTIVATE: Șterge cache-uri vechi și preia controlul imediat
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Preia controlul imediat peste toate tab-urile
      return self.clients.claim();
    })
  );
});

// FETCH: Strategy inteligentă bazată pe tip request
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. NU CACHE-A API calls și Supabase
  if (url.pathname.startsWith('/api/') || 
      url.hostname.includes('supabase.co') ||
      url.hostname.includes('googleapis.com')) {
    event.respondWith(fetch(request));
    return;
  }

  // 2. NETWORK-FIRST pentru HTML (navigare)
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache response-ul pentru offline
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback la cache dacă offline
          return caches.match(request)
            .then(cached => cached || caches.match('/'));
        })
    );
    return;
  }

  // 3. CACHE-FIRST pentru assets statice (JS, CSS, images)
  event.respondWith(
    caches.match(request)
      .then(cached => {
        if (cached) {
          return cached;
        }
        return fetch(request).then(response => {
          // Cache doar response-uri valide
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
  );
});

// MESSAGE: Comunică cu client pentru reload
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
