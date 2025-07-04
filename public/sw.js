const CACHE_NAME = "seu-planejamento-v1"
const urlsToCache = [
  "/",
  "/logo-seu-planejamento.png",
  "/logo-seu-planejamento-branco.png",
  "/app-dashboard.png",
  "/app-analytics.png",
  "/app-history.png",
]

// URLs que NÃO devem ser interceptadas pelo SW
const BYPASS_URLS = ["supabase.co", "mercadopago.com", "mercadolibre.com", "api/", "auth/", "webhook"]

// Função para verificar se deve interceptar a URL
function shouldIntercept(url) {
  return !BYPASS_URLS.some((bypass) => url.includes(bypass))
}

// Instalar Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache aberto")
      return cache.addAll(urlsToCache)
    }),
  )
})

// Interceptar requisições - CORRIGIDO
self.addEventListener("fetch", (event) => {
  // NÃO interceptar URLs do Supabase, APIs e webhooks
  if (!shouldIntercept(event.request.url)) {
    return // Deixa a requisição passar normalmente
  }

  // Só interceptar recursos estáticos
  if (
    event.request.method === "GET" &&
    (event.request.destination === "document" ||
      event.request.destination === "image" ||
      event.request.destination === "style" ||
      event.request.destination === "script")
  ) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Retornar do cache se disponível
        if (response) {
          return response
        }
        return fetch(event.request)
      }),
    )
  }
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
