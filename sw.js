/**
 * CodeVent Digital — sw.js
 */

const CACHE_VERSION = 'cv-v3';
const SHELL_CACHE   = `codevent-shell-${CACHE_VERSION}`;
const PAGES_CACHE   = `codevent-pages-${CACHE_VERSION}`;
const ALL_CACHES    = [SHELL_CACHE, PAGES_CACHE];

const SHELL_ASSETS = [
  './',
  'index.html',
  'learning.html',
  'community.html',
  'shop.html',
  'contact.html',
  'offline.html',
  'manifest.json',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !ALL_CACHES.includes(k)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (!['http:', 'https:'].includes(url.protocol)) return;
  if (url.origin !== self.location.origin) return;

  const isHTML = request.headers.get('accept')?.includes('text/html');
  event.respondWith(isHTML ? networkFirst(request) : cacheFirst(request));
});

async function networkFirst(request) {
  const cache = await caches.open(PAGES_CACHE);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    const cached = await cache.match(request)
      || await caches.match(request);
    return cached || caches.match('offline.html');
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res.ok) (await caches.open(SHELL_CACHE)).put(request, res.clone());
    return res;
  } catch {
    return new Response('Unavailable offline.', { status: 503 });
  }
}

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
