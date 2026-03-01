// Service Worker - Bing Search Automator
const CACHE_NAME = 'bing-auto-v2';

const CORE_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './icons/icon.svg'
];

const OPTIONAL_ASSETS = [
    './icons/icon-192.png',
    './icons/icon-512.png'
];

// Install: cache all assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            await cache.addAll(CORE_ASSETS);
            // Cache optional assets (icons may not exist yet)
            await Promise.allSettled(
                OPTIONAL_ASSETS.map(url =>
                    fetch(url).then(res => res.ok ? cache.put(url, res) : null).catch(() => null)
                )
            );
            return self.skipWaiting();
        })
    );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// Fetch: network-first strategy
self.addEventListener('fetch', (event) => {
    // Only cache same-origin requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Clone and cache the response
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
