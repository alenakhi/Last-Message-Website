importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "pwabuilder-page-v1";
const offlineFallbackPage = "./index.html";

// Safety check (IMPORTANT)
if (self.workbox) {

  const { navigationPreload } = workbox;

  self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
      self.skipWaiting();
    }
  });

  self.addEventListener("install", (event) => {
    event.waitUntil(
      caches.open(CACHE).then((cache) => {
        return cache.addAll([
          "./",
          "./index.html",
          "./manifest.json"
        ]);
      })
    );
    self.skipWaiting();
  });

  self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
  });

  if (navigationPreload && navigationPreload.isSupported()) {
    navigationPreload.enable();
  }

  self.addEventListener("fetch", (event) => {
    if (event.request.mode === "navigate") {
      event.respondWith(
        (async () => {
          try {
            const preloadResp = await event.preloadResponse;
            if (preloadResp) return preloadResp;

            return await fetch(event.request);

          } catch (error) {
            const cache = await caches.open(CACHE);
            return await cache.match(offlineFallbackPage);
          }
        })()
      );
    }
  });
}
