// Service Worker — Softnova Wallet PWA
// Strategy:
//   /_next/static/*  → Cache-first  (immutable content-hashed assets)
//   /api/*           → Network-only → offline JSON 503 on failure
//   pages/documents  → Network-first → precached shell fallback (no live caching)
//   other same-origin → Network-first → no caching while online
//
// The registration URL includes ?v=<build-timestamp> (set in pwa-register.tsx).
// A new URL on each deploy means a new SW is installed with a new CACHE name,
// so the activate step always finds and deletes the previous build's cache.
const BUILD_ID = new URL(self.location.href).searchParams.get("v") || "dev";
const CACHE = `softnova-wallet-${BUILD_ID}`;

const PRECACHE = [
  "/",
  "/manifest.json",
  "/icons/favicon-for-public/web-app-manifest-192x192.png",
  "/icons/favicon-for-public/web-app-manifest-512x512.png",
];

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(PRECACHE).catch((err) => {
        // Non-fatal: log and continue — SW still activates
        console.warn("[SW] Pre-cache partial failure:", err);
      })
    )
  );
  // Activate immediately without waiting for old tabs to close
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      // Delete every cache that isn't the current version
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE)
            .map((k) => {
              console.log("[SW] Deleting old cache:", k);
              return caches.delete(k);
            })
        )
      ),
      // Take control of all open pages immediately
      self.clients.claim(),
    ])
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // ── External requests: pass through untouched ──────────────────────────
  if (url.origin !== self.location.origin) return;

  // ── API routes: network-only, structured offline response ──────────────
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(
          JSON.stringify({
            error: "offline",
            message: "You are offline. Please check your connection and try again.",
          }),
          {
            status: 503,
            headers: {
              "Content-Type": "application/json",
              "X-SW-Offline": "1",
            },
          }
        )
      )
    );
    return;
  }

  // ── Next.js static assets: cache-first (immutable, content-hashed) ─────
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // ── Pages and everything else: network-first, offline shell fallback ────
  // IMPORTANT: do NOT write page HTML into the cache while online.
  // Next.js page shells reference content-hashed JS/CSS chunks. Caching them
  // means a deploy with new chunk hashes will serve stale HTML pointing at
  // URLs that no longer exist on the CDN, showing the old version of the app
  // until a hard reload. The precached "/" shell is the only document fallback
  // needed for offline navigation.
  event.respondWith(
    fetch(request)
      .then((response) => response)
      .catch(async () => {
        // For document navigations fall back to the precached shell
        if (request.destination === "document") {
          const shell = await caches.match("/");
          if (shell) return shell;
        }

        return new Response("Offline", {
          status: 503,
          headers: { "Content-Type": "text/plain" },
        });
      })
  );
});

// ── Push notifications ────────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Softnova Wallet", {
      body: data.body || "You have a new notification",
      icon: "/icons/favicon-for-public/web-app-manifest-192x192.png",
      badge: "/icons/favicon-for-app/icon1.png",
      vibrate: [200, 100, 200],
      tag: "softnova-notification",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
