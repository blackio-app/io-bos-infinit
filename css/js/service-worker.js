// Service Worker for IO BOS
const CACHE_NAME = 'io-bos-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/main.css',
  '/css/redesigned-app.css',
  '/js/app-redesign.js',
  '/js/main.js',
  '/js/carousel-fix.js',
  '/js/profile-editor.js',
  '/js/theme-toggle-enhanced.js',
  '/js/task-progress.js',
  '/js/boardroom-simplified.js',
  '/js/external-agent-connector.js',
  '/images/logo.svg',
  '/images/logo.png',
  '/images/divine-council-color.png',
  '/images/divine-council-bw.png',
  '/images/agents/genesis-avatar.png',
  '/images/agents/exodus-avatar.png',
  '/images/agents/oracle-avatar.png',
  '/images/agents/babylon-avatar.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache resources during install:', error);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(error => {
                console.error('Failed to cache response:', error);
              });

            return response;
          }
        );
      })
      .catch(error => {
        console.error('Fetch failed, returning offline fallback if available:', error);
        return caches.match('/index.html'); // Fallback to index.html for offline
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
