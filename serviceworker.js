importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "pwabuilder-page-v1";

// Use your real offline fallback (your homepage works best)
const offlineFallbackPage = "./index.html";

// Allow instant update
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Install: cache offline page
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll([
        "./index.html",
        "./manifest.json"
      ]);
    })
  );
  self.skipWaiting();
});

// Enable navigation preload (faster loads)
if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// Fetch handler (offline fallback system)
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          // Try preload first
          const preloadResp = await event.preloadResponse;
          if (preloadResp) return preloadResp;

          // Then network
          return await fetch(event.request);

        } catch (error) {
          // Offline fallback
          const cache = await caches.open(CACHE);
          return await cache.match(offlineFallbackPage);
        }
      })()
    );
  }
});
