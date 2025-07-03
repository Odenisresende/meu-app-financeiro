"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MoreVertical, Upload, LogOut, Settings, User, Crown, Smartphone, CreditCard, X } from "lucide-react"
import FileImport from "@/components/file-import"
import PremiumGate from "@/components/premium-gate"
import PremiumOverlay from "@/components/premium-overlay"
import { supabase } from "@/lib/supabase"

interface HeaderMenuProps {
  user: any
  onLogout: () => void
  onImportTransactions: (transactions: any[]) => void
}

export default function HeaderMenu({ user, onLogout, onImportTransactions }: HeaderMenuProps) {
  const [showIntegrations, setShowIntegrations] = useState(false)
  const [showPremiumOverlay, setShowPremiumOverlay] = useState(false)
  const [showSubscriptions, setShowSubscriptions] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [subscriptionData, setSubscriptionData] = useState<any>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
    }

    const handleAppInstalled = () => {
      setCanInstall(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setCanInstall(false)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  // Buscar dados da assinatura quando abrir o modal
  useEffect(() => {
    if (showSubscriptions && user?.id) {
      fetchSubscriptionData()
    }
  }, [showSubscriptions, user?.id])

  const fetchSubscriptionData = async () => {
    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single()

      if (error) {
        console.log("Nenhuma assinatura ativa encontrada")
        setSubscriptionData(null)
      } else {
        setSubscriptionData(data)
      }
    } catch (error) {
      console.error("Erro ao buscar assinatura:", error)
      setSubscriptionData(null)
    }
  }

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      alert(
        'Para instalar o app:\n\nNo celular: Toque no menu do navegador > "Adicionar à tela inicial"\nNo computador: Clique no ícone de instalação na barra de endereços',
      )
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      console.log("App instalado com sucesso!")
    }

    setDeferredPrompt(null)
    setCanInstall(false)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      await supabase.auth.signOut()
      localStorage.clear()
      sessionStorage.clear()
      window.location.reload()
    } catch (error) {
      console.error("Erro no logout:", error)
      window.location.reload()
    }
  }

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        "Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos recursos premium imediatamente.",
      )
    ) {
      return
    }

    setIsCancelling(true)

    try {
      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("Assinatura cancelada com sucesso! Você ainda pode usar os recursos premium até o final do período pago.")
        setShowSubscriptions(false)
        // Recarregar a página para atualizar o status
        window.location.reload()
      } else {
        alert(`Erro ao cancelar assinatura: ${data.error}`)
      }
    } catch (error) {
      console.error("Erro ao cancelar:", error)
      alert("Erro ao cancelar assinatura. Tente novamente.")
    } finally {
      setIsCancelling(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" style={{ color: "#152638" }} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center gap-2 p-2">
            <User className="h-4 w-4" style={{ color: "#152638" }} />
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium" style={{ color: "#152638" }}>
                {user?.user_metadata?.full_name || "Usuário"}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setShowIntegrations(true)} className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" style={{ color: "#152638" }} />
            <span>Importar dados</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleInstallApp} className="cursor-pointer">
            <Smartphone className="mr-2 h-4 w-4" style={{ color: "#152638" }} />
            <span>Instalar App</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShowPremiumOverlay(true)} className="cursor-pointer">
            <Crown className="mr-2 h-4 w-4" style={{ color: "#DDC067" }} />
            <span className="font-medium">Upgrade Premium</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShowSubscriptions(true)} className="cursor-pointer">
            <CreditCard className="mr-2 h-4 w-4" style={{ color: "#152638" }} />
            <span>Assinaturas</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" style={{ color: "#152638" }} />
            <span>Configurações</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            {isLoggingOut ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                <span>Saindo...</span>
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair da conta</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal de Importar dados */}
      <Dialog open={showIntegrations} onOpenChange={setShowIntegrations}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: "#152638" }}>
              <Upload className="h-5 w-5" />
              Importar Dados
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2" style={{ color: "#152638" }}>
                Funcionalidades Disponíveis
              </h4>
              <ul className="text-sm space-y-1" style={{ color: "#152638" }}>
                <li>
                  • <strong>Importação CSV:</strong> Extratos bancários automáticos
                </li>
                <li>
                  • <strong>OCR de Comprovantes:</strong> Digitalização de recibos
                </li>
                <li>
                  • <strong>Categorização IA:</strong> Classificação inteligente
                </li>
                <li>
                  • <strong>Múltiplos Formatos:</strong> CSV, OFX, Imagens
                </li>
              </ul>
            </div>

            <PremiumGate user={user} feature="Importação de arquivos CSV e OCR de comprovantes">
              <FileImport onImportTransactions={onImportTransactions} />
            </PremiumGate>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Assinaturas */}
      <Dialog open={showSubscriptions} onOpenChange={setShowSubscriptions}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: "#152638" }}>
              <CreditCard className="h-5 w-5" />
              Gerenciar Assinatura
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {subscriptionData ? (
              <>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2" style={{ color: "#152638" }}>
                    Plano Atual
                  </h4>
                  <p className="text-sm text-gray-600">
                    {subscriptionData.plan_type === "premium" ? "Premium" : "Básico"} - R$ 17,00/mês
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Status: {subscriptionData.status === "active" ? "Ativo" : "Inativo"}
                  </p>
                  {subscriptionData.subscription_end_date && (
                    <p className="text-xs text-gray-500">
                      Válido até: {formatDate(subscriptionData.subscription_end_date)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleCancelSubscription}
                    variant="destructive"
                    className="w-full"
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Cancelando...
                      </>
                    ) : (
                      <>
                        <X className="mr-2 h-4 w-4" />
                        Cancelar Assinatura
                      </>
                    )}
                  </Button>

                  <Button onClick={() => setShowSubscriptions(false)} variant="outline" className="w-full">
                    Fechar
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600">Nenhuma assinatura ativa encontrada</p>
                <Button onClick={() => setShowSubscriptions(false)} variant="outline" className="mt-4">
                  Fechar
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Premium Overlay */}
      {showPremiumOverlay && <PremiumOverlay user={user} onClose={() => setShowPremiumOverlay(false)} />}
    </>
  )
}
