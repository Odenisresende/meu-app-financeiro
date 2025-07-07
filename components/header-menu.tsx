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
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Crown,
  Smartphone,
  CreditCard,
  MessageCircle,
  FileText,
  HelpCircle,
  Download,
  Share2,
  Bell,
  Shield,
  Database,
  Zap,
  MoreVertical,
  Upload,
} from "lucide-react"
import FileImport from "@/components/file-import"
import PremiumGate from "@/components/premium-gate"
import PremiumOverlay from "@/components/premium-overlay"
import { supabase, logout } from "@/lib/supabase"

interface HeaderMenuProps {
  user: any
  onLogout: () => void
  onImportTransactions: (transactions: any[]) => void
}

export default function HeaderMenu({ user, onLogout, onImportTransactions }: HeaderMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showIntegrations, setShowIntegrations] = useState(false)
  const [showPremiumOverlay, setShowPremiumOverlay] = useState(false)
  const [showSubscriptions, setShowSubscriptions] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [subscriptionData, setSubscriptionData] = useState<any>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [canInstall, setCanInstall] = useState(false)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false)
  const [userStats, setUserStats] = useState<any>(null)

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

  useEffect(() => {
    if (user?.id) {
      fetchUserStats()
    }
  }, [user?.id])

  useEffect(() => {
    if (showSubscriptions && user?.id) {
      fetchSubscriptionData()
    }
  }, [showSubscriptions, user?.id])

  const fetchUserStats = async () => {
    try {
      const { data: transactions, error } = await supabase.from("transactions").select("*").eq("user_id", user.id)

      if (!error && transactions) {
        const totalTransactions = transactions.length
        const whatsappTransactions = transactions.filter((t) => t.source === "whatsapp").length
        const csvTransactions = transactions.filter((t) => t.source === "csv").length
        const manualTransactions = transactions.filter((t) => t.source === "manual").length

        setUserStats({
          total: totalTransactions,
          whatsapp: whatsappTransactions,
          csv: csvTransactions,
          manual: manualTransactions,
        })
      }
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error)
    }
  }

  const fetchSubscriptionData = async () => {
    setIsLoadingSubscription(true)
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
    } finally {
      setIsLoadingSubscription(false)
    }
  }

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      alert(
        'Para instalar o app:\n\n📱 No celular: Toque no menu do navegador > "Adicionar à tela inicial"\n💻 No computador: Clique no ícone de instalação na barra de endereços',
      )
      return
    }

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === "accepted") {
        console.log("App instalado com sucesso!")
        alert("✅ App instalado com sucesso!")
      }

      setDeferredPrompt(null)
      setCanInstall(false)
    } catch (error) {
      console.error("Erro ao instalar:", error)
      alert("❌ Erro ao instalar o app")
    }
  }

  const handleLogout = async () => {
    if (!confirm("Tem certeza que deseja sair da conta?")) {
      return
    }

    setIsLoggingOut(true)

    try {
      await logout()
      localStorage.clear()
      sessionStorage.clear()
      setTimeout(() => {
        window.location.href = "/"
      }, 500)
    } catch (error) {
      console.error("Erro no logout:", error)
      window.location.href = "/"
    }
  }

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        "⚠️ ATENÇÃO!\n\nTem certeza que deseja cancelar sua assinatura?\n\n❌ Você perderá acesso aos recursos premium IMEDIATAMENTE\n💰 Não haverá reembolso do período atual\n\nDeseja continuar?",
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
        alert(
          "✅ Assinatura cancelada com sucesso!\n\n📅 Você ainda pode usar os recursos premium até o final do período pago.",
        )
        setShowSubscriptions(false)
        setTimeout(() => {
          window.location.href = "/"
        }, 1000)
      } else {
        alert(`❌ Erro ao cancelar assinatura:\n\n${data.error}`)
      }
    } catch (error) {
      console.error("Erro ao cancelar:", error)
      alert("❌ Erro ao cancelar assinatura. Tente novamente.")
    } finally {
      setIsCancelling(false)
    }
  }

  const handleExportData = async () => {
    try {
      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      const csvContent = [
        ["Data", "Categoria", "Tipo", "Valor", "Fonte", "Criado em"].join(","),
        ...transactions.map((t) =>
          [
            t.date,
            t.category,
            t.type,
            t.amount,
            t.source || "manual",
            new Date(t.created_at).toLocaleString("pt-BR"),
          ].join(","),
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `financeiro-backup-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      alert("✅ Dados exportados com sucesso!")
    } catch (error) {
      console.error("Erro ao exportar:", error)
      alert("❌ Erro ao exportar dados")
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="p-2">
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 p-2 text-sm text-gray-600 border-b">
                  <User size={16} />
                  <span className="truncate">{user.email}</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 mt-2"
                  onClick={() => {
                    setIsOpen(false)
                    // Navegar para configurações
                  }}
                >
                  <Settings size={16} />
                  Configurações
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Sair
                </Button>
              </>
            ) : (
              <div className="p-2 text-sm text-gray-500">Não logado</div>
            )}
          </div>
        </div>
      )}

      {/* Dropdown Menu Content */}
      {isOpen && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 focus:bg-gray-100">
              <MoreVertical className="h-4 w-4" style={{ color: "#152638" }} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 shadow-lg border-gray-200">
            {/* Header do usuário */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="w-10 h-10 rounded-full bg-[#152638] flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col space-y-1 flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "#152638" }}>
                  {user?.user_metadata?.full_name || user?.user_metadata?.name || "Usuário"}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                {userStats && (
                  <p className="text-xs text-blue-600 font-medium">
                    {userStats.total} transações • {userStats.whatsapp} WhatsApp
                  </p>
                )}
              </div>
            </div>

            {/* Seção Principal */}
            <div className="py-2">
              <DropdownMenuItem
                onClick={() => setShowIntegrations(true)}
                className="cursor-pointer flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
              >
                <Upload className="h-4 w-4" style={{ color: "#152638" }} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Importar dados</span>
                  <span className="text-xs text-gray-500">CSV, OCR, Extratos bancários</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleExportData}
                className="cursor-pointer flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
              >
                <Download className="h-4 w-4" style={{ color: "#152638" }} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Exportar dados</span>
                  <span className="text-xs text-gray-500">Backup em CSV</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setShowNotifications(true)}
                className="cursor-pointer flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
              >
                <Bell className="h-4 w-4" style={{ color: "#152638" }} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Notificações</span>
                  <span className="text-xs text-gray-500">Alertas e lembretes</span>
                </div>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator />

            {/* Seção Premium */}
            <div className="py-2">
              <DropdownMenuItem
                onClick={() => setShowPremiumOverlay(true)}
                className="cursor-pointer flex items-center gap-3 px-4 py-3 hover:bg-yellow-50"
              >
                <Crown className="h-4 w-4" style={{ color: "#DDC067" }} />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#DDC067]">Upgrade Premium</span>
                  <span className="text-xs text-gray-500">Recursos avançados • R$ 17/mês</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setShowSubscriptions(true)}
                className="cursor-pointer flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
              >
                <CreditCard className="h-4 w-4" style={{ color: "#152638" }} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Assinaturas</span>
                  <span className="text-xs text-gray-500">Gerenciar planos e pagamentos</span>
                </div>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator />

            {/* Seção Ferramentas */}
            <div className="py-2">
              <DropdownMenuItem
                onClick={() => handleInstallApp()}
                className="cursor-pointer flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
              >
                <Smartphone className="h-4 w-4" style={{ color: "#152638" }} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Instalar App</span>
                  <span className="text-xs text-gray-500">
                    {canInstall ? "Disponível para instalação" : "Usar via navegador"}
                  </span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  navigator.share &&
                  navigator.share({
                    title: "Seu Planejamento - Controle Financeiro",
                    text: "Controle suas finanças de forma simples e eficiente!",
                    url: window.location.origin,
                  })
                }
                className="cursor-pointer flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
              >
                <Share2 className="h-4 w-4" style={{ color: "#152638" }} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Compartilhar</span>
                  <span className="text-xs text-gray-500">Indicar para amigos</span>
                </div>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator />

            {/* Seção Configurações */}
            <div className="py-2">
              <DropdownMenuItem
                onClick={() => setShowSettings(true)}
                className="cursor-pointer flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
              >
                <Settings className="h-4 w-4" style={{ color: "#152638" }} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Configurações</span>
                  <span className="text-xs text-gray-500">Preferências e privacidade</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setShowHelp(true)}
                className="cursor-pointer flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
              >
                <HelpCircle className="h-4 w-4" style={{ color: "#152638" }} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Ajuda & Suporte</span>
                  <span className="text-xs text-gray-500">WhatsApp, tutoriais, FAQ</span>
                </div>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator />

            {/* Logout */}
            <div className="py-2">
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-50 flex items-center gap-3 px-4 py-3"
              >
                {isLoggingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    <span className="text-sm font-medium">Saindo da conta...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Sair da conta</span>
                      <span className="text-xs text-red-400">Fazer logout do sistema</span>
                    </div>
                  </>
                )}
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Modal de Importar dados */}
      <Dialog open={showIntegrations} onOpenChange={setShowIntegrations}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: "#152638" }}>
              <Upload className="h-5 w-5" />
              Importar Dados Financeiros
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <h4 className="font-semibold mb-4 text-blue-900 flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />🚀 Funcionalidades Disponíveis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <span className="font-semibold text-blue-900 block">Importação CSV</span>
                      <span className="text-blue-700 text-xs">Extratos bancários automáticos</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <span className="font-semibold text-blue-900 block">OCR de Comprovantes</span>
                      <span className="text-blue-700 text-xs">Digitalização de recibos e notas</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Crown className="h-5 w-5 text-yellow-600" />
                    <div>
                      <span className="font-semibold text-blue-900 block">Categorização IA</span>
                      <span className="text-blue-700 text-xs">Classificação inteligente automática</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-purple-600" />
                    <div>
                      <span className="font-semibold text-blue-900 block">Múltiplos Formatos</span>
                      <span className="text-blue-700 text-xs">CSV, OFX, PDF, Imagens</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <PremiumGate user={user} feature="Importação de arquivos CSV e OCR de comprovantes">
              <FileImport onImportTransactions={onImportTransactions} />
            </PremiumGate>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Assinaturas */}
      <Dialog open={showSubscriptions} onOpenChange={setShowSubscriptions}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: "#152638" }}>
              <CreditCard className="h-5 w-5" />
              Gerenciar Assinatura
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {isLoadingSubscription ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#152638]"></div>
                <span className="ml-3 text-gray-600">Carregando dados da assinatura...</span>
              </div>
            ) : subscriptionData ? (
              <>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="h-6 w-6 text-green-600" />
                    <h4 className="font-bold text-green-900 text-lg">Plano Premium Ativo</h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 font-medium">Plano:</span>
                      <span className="font-bold text-green-900">
                        {subscriptionData.plan_type === "premium" ? "Premium" : "Básico"} - R$ 17,00/mês
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 font-medium">Status:</span>
                      <span
                        className={`font-bold px-3 py-1 rounded-full text-xs ${
                          subscriptionData.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {subscriptionData.status === "active" ? "✅ Ativo" : "❌ Inativo"}
                      </span>
                    </div>
                    {subscriptionData.subscription_start_date && (
                      <div className="flex justify-between items-center">
                        <span className="text-green-700 font-medium">Início:</span>
                        <span className="font-bold text-green-900">
                          {formatDate(subscriptionData.subscription_start_date)}
                        </span>
                      </div>
                    )}
                    {subscriptionData.subscription_end_date && (
                      <div className="flex justify-between items-center">
                        <span className="text-green-700 font-medium">Válido até:</span>
                        <span className="font-bold text-green-900">
                          {formatDate(subscriptionData.subscription_end_date)}
                        </span>
                      </div>
                    )}
                    {subscriptionData.created_at && (
                      <div className="flex justify-between items-center">
                        <span className="text-green-700 font-medium">Criado em:</span>
                        <span className="font-bold text-green-900">{formatDateTime(subscriptionData.created_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleCancelSubscription}
                    variant="destructive"
                    className="w-full"
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Cancelando assinatura...
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
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Nenhuma assinatura ativa</h3>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  Você não possui uma assinatura premium ativa no momento.
                  <br />
                  Assine agora e tenha acesso a todos os recursos avançados!
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setShowSubscriptions(false)
                      setShowPremiumOverlay(true)
                    }}
                    className="w-full bg-[#DDC067] text-[#152638] hover:opacity-90 font-semibold py-3"
                  >
                    <Crown className="mr-2 h-5 w-5" />
                    Assinar Premium - R$ 17/mês
                  </Button>
                  <Button onClick={() => setShowSubscriptions(false)} variant="outline" className="w-full">
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Configurações */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: "#152638" }}>
              <Settings className="h-5 w-5" />
              Configurações
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Privacidade</h4>
                </div>
                <p className="text-blue-700 text-sm mb-3">Controle seus dados e privacidade.</p>
                <Button
                  variant="outline"
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent"
                  size="sm"
                >
                  Gerenciar Privacidade
                </Button>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Database className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-900">Backup</h4>
                </div>
                <p className="text-green-700 text-sm mb-3">Backup automático dos seus dados.</p>
                <Button
                  variant="outline"
                  className="w-full border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
                  size="sm"
                >
                  Configurar Backup
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3" style={{ color: "#152638" }}>
                ⚙️ Preferências do Sistema
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Notificações por email</span>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Backup automático</span>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Modo escuro</span>
                  <input type="checkbox" className="rounded" />
                </div>
              </div>
            </div>

            <Button onClick={() => setShowSettings(false)} variant="outline" className="w-full">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Notificações */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: "#152638" }}>
              <Bell className="h-5 w-5" />
              Notificações
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">Nenhuma notificação</h3>
              <p className="text-gray-600 text-sm">Você está em dia com tudo!</p>
            </div>
            <Button onClick={() => setShowNotifications(false)} variant="outline" className="w-full">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Ajuda */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: "#152638" }}>
              <HelpCircle className="h-5 w-5" />
              Ajuda & Suporte
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-900">WhatsApp</h4>
                </div>
                <p className="text-green-700 text-sm mb-3">Suporte direto via WhatsApp para dúvidas e problemas.</p>
                <Button
                  onClick={() => window.open("https://wa.me/5511999999999", "_blank")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  Abrir WhatsApp
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Tutoriais</h4>
                </div>
                <p className="text-blue-700 text-sm mb-3">Guias passo a passo para usar todas as funcionalidades.</p>
                <Button
                  variant="outline"
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent"
                  size="sm"
                >
                  Ver Tutoriais
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3" style={{ color: "#152638" }}>
                📋 Perguntas Frequentes
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-gray-900">Como importar dados do banco?</p>
                  <p className="text-gray-600">Use a função "Importar Dados" no menu para carregar extratos CSV.</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Como funciona o WhatsApp?</p>
                  <p className="text-gray-600">
                    Envie mensagens como "Gastei R$ 50 no supermercado" e será adicionado automaticamente.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Como cancelar a assinatura?</p>
                  <p className="text-gray-600">Vá em "Assinaturas" no menu e clique em "Cancelar Assinatura".</p>
                </div>
              </div>
            </div>

            <Button onClick={() => setShowHelp(false)} variant="outline" className="w-full">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Premium Overlay */}
      {showPremiumOverlay && <PremiumOverlay user={user} onClose={() => setShowPremiumOverlay(false)} />}
    </div>
  )
}
