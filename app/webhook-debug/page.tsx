"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function WebhookDebug() {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testWebhook = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-webhook-direct", {
        method: "POST",
      })
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({ error: "Erro ao testar webhook" })
    }
    setLoading(false)
  }

  const checkWebhookUrl = async () => {
    if (!webhookUrl) return

    setLoading(true)
    try {
      const response = await fetch(webhookUrl)
      const data = await response.json()
      setTestResult({
        url: webhookUrl,
        status: response.status,
        data,
      })
    } catch (error) {
      setTestResult({
        url: webhookUrl,
        error: "Erro ao acessar URL",
      })
    }
    setLoading(false)
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://seu-planejamento.vercel.app"

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔍 Debug do Webhook - Mercado Pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informações do Webhook */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">📋 Configuração do Webhook</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>URL do Webhook:</strong>
                  <code className="ml-2 bg-gray-100 px-2 py-1 rounded">{baseUrl}/api/webhooks/mercadopago</code>
                </div>
                <div>
                  <strong>Eventos:</strong> payment
                </div>
                <div>
                  <strong>Método:</strong> POST
                </div>
              </div>
            </div>

            {/* Teste do Webhook */}
            <div>
              <Button onClick={testWebhook} disabled={loading} className="w-full mb-4 bg-green-600 hover:bg-green-700">
                🧪 Testar Webhook Diretamente
              </Button>
            </div>

            {/* Verificar URL */}
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Testar URL do Webhook:</Label>
              <div className="flex gap-2">
                <Input
                  id="webhook-url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder={`${baseUrl}/api/webhooks/mercadopago`}
                />
                <Button onClick={checkWebhookUrl} disabled={loading || !webhookUrl}>
                  Verificar
                </Button>
              </div>
            </div>

            {/* Resultado */}
            {testResult && (
              <div
                className={`p-4 rounded-lg ${
                  testResult.success || testResult.status === 200
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <h3 className="font-semibold mb-2">📊 Resultado:</h3>
                <pre className="text-sm bg-white p-2 rounded border overflow-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}

            {/* Instruções */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">⚙️ Como Configurar no Mercado Pago:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Acesse: https://www.mercadopago.com.br/developers/panel</li>
                <li>Vá em "Webhooks" no menu lateral</li>
                <li>Clique em "Criar webhook"</li>
                <li>
                  Cole a URL: <code className="bg-gray-100 px-1 rounded">{baseUrl}/api/webhooks/mercadopago</code>
                </li>
                <li>Selecione o evento: "Pagamentos"</li>
                <li>Salve a configuração</li>
                <li>Teste enviando um pagamento</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
