/**
 * Autonomous Hand-Crafted Service Worker for Portfolio PWA
 * Precaches core assets via Promise.allSettled (never fails install)
 * Guaranteed non-redirected offline navigation response
 * Dynamic runtime caching for static assets
 * Direct network-bypass for /admin*, /api*, /setup*, and /health
 */

const CACHE_NAME = 'gk-portfolio-v3';

const PRECACHE_ASSETS = [
  '/offline.html',
  '/favicon.svg',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable.png',
  '/fonts/inter-variable.woff2',
  '/fonts/mono-regular.woff2',
  '/fonts/material-icons-round.woff2',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Use Promise.allSettled with per-asset caching so installation never fails
      const settled = await Promise.allSettled(
        PRECACHE_ASSETS.map(async (url) => {
          try {
            const res = await fetch(url, { cache: 'no-cache' });
            if (res.ok) {
              // Ensure clean, unredirected response body so browser navigation accepts it
              const body = await res.blob();
              const cleanRes = new Response(body, {
                status: 200,
                statusText: 'OK',
                headers: res.headers,
              });
              await cache.put(url, cleanRes);
            }
          } catch (err) {
          }
        })
      );
      return settled;
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1. Only handle GET requests
  if (req.method !== 'GET') {
    return;
  }

  // 2. Pass-through network bypass for administrative and API endpoints
  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/setup') ||
    url.pathname === '/health'
  ) {
    return;
  }

  // 3. Navigation requests (HTML pages): Network-first with unredirected offline fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((response) => {
          if (response.ok && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;

          // Retrieve offline fallback and verify response.redirected is false
          const offlineRes = await caches.match('/offline.html');
          if (offlineRes) {
            if (offlineRes.redirected) {
              const body = await offlineRes.blob();
              return new Response(body, {
                status: 200,
                statusText: 'OK',
                headers: offlineRes.headers,
              });
            }
            return offlineRes;
          }

          return new Response(
            '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>Offline</title></head><body style="background:#0A0C0B;color:#F4F1E8;font-family:sans-serif;text-align:center;padding:3rem"><h1>Connection Lost</h1><p>You appear to be offline.</p></body></html>',
            { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // 4. Static assets (fonts, images, icons, stylesheets): Cache-first with network fallback
  if (
    url.pathname.startsWith('/fonts/') ||
    url.pathname.startsWith('/_astro/') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((response) => {
          if (response.ok && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Default: direct network fetch
  event.respondWith(fetch(req));
});
