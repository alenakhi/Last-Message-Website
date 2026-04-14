// The Last Message — Service Worker
const CACHE_NAME = 'tlm-cache-v1';

// Core assets to cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install — precache core files
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE_URLS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Activate — clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function(name) { return name !== CACHE_NAME; })
          .map(function(name) { return caches.delete(name); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch — network first, fall back to cache
self.addEventListener('fetch', function(event) {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests (fonts, CDN images, YouTube, etc.)
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(function(networkResponse) {
        // Cache a clone of successful responses
        if (networkResponse && networkResponse.status === 200) {
          var responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(function() {
        // Network failed — serve from cache
        return caches.match(event.request).then(function(cachedResponse) {
          if (cachedResponse) return cachedResponse;
          // Fallback to index.html for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

