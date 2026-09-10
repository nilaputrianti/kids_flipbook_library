/* -------------------------------------------------------------
   PUSTAKA TEKNIK CILIK - PWA SERVICE WORKER (OFFLINE CACHE SYSTEM)
   Allows app to open & display saved flipbooks when offline (no internet)
   ------------------------------------------------------------- */

const CACHE_NAME = 'pustaka-teknik-v1.0';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json'
];

// INSTALL EVENT: CACHE CORE APP SHELL
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[PWA SW] Pre-caching static app shell');
            return cache.addAll(STATIC_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// ACTIVATE EVENT: CLEANUP OLD CACHES
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[PWA SW] Removing old cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// FETCH EVENT: SERVE FROM CACHE IF OFFLINE, ELSE FETCH FROM NETWORK & CACHE RESPONSES
self.addEventListener('fetch', (event) => {
    // Only intercept GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Return cached asset immediately
                fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, networkResponse.clone());
                        });
                    }
                }).catch(() => {});
                return cachedResponse;
            }

            // If not in cache, fetch from network and dynamically cache
            return fetch(event.request).then((networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                return networkResponse;
            }).catch(() => {
                // If offline and request is for an HTML page, return cached index.html
                if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('/index.html');
                }
            });
        })
    );
});
