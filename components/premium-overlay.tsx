"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Crown,
  X,
  Check,
  CreditCard,
  Smartphone,
  BarChart3,
  FileText,
  MessageCircle,
  Zap,
  Shield,
  Cloud,
} from "lucide-react"

interface PremiumOverlayProps {
  user: any
  onClose: () => void
}

export default function PremiumOverlay({ user, onClose }: PremiumOverlayProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          planType: "premium",
        }),
      })

      const data = await response.json()

      if (data.success && data.init_point) {
        // Redirecionar para o Mercado Pago
        window.location.href = data.init_point
      } else {
        alert("❌ Erro ao criar assinatura: " + (data.error || "Erro desconhecido"))
      }
    } catch (error) {
      console.error("Erro ao criar assinatura:", error)
      alert("❌ Erro ao processar pagamento. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: <MessageCircle className="h-5 w-5" />,
      title: "Integração WhatsApp",
      description: "Adicione gastos enviando mensagens no WhatsApp",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Relatórios em PDF",
      description: "Gere relatórios detalhados e profissionais",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Análises Avançadas",
      description: "Gráficos e insights sobre seus gastos",
    },
    {
      icon: <Cloud className="h-5 w-5" />,
      title: "Backup Automático",
      description: "Seus dados sempre seguros na nuvem",
    },
    {
      icon: <Smartphone className="h-5 w-5" />,
      title: "App Mobile",
      description: "Acesso completo pelo celular",
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Suporte Prioritário",
      description: "Atendimento exclusivo via WhatsApp",
    },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white relative">
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <Crown className="h-12 w-12 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold">Upgrade para Premium</CardTitle>
            <p className="text-yellow-100 mt-2">
              Desbloqueie todos os recursos e tenha controle total das suas finanças
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Preço */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl font-bold text-gray-900">R$ 17,00</span>
              <span className="text-gray-600">/mês</span>
              <Badge className="bg-green-100 text-green-800">Melhor valor</Badge>
            </div>
            <p className="text-sm text-gray-600">Cancele quando quiser • Sem taxa de adesão • Primeiro mês grátis</p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="text-yellow-600 mt-1">{feature.icon}</div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{feature.title}</h4>
                  <p className="text-gray-600 text-xs">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Comparação */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />O que você ganha com o Premium:
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-blue-800">
                <Check className="h-4 w-4 text-green-600" />
                <span>Transações ilimitadas (vs. 50 no gratuito)</span>
              </div>
              <div className="flex items-center gap-2 text-blue-800">
                <Check className="h-4 w-4 text-green-600" />
                <span>Categorias personalizadas ilimitadas</span>
              </div>
              <div className="flex items-center gap-2 text-blue-800">
                <Check className="h-4 w-4 text-green-600" />
                <span>Exportação de dados em múltiplos formatos</span>
              </div>
              <div className="flex items-center gap-2 text-blue-800">
                <Check className="h-4 w-4 text-green-600" />
                <span>Acesso a recursos futuros</span>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="space-y-3">
            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold py-3 text-lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processando...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Assinar Premium - R$ 17/mês
                </>
              )}
            </Button>

            <Button onClick={onClose} variant="outline" className="w-full bg-transparent">
              Continuar com versão gratuita
            </Button>
          </div>

          {/* Garantia */}
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              🔒 Pagamento seguro via Mercado Pago • ✅ Garantia de 7 dias • 📱 Suporte via WhatsApp
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
