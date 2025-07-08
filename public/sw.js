const CACHE_NAME = "seu-planejamento-v4"
const urlsToCache = ["/", "/favicon.png", "/logo-seu-planejamento.png", "/logo-seu-planejamento-branco.png"]

// URLs que NÃO devem ser interceptadas
const BYPASS_URLS = [
  "supabase.co",
  "mercadopago.com",
  "mercadolibre.com",
  "api/",
  "auth/",
  "webhook",
  "_next/",
  "__nextjs_original-stack-frame",
  "react.dev",
  "v0.dev",
  "vercel.com",
  "blob.v0.dev",
]

// Função para verificar se deve interceptar
function shouldIntercept(url) {
  return !BYPASS_URLS.some((bypass) => url.includes(bypass))
}

// Instalar Service Worker - MÍNIMO
self.addEventListener("install", (event) => {
  self.skipWaiting()
})

// Ativar Service Worker - MÍNIMO
self.addEventListener("activate", (event) => {
  self.clients.claim()
})

// REMOVER COMPLETAMENTE o fetch listener que está causando erro
// Sem interceptação = sem conflitos
