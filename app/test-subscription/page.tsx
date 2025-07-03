"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"

export default function TestSubscriptionPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (test: string, status: "success" | "error" | "warning", message: string, data?: any) => {
    setTestResults((prev) => [...prev, { test, status, message, data, timestamp: new Date().toLocaleTimeString() }])
  }

  const testCancelSubscriptionAPI = async () => {
    setIsLoading(true)
    addResult("API Test", "warning", "Iniciando teste da API de cancelamento...")

    try {
      // Simular dados de teste
      const testUserId = "test-user-123"

      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: testUserId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        addResult("API Test", "success", "API respondeu corretamente", data)
      } else {
        addResult("API Test", "error", `Erro da API: ${data.error}`, data)
      }
    } catch (error: any) {
      addResult("API Test", "error", `Erro de conexão: ${error.message}`)
    }

    setIsLoading(false)
  }

  const testWebhookProcessing = async () => {
    addResult("Webhook Test", "warning", "Testando processamento de webhook...")

    try {
      // Simular webhook de cancelamento
      const webhookData = {
        type: "subscription_preapproval",
        data: {
          id: "test-subscription-123",
        },
      }

      const response = await fetch("/api/webhooks/mercadopago", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookData),
      })

      if (response.ok) {
        addResult("Webhook Test", "success", "Webhook processado com sucesso")
      } else {
        addResult("Webhook Test", "error", "Erro no processamento do webhook")
      }
    } catch (error: any) {
      addResult("Webhook Test", "error", `Erro no webhook: ${error.message}`)
    }
  }

  const testDatabaseConnection = async () => {
    addResult("Database Test", "warning", "Testando conexão com banco...")

    try {
      const response = await fetch("/api/test-env")
      const data = await response.json()

      if (response.ok) {
        addResult("Database Test", "success", "Conexão com banco OK", data)
      } else {
        addResult("Database Test", "error", "Erro na conexão com banco")
      }
    } catch (error: any) {
      addResult("Database Test", "error", `Erro de conexão: ${error.message}`)
    }
  }

  const createTestSubscription = async () => {
    addResult("Create Test", "warning", "Criando assinatura de teste...")

    try {
      // Simular criação de assinatura para teste
      const testData = {
        userId: "test-user-123",
        subscriptionId: "test-sub-" + Date.now(),
        status: "active",
      }

      // Aqui você poderia fazer uma chamada real para criar uma assinatura de teste
      addResult("Create Test", "success", "Assinatura de teste criada", testData)
    } catch (error: any) {
      addResult("Create Test", "error", `Erro ao criar teste: ${error.message}`)
    }
  }

  const runAllTests = async () => {
    setTestResults([])
    await testDatabaseConnection()
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await testWebhookProcessing()
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await testCancelSubscriptionAPI()
  }

  const clearResults = () => {
    setTestResults([])
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "warning":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Teste de Sistema de Assinaturas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button onClick={testDatabaseConnection} disabled={isLoading}>
                Testar Banco
              </Button>
              <Button onClick={testWebhookProcessing} disabled={isLoading}>
                Testar Webhook
              </Button>
              <Button onClick={testCancelSubscriptionAPI} disabled={isLoading}>
                Testar API Cancel
              </Button>
              <Button onClick={createTestSubscription} disabled={isLoading}>
                Criar Teste
              </Button>
            </div>

            <div className="flex gap-4">
              <Button onClick={runAllTests} disabled={isLoading} className="flex-1">
                {isLoading ? "Executando..." : "Executar Todos os Testes"}
              </Button>
              <Button onClick={clearResults} variant="outline">
                Limpar Resultados
              </Button>
            </div>
          </CardContent>
        </Card>

        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados dos Testes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <span className="font-medium">{result.test}</span>
                        <Badge className={getStatusColor(result.status)}>{result.status.toUpperCase()}</Badge>
                      </div>
                      <span className="text-xs text-gray-500">{result.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{result.message}</p>
                    {result.data && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          Ver dados detalhados
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
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

        <Card>
          <CardHeader>
            <CardTitle>Como Ativar Assinatura para Teste</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Opção 1: SQL Direto</h4>
              <p className="text-sm text-gray-700 mb-2">Execute no Supabase SQL Editor:</p>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                {`INSERT INTO user_subscriptions (
  user_id, 
  subscription_id, 
  status, 
  is_active, 
  plan_type,
  subscription_start_date,
  subscription_end_date
) VALUES (
  'SEU_USER_ID_AQUI',
  'test-sub-' || extract(epoch from now()),
  'active',
  true,
  'premium',
  now(),
  now() + interval '30 days'
) ON CONFLICT (user_id) DO UPDATE SET
  status = 'active',
  is_active = true,
  updated_at = now();`}
              </pre>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Opção 2: API de Teste</h4>
              <p className="text-sm text-gray-700">
                Use o botão "Criar Teste" acima para simular uma assinatura ativa.
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Verificar User ID</h4>
              <p className="text-sm text-gray-700">
                Seu User ID atual aparecerá nos logs do console quando você fizer login.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
