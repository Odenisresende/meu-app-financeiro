"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, Clock, Webhook, ExternalLink } from "lucide-react"

export function WebhookTestPanel() {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testWebhook = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(webhookUrl || "/api/webhooks/mercadopago", {
        method: "GET",
      })
      const data = await response.json()
      setTestResult({
        status: response.ok ? "success" : "error",
        data: data,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      setTestResult({
        status: "error",
        data: { error: error.message },
        timestamp: new Date().toISOString(),
      })
    }
    setIsLoading(false)
  }

  const simulatePaymentWebhook = async () => {
    setIsLoading(true)
    try {
      const mockPayload = {
        type: "payment",
        data: {
          id: "123456789",
        },
        date_created: new Date().toISOString(),
      }

      const response = await fetch(webhookUrl || "/api/webhooks/mercadopago", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockPayload),
      })

      const data = await response.json()
      setTestResult({
        status: response.ok ? "success" : "error",
        data: data,
        payload: mockPayload,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      setTestResult({
        status: "error",
        data: { error: error.message },
        timestamp: new Date().toISOString(),
      })
    }
    setIsLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Teste do Webhook Mercado Pago
          </CardTitle>
          <CardDescription>Teste se o webhook está configurado corretamente e funcionando</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">URL do Webhook</Label>
            <Input
              id="webhook-url"
              placeholder="https://seu-app.vercel.app/api/webhooks/mercadopago"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Deixe vazio para testar o webhook local: /api/webhooks/mercadopago
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={testWebhook} disabled={isLoading} variant="outline">
              {isLoading ? <Clock className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Testar Conexão (GET)
            </Button>
            <Button onClick={simulatePaymentWebhook} disabled={isLoading}>
              {isLoading ? <Clock className="h-4 w-4 animate-spin" /> : <Webhook className="h-4 w-4" />}
              Simular Pagamento (POST)
            </Button>
          </div>
        </CardContent>
      </Card>

      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testResult.status === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Resultado do Teste
              <Badge variant={testResult.status === "success" ? "default" : "destructive"}>
                {testResult.status === "success" ? "Sucesso" : "Erro"}
              </Badge>
            </CardTitle>
            <CardDescription>Testado em: {new Date(testResult.timestamp).toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {testResult.payload && (
              <div>
                <Label>Payload Enviado:</Label>
                <Textarea
                  value={JSON.stringify(testResult.payload, null, 2)}
                  readOnly
                  className="font-mono text-sm"
                  rows={6}
                />
              </div>
            )}

            <div>
              <Label>Resposta:</Label>
              <Textarea
                value={JSON.stringify(testResult.data, null, 2)}
                readOnly
                className="font-mono text-sm"
                rows={8}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>📋 Checklist de Configuração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Deploy feito no Vercel</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span>Variáveis de ambiente configuradas</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span>Webhook configurado no Mercado Pago</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span>URL do webhook testada</span>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">🔗 URLs Importantes:</h4>
            <div className="space-y-1 text-sm">
              <div>
                <strong>Webhook:</strong> <code>/api/webhooks/mercadopago</code>
              </div>
              <div>
                <strong>Teste:</strong> <code>/payment-test</code>
              </div>
              <div>
                <strong>Criar Assinatura:</strong> <code>/api/create-subscription</code>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Button asChild variant="outline">
              <a href="https://www.mercadopago.com.br/developers" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Painel Mercado Pago
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
