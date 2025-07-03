"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Smartphone, X, Download } from "lucide-react"

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      const isInWebAppChrome = window.matchMedia("(display-mode: standalone)").matches

      return isStandalone || isInWebAppiOS || isInWebAppChrome
    }

    setIsInstalled(checkIfInstalled())

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)

      // Mostrar prompt após 30 segundos se não estiver instalado
      setTimeout(() => {
        if (!checkIfInstalled()) {
          setShowPrompt(true)
        }
      }, 30000)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback para dispositivos que não suportam o prompt automático
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isAndroid = /Android/.test(navigator.userAgent)

      let instructions = ""

      if (isIOS) {
        instructions =
          'Para instalar no iOS:\n1. Toque no botão de compartilhar (□↑)\n2. Selecione "Adicionar à Tela de Início"\n3. Toque em "Adicionar"'
      } else if (isAndroid) {
        instructions =
          'Para instalar no Android:\n1. Toque no menu (⋮) do navegador\n2. Selecione "Adicionar à tela inicial"\n3. Toque em "Adicionar"'
      } else {
        instructions =
          'Para instalar no computador:\n1. Clique no ícone de instalação na barra de endereços\n2. Ou use Ctrl+Shift+A (Chrome)\n3. Clique em "Instalar"'
      }

      alert(instructions)
      setShowPrompt(false)
      return
    }

    try {
      const result = await deferredPrompt.prompt()
      console.log("Install prompt result:", result)

      if (result.outcome === "accepted") {
        console.log("✅ App instalado com sucesso!")
      }
    } catch (error) {
      console.error("Erro ao instalar app:", error)
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Não mostrar novamente nesta sessão
    sessionStorage.setItem("pwa-prompt-dismissed", "true")
  }

  // Não mostrar se já está instalado ou foi dispensado
  if (isInstalled || !showPrompt || sessionStorage.getItem("pwa-prompt-dismissed")) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="border-2 border-[#DDC067] shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#DDC067] rounded-lg">
              <Smartphone className="h-5 w-5" style={{ color: "#152638" }} />
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-sm mb-1" style={{ color: "#152638" }}>
                Instalar App
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Instale o Seu Planejamento na sua tela inicial para acesso rápido e experiência completa!
              </p>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleInstallClick}
                  className="flex-1 text-xs"
                  style={{ backgroundColor: "#DDC067", color: "#152638" }}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Instalar
                </Button>

                <Button size="sm" variant="ghost" onClick={handleDismiss} className="p-2">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
