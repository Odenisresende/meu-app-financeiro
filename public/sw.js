const CACHE_NAME = "seu-planejamento-v1"
const urlsToCache = [
  "/",
  "/logo-seu-planejamento.png",
  "/logo-seu-planejamento-branco.png",
  "/app-dashboard.png",
  "/app-analytics.png",
  "/app-history.png",
]

// Instalar Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache aberto")
      return cache.addAll(urlsToCache)
    }),
  )
})

// Interceptar requisições
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retornar do cache se disponível
      if (response) {
        return response
      }
      return fetch(event.request)
    }),
  )
})

// Atualizar Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Removendo cache antigo:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

// Notificações push (futuro)
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "Nova notificação do Seu Planejamento",
    icon: "/logo-seu-planejamento.png",
    badge: "/logo-seu-planejamento.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Ver detalhes",
        icon: "/logo-seu-planejamento.png",
      },
      {
        action: "close",
        title: "Fechar",
        icon: "/logo-seu-planejamento.png",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("Seu Planejamento", options))
})

// Clique em notificação
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"))
  }
})
