// Cellolog Service Worker - Network First (always fresh data)
const CACHE_NAME = 'cellolog-v2';

self.addEventListener('install', event => {
  self.skipWaiting(); // activate immediately
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k))) // clear all old caches
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Never cache Firebase requests
  if (url.includes('firebase') ||
      url.includes('firestore') ||
      url.includes('googleapis') ||
      url.includes('firebasestorage')) {
    return;
  }

  // For app files: Network first, cache as fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache a copy for offline fallback
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request)) // offline fallback
  );
});
