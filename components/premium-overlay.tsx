"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Crown, Check, X, CreditCard, Shield, Calendar } from "lucide-react"

interface PremiumOverlayProps {
  user: any
  onClose: () => void
}

export default function PremiumOverlay({ user, onClose }: PremiumOverlayProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")

  const premiumBenefits = [
    "Transações ILIMITADAS",
    "Importação CSV/OFX automática",
    "OCR de comprovantes (IA)",
    "Categorização inteligente com IA",
    "Relatórios avançados e insights",
    "Gráficos interativos e dashboards",
    "Backup automático na nuvem",
    "Sincronização multi-dispositivo",
    "Alertas e notificações inteligentes",
    "Exportação PDF profissional",
    "App mobile completo (PWA)",
    "Acesso antecipado a novas funcionalidades",
    "Segurança avançada e criptografia",
    "Análises preditivas e tendências",
    "Dicas personalizadas de economia",
  ]

  const handleSubscribe = async () => {
    setIsProcessing(true)
    setError("")

    try {
      if (!user?.id || !user?.email) {
        throw new Error("Dados do usuário não encontrados")
      }

      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          userName: user.user_metadata?.full_name || user.email.split("@")[0],
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao processar pagamento")
      }

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      } else {
        throw new Error("URL de checkout não recebida")
      }
    } catch (error: any) {
      setError(error.message || "Erro ao processar pagamento")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-2xl" style={{ color: "#152638" }}>
              <Crown className="h-6 w-6" style={{ color: "#DDC067" }} />
              Upgrade para Premium
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-8">
          {/* Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Preço em Destaque */}
          <div className="text-center bg-gradient-to-r from-[#152638] to-[#1a2d42] text-white rounded-xl p-8">
            <div className="text-4xl font-bold mb-2">
              R$ 17,00<span className="text-xl font-normal opacity-80">/mês</span>
            </div>
            <p className="text-lg opacity-90">Apenas R$ 0,57 por dia</p>
            <p className="text-sm opacity-70 mt-2">Cancele quando quiser</p>
          </div>

          {/* Lista de Benefícios Clean */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-center" style={{ color: "#152638" }}>
              Tudo que você precisa para controlar suas finanças:
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {premiumBenefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-base" style={{ color: "#152638" }}>
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Botão Principal */}
          <Button
            className="w-full font-bold text-xl py-8 text-white shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: "#DDC067", color: "#152638" }}
            onClick={handleSubscribe}
            disabled={isProcessing || !user}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#152638] mr-3"></div>
                Processando...
              </>
            ) : (
              <>
                <Crown className="h-6 w-6 mr-3" />
                ASSINAR PREMIUM
              </>
            )}
          </Button>

          {/* Métodos de Pagamento */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-medium mb-4 text-center" style={{ color: "#152638" }}>
              Métodos de Pagamento Seguros
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-sm" style={{ color: "#152638" }}>
                <CreditCard className="h-4 w-4" style={{ color: "#DDC067" }} />
                Cartão de Crédito
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: "#152638" }}>
                <Shield className="h-4 w-4" style={{ color: "#DDC067" }} />
                100% Seguro
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: "#152638" }}>
                <Calendar className="h-4 w-4" style={{ color: "#DDC067" }} />
                Cancele quando quiser
              </div>
            </div>
          </div>

          {/* Garantia */}
          <div className="text-center text-sm text-gray-600 border-t pt-4">
            <p className="font-medium mb-2">Garantia de 30 dias</p>
            <p>Não ficou satisfeito? Devolvemos 100% do seu dinheiro</p>
            <p className="mt-2 text-xs">Pagamento processado pelo Mercado Pago • Dados protegidos com SSL</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
