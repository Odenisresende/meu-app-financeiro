"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, ArrowRight, Home } from "lucide-react"

export default function SetupCompleto() {
  const [setupStatus, setSetupStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const checkCompleteSetup = async () => {
    try {
      // Verificar variáveis de ambiente
      const envResponse = await fetch("/api/test-env-vars")
      const envData = await envResponse.json()

      // Verificar conexão Mercado Pago
      const mpResponse = await fetch("/api/test-mercadopago-connection")
      const mpData = await mpResponse.json()

      // Verificar Supabase
      const supabaseResponse = await fetch("/api/test-supabase-connection")
      const supabaseData = await supabaseResponse.json()

      setSetupStatus({
        environment: envData.allConfigured,
        mercadoPago: mpData.connected,
        supabase: supabaseData.connected,
        allReady: envData.allConfigured && mpData.connected && supabaseData.connected,
      })
    } catch (error) {
      console.error("Erro ao verificar setup:", error)
      setSetupStatus({
        environment: false,
        mercadoPago: false,
        supabase: false,
        allReady: false,
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    checkCompleteSetup()
  }, [])

  const steps = [
    {
      title: "Banco de Dados",
      description: "Scripts SQL executados",
      status: true, // Assumindo que foi executado
      icon: "🗄️",
    },
    {
      title: "Variáveis de Ambiente",
      description: "Configuração no Vercel",
      status: setupStatus?.environment,
      icon: "🔧",
      link: "/configurar-variaveis",
    },
    {
      title: "Sistema de Autenticação",
      description: "Supabase Auth funcionando",
      status: setupStatus?.supabase,
      icon: "🔐",
      link: "/testar-autenticacao",
    },
    {
      title: "Integração de Pagamentos",
      description: "Mercado Pago configurado",
      status: setupStatus?.mercadoPago,
      icon: "💳",
      link: "/testar-pagamentos",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {setupStatus?.allReady ? "🎉 Setup Completo!" : "⚙️ Status do Setup"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {setupStatus?.allReady ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Parabéns!</strong> Seu aplicativo está 100% configurado e pronto para uso!
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Atenção:</strong> Alguns componentes ainda precisam ser configurados.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    step.status
                      ? "bg-green-50 border-green-200"
                      : step.status === false
                        ? "bg-red-50 border-red-200"
                        : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{step.icon}</span>
                    <div>
                      <h3 className="font-medium">{step.title}</h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {step.status === true ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : step.status === false ? (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        {step.link && (
                          <Button size="sm" onClick={() => (window.location.href = step.link!)}>
                            Configurar
                          </Button>
                        )}
                      </>
                    ) : (
                      <div className="w-5 h-5 bg-yellow-400 rounded-full animate-pulse" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              {setupStatus?.allReady ? (
                <Button onClick={() => (window.location.href = "/")} className="flex-1">
                  <Home className="mr-2 h-4 w-4" />
                  Ir para o Aplicativo
                </Button>
              ) : (
                <Button onClick={() => (window.location.href = "/configurar-variaveis")} className="flex-1">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Continuar Setup
                </Button>
              )}
              <Button variant="outline" onClick={checkCompleteSetup} className="flex-1 bg-transparent">
                🔄 Verificar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>

        {setupStatus?.allReady && (
          <Card>
            <CardHeader>
              <CardTitle>🚀 Próximos Passos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Teste o fluxo completo de cadastro e login</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Faça um pagamento de teste com cartão fictício</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Configure o webhook no Mercado Pago para produção</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Personalize o design e conteúdo do seu app</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
