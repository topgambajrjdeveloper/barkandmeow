// Cache names
const CACHE_NAME = "barkandmeow-v1"
const STATIC_CACHE = `${CACHE_NAME}-static`
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`

// Assets to cache
const STATIC_ASSETS = [
  "/",
  "/offline",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/icons/notification-icon.png",
  "/icons/notification-badge.png",
]

// Install event - Cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Caching static assets")
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => self.skipWaiting()),
  )
})

// Activate event - Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName.startsWith(CACHE_NAME) && cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE,
            )
            .map((cacheName) => caches.delete(cacheName)),
        )
      })
      .then(() => self.clients.claim()),
  )
})

// Fetch event - Network first, fallback to cache
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests and browser extensions
  if (event.request.method !== "GET" || event.request.url.startsWith("chrome-extension")) {
    return
  }

  // Skip API requests
  if (event.request.url.includes("/api/")) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response to store in cache
        const responseClone = response.clone()

        // Open dynamic cache and store the response
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(event.request, responseClone)
        })

        return response
      })
      .catch(() => {
        // If network fails, try to serve from cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }

          // If not in cache, serve offline page for HTML requests
          if (event.request.headers.get("accept").includes("text/html")) {
            return caches.match("/offline")
          }

          return new Response("Network error happened", {
            status: 408,
            headers: { "Content-Type": "text/plain" },
          })
        })
      }),
  )
})

// Push notification event
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()

    const options = {
      body: data.body || "Nueva notificación",
      icon: data.icon || "/icons/notification-icon.png",
      badge: data.badge || "/icons/notification-badge.png",
      data: data.data || {},
      actions: data.actions || [],
      vibrate: [100, 50, 100],
      tag: data.tag || "default",
      renotify: data.renotify || false,
    }

    event.waitUntil(self.registration.showNotification(data.title || "BarkAndMeow", options))
  }
})

// Notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  // Navigate to a specific URL when notification is clicked
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url))
  } else {
    // If no specific URL, open the application
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        if (clientList.length > 0) {
          // If a window is already open, focus it
          return clientList[0].focus()
        }
        // If no windows are open, open a new one
        return clients.openWindow("/")
      }),
    )
  }
})

