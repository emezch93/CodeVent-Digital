const CACHE_VERSION = 'v5';
const SHELL_CACHE   = `codevent-shell-${CACHE_VERSION}`;
const PAGES_CACHE   = `codevent-pages-${CACHE_VERSION}`;
const ALL_CACHES    = [SHELL_CACHE, PAGES_CACHE];

/* ── Assets to pre-cache on install ─────────────────────────────────────── */
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

/* ── Install: pre-cache shell ────────────────────────────────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache => {
      return cache.addAll(
        SHELL_ASSETS.map(url => new Request(url, { cache: 'reload' }))
      );
    }).then(() => self.skipWaiting())   // activate immediately
  );
});

/* ── Activate: prune old caches ──────────────────────────────────────────── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => !ALL_CACHES.includes(key))
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())  // take control without reload
  );
});

/* ── Fetch: routing logic ────────────────────────────────────────────────── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and browser-extension requests
  if (request.method !== 'GET') return;
  if (!['http:', 'https:'].includes(url.protocol)) return;

  // External third-party requests (Google, WhatsApp, FB…) → network-only
  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(request).catch(() => new Response('', { status: 503 })));
    return;
  }

  const isHTML = request.headers.get('accept')?.includes('text/html');

  if (isHTML) {
    // Network-First for HTML pages; serve cache on failure; offline page as last resort
    event.respondWith(networkFirst(request));
  } else {
    // Cache-First for all static assets (CSS, JS, images, fonts, icons)
    event.respondWith(cacheFirst(request));
  }
});

/* ── Strategies ──────────────────────────────────────────────────────────── */
async function networkFirst(request) {
  const cache = await caches.open(PAGES_CACHE);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Final fallback: offline page
    const shellCache = await caches.open(SHELL_CACHE);
    return shellCache.match('offline.html');
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    return new Response('Asset unavailable offline.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

/* ── Background Sync: queue failed form submissions ──────────────────────── */
self.addEventListener('sync', event => {
  if (event.tag === 'codevent-retry-requests') {
    event.waitUntil(replayFailedRequests());
  }
});

async function replayFailedRequests() {
  // Placeholder — extend with IndexedDB queue if you add a contact form POST
  console.log('[SW] Background sync fired — codevent-retry-requests');
}

/* ── Push Notifications (future-ready) ───────────────────────────────────── */
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'CodeVent Digital', {
      body: data.body || 'New update from CodeVent!',
      icon: 'icons/icon-192x192.png',
      badge: 'icons/icon-96x96.png',
      data: { url: data.url || './' }
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = event.notification.data?.url || './';
  event.waitUntil(clients.openWindow(target));
});

/* ── Periodic update check message ───────────────────────────────────────── */
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: CACHE_VERSION });
  }
});
