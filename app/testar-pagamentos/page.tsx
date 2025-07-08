"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, CreditCard, Loader2, ExternalLink } from "lucide-react"

export default function TestarPagamentos() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)

  const addResult = (test: string, status: "success" | "error" | "info", message: string, data?: any) => {
    setTestResults((prev) => [...prev, { test, status, message, data, timestamp: new Date().toLocaleTimeString() }])
  }

  const testMercadoPagoConnection = async () => {
    addResult("Conexão MP", "info", "Testando conexão com Mercado Pago...")

    try {
      const response = await fetch("/api/test-mercadopago-connection")
      const data = await response.json()

      if (data.connected) {
        addResult("Conexão MP", "success", "✅ Mercado Pago conectado!")
        return true
      } else {
        addResult("Conexão MP", "error", `❌ Erro: ${data.error}`)
        return false
      }
    } catch (error: any) {
      addResult("Conexão MP", "error", `Erro na conexão: ${error.message}`)
      return false
    }
  }

  const testEnvironmentVariables = async () => {
    addResult("Variáveis", "info", "Verificando variáveis de ambiente...")

    try {
      const response = await fetch("/api/test-env-vars")
      const data = await response.json()

      if (data.allConfigured) {
        addResult("Variáveis", "success", "✅ Todas as variáveis configuradas!")
        return true
      } else {
        addResult("Variáveis", "error", `❌ Faltam: ${data.missing.join(", ")}`)
        return false
      }
    } catch (error: any) {
      addResult("Variáveis", "error", `Erro ao verificar: ${error.message}`)
      return false
    }
  }

  const testCreatePayment = async () => {
    addResult("Criar Pagamento", "info", "Criando preferência de pagamento...")

    try {
      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "test-user-" + Date.now(),
          planType: "premium",
        }),
      })

      const data = await response.json()

      if (data.success) {
        setPaymentUrl(data.init_point)
        addResult("Criar Pagamento", "success", "✅ Preferência criada com sucesso!", {
          preference_id: data.preference_id,
          init_point: data.init_point,
        })
        return true
      } else {
        addResult("Criar Pagamento", "error", `❌ Erro: ${data.error}`)
        return false
      }
    } catch (error: any) {
      addResult("Criar Pagamento", "error", `Erro ao criar: ${error.message}`)
      return false
    }
  }

  const testWebhook = async () => {
    addResult("Webhook", "info", "Testando webhook...")

    try {
      const response = await fetch("/api/webhooks/mercadopago", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "payment",
          data: {
            id: "test-payment-123",
          },
        }),
      })

      if (response.ok) {
        addResult("Webhook", "success", "✅ Webhook funcionando!")
        return true
      } else {
        addResult("Webhook", "error", "❌ Erro no webhook")
        return false
      }
    } catch (error: any) {
      addResult("Webhook", "error", `Erro no webhook: ${error.message}`)
      return false
    }
  }

  const testSubscriptionCheck = async () => {
    addResult("Verificar Assinatura", "info", "Testando verificação de assinatura...")

    try {
      const response = await fetch("/api/check-subscription?userId=test-user-123")
      const data = await response.json()

      if (data.success) {
        addResult("Verificar Assinatura", "success", `✅ API funcionando! Status: ${data.status}`)
        return true
      } else {
        addResult("Verificar Assinatura", "error", `❌ Erro: ${data.error}`)
        return false
      }
    } catch (error: any) {
      addResult("Verificar Assinatura", "error", `Erro na verificação: ${error.message}`)
      return false
    }
  }

  const runAllTests = async () => {
    setLoading(true)
    setTestResults([])
    setPaymentUrl(null)

    // Teste 1: Variáveis de ambiente
    const envOk = await testEnvironmentVariables()
    if (!envOk) {
      setLoading(false)
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Teste 2: Conexão Mercado Pago
    const mpOk = await testMercadoPagoConnection()
    if (!mpOk) {
      setLoading(false)
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Teste 3: Verificar assinatura
    await testSubscriptionCheck()

    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Teste 4: Webhook
    await testWebhook()

    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Teste 5: Criar pagamento
    await testCreatePayment()

    setLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-purple-500" />
              Passo 4: Testar Integração de Pagamentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertDescription>
                Este teste verificará se o Mercado Pago está configurado corretamente e se o sistema de pagamentos
                funciona.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Testes Automáticos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={runAllTests} disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Executando Testes...
                      </>
                    ) : (
                      "🧪 Executar Todos os Testes"
                    )}
                  </Button>

                  {paymentUrl && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">✅ Pagamento Criado!</h4>
                      <p className="text-sm text-green-700 mb-3">
                        Use os dados de teste do Mercado Pago para simular um pagamento:
                      </p>
                      <div className="bg-white p-3 rounded text-sm mb-3">
                        <strong>Cartão de teste:</strong>
                        <br />
                        Número: 4509 9535 6623 3704
                        <br />
                        Vencimento: 11/25
                        <br />
                        CVV: 123
                        <br />
                        Nome: APRO
                      </div>
                      <Button onClick={() => window.open(paymentUrl, "_blank")} className="w-full">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Abrir Página de Pagamento
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Testes Individuais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={testEnvironmentVariables}
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    1. Verificar Variáveis
                  </Button>
                  <Button
                    onClick={testMercadoPagoConnection}
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    2. Testar Mercado Pago
                  </Button>
                  <Button
                    onClick={testSubscriptionCheck}
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    3. Verificar Assinaturas
                  </Button>
                  <Button onClick={testWebhook} variant="outline" className="w-full justify-start bg-transparent">
                    4. Testar Webhook
                  </Button>
                  <Button onClick={testCreatePayment} variant="outline" className="w-full justify-start bg-transparent">
                    5. Criar Pagamento
                  </Button>
                </CardContent>
              </Card>
            </div>

            {testResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>📊 Resultados dos Testes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {testResults.map((result, index) => (
                      <div key={index} className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.status)}
                            <span className="font-medium">{result.test}</span>
                            <Badge variant={result.status === "success" ? "default" : "destructive"}>
                              {result.status.toUpperCase()}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">{result.timestamp}</span>
                        </div>
                        <p className="text-sm">{result.message}</p>
                        {result.data && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs text-blue-600">Ver detalhes</summary>
                            <pre className="mt-1 text-xs bg-white p-2 rounded overflow-x-auto">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Button onClick={() => (window.location.href = "/")} className="flex-1">
                🎉 Finalizar: Ir para o App
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/testar-autenticacao")}
                className="flex-1"
              >
                ⬅️ Voltar: Autenticação
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📋 Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  Configure o webhook no Mercado Pago para receber notificações automáticas
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Teste o fluxo completo de pagamento com cartão de teste</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Verifique se as assinaturas são ativadas automaticamente após pagamento</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
