"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function WebhookDebug() {
  const [logs, setLogs] = useState<any[]>([])
  const [testResult, setTestResult] = useState<any>(null)
  const [systemStatus, setSystemStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState("")

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://seu-planejamento.vercel.app"

  // Carregar status do sistema
  const loadSystemStatus = async () => {
    try {
      const response = await fetch("/api/system-status")
      const data = await response.json()
      setSystemStatus(data)
    } catch (error) {
      console.error("Erro ao carregar status:", error)
      setSystemStatus({ error: "Erro ao carregar status do sistema" })
    }
  }

  // Carregar logs do webhook
  const loadLogs = async () => {
    try {
      const response = await fetch("/api/webhook-logs")
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
      } else {
        console.error("Erro ao carregar logs:", response.status)
      }
    } catch (error) {
      console.error("Erro ao carregar logs:", error)
    }
  }

  // Testar webhook básico
  const testWebhook = async () => {
    setLoading(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/webhooks/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "test",
          data: { id: "test-123" },
          action: "payment.created",
        }),
      })

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        // Se não conseguir fazer parse do JSON, pegar como texto
        const text = await response.text()
        data = { raw_response: text, parse_error: "Resposta não é JSON válido" }
      }

      setTestResult({
        status: response.status,
        success: response.ok,
        data: data,
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    }

    setLoading(false)
    setTimeout(loadLogs, 1000) // Aguardar 1s para carregar logs
  }

  // Simular pagamento aprovado
  const simulatePayment = async () => {
    if (!userId.trim()) {
      alert("Digite um User ID para simular")
      return
    }

    setLoading(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/simulate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId.trim(),
          paymentId: `sim_${Date.now()}`,
          amount: 17.0,
        }),
      })

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        const text = await response.text()
        data = { raw_response: text, parse_error: "Resposta não é JSON válido" }
      }

      setTestResult({
        status: response.status,
        success: response.ok,
        data: data,
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    }

    setLoading(false)
    setTimeout(loadLogs, 1000)
  }

  // Verificar status do webhook
  const checkWebhookStatus = async () => {
    setLoading(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/webhooks/mercadopago", {
        method: "GET",
      })

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        const text = await response.text()
        data = { raw_response: text, parse_error: "Resposta não é JSON válido" }
      }

      setTestResult({
        status: response.status,
        success: response.ok,
        data: data,
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    }

    setLoading(false)
  }

  useEffect(() => {
    loadSystemStatus()
    loadLogs()

    const interval = setInterval(() => {
      loadLogs()
      loadSystemStatus()
    }, 10000) // Atualiza a cada 10s

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔧 Debug Webhook Mercado Pago
              <Badge variant="outline">Tempo Real</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                <strong>⚠️ IMPORTANTE:</strong> Este debug só funciona no ambiente real (Vercel). No preview do V0 você
                verá erros de JSON porque as APIs não funcionam aqui.
              </AlertDescription>
            </Alert>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mt-4">
              <h3 className="font-semibold mb-2">📋 URL do Webhook</h3>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm break-all">
                {baseUrl}/api/webhooks/mercadopago
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Status do Sistema */}
        {systemStatus && (
          <Card>
            <CardHeader>
              <CardTitle>🔍 Status do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <Badge
                    className={
                      systemStatus.checks?.supabase ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }
                  >
                    {systemStatus.checks?.supabase ? "✅" : "❌"} Supabase
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge
                    className={
                      systemStatus.checks?.mercadopago ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }
                  >
                    {systemStatus.checks?.mercadopago ? "✅" : "❌"} Mercado Pago
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge
                    className={
                      systemStatus.checks?.webhook_table ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }
                  >
                    {systemStatus.checks?.webhook_table ? "✅" : "❌"} Webhook Logs
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge
                    className={
                      systemStatus.checks?.subscriptions_table
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {systemStatus.checks?.subscriptions_table ? "✅" : "❌"} Subscriptions
                  </Badge>
                </div>
              </div>

              {systemStatus.errors && systemStatus.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 p-3 rounded">
                  <h4 className="font-semibold text-red-800 mb-2">❌ Erros Encontrados:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {systemStatus.errors.map((error: string, index: number) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Testes */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Testes Básicos */}
          <Card>
            <CardHeader>
              <CardTitle>🧪 Testes Básicos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={checkWebhookStatus}
                disabled={loading}
                className="w-full bg-transparent"
                variant="outline"
              >
                {loading ? "⏳ Testando..." : "✅ Verificar Status"}
              </Button>

              <Button onClick={testWebhook} disabled={loading} className="w-full">
                {loading ? "⏳ Testando..." : "🔄 Testar Webhook"}
              </Button>

              <div className="space-y-2">
                <Label htmlFor="userId">User ID para Simulação:</Label>
                <Input
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="cole-user-id-aqui"
                />
                <Button
                  onClick={simulatePayment}
                  disabled={loading || !userId.trim()}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading ? "⏳ Simulando..." : "💳 Simular Pagamento Aprovado"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resultado dos Testes */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Resultado do Teste</CardTitle>
            </CardHeader>
            <CardContent>
              {testResult ? (
                <div
                  className={`p-4 rounded-lg ${
                    testResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={testResult.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {testResult.success ? "✅ SUCESSO" : "❌ ERRO"}
                    </Badge>
                    <span className="text-sm text-gray-500">Status: {testResult.status}</span>
                  </div>
                  <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                    {JSON.stringify(testResult.data || testResult.error, null, 2)}
                  </pre>
                  <div className="text-xs text-gray-500 mt-2">{new Date(testResult.timestamp).toLocaleString()}</div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">Execute um teste para ver o resultado</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Logs em Tempo Real */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              📋 Logs do Webhook (Tempo Real)
              <Button onClick={loadLogs} size="sm" variant="outline">
                🔄 Atualizar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-auto">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{log.event_type || "unknown"}</Badge>
                      <span className="text-xs text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                    <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">Nenhum log encontrado. Execute um teste!</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
