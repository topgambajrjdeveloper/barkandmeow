// Service Worker para manejar notificaciones push

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
  
  self.addEventListener("notificationclick", (event) => {
    event.notification.close()
  
    // Navegar a una URL específica cuando se hace clic en la notificación
    if (event.notification.data && event.notification.data.url) {
      event.waitUntil(clients.openWindow(event.notification.data.url))
    } else {
      // Si no hay URL específica, abrir la aplicación
      event.waitUntil(
        clients.matchAll({ type: "window" }).then((clientList) => {
          if (clientList.length > 0) {
            // Si ya hay una ventana abierta, enfocarla
            return clientList[0].focus()
          }
          // Si no hay ventanas abiertas, abrir una nueva
          return clients.openWindow("/")
        }),
      )
    }
  })
  
  