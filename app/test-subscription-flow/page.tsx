"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

export default function TestSubscriptionFlow() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [testEmail, setTestEmail] = useState("")
  const [testName, setTestName] = useState("")

  // Carregar usuário atual
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        setTestEmail(user.email || "")
        setTestName(user.user_metadata?.full_name || "Usuário Teste")
      }
    }
    getUser()
  }, [])

  // Testar criação de assinatura
  const testCreateSubscription = async () => {
    if (!testEmail || !testName) {
      alert("Preencha email e nome para teste")
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id || `test_${Date.now()}`,
          userEmail: testEmail,
          userName: testName,
        }),
      })

      const data = await response.json()

      setResult({
        success: response.ok,
        status: response.status,
        data: data,
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    }

    setLoading(false)
  }

  // Verificar status da assinatura
  const checkSubscriptionStatus = async () => {
    if (!user?.id) {
      alert("Faça login primeiro")
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.from("user_subscriptions").select("*").eq("user_id", user.id).single()

      setResult({
        success: !error,
        data: data || { message: "Nenhuma assinatura encontrada" },
        error: error?.message,
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    }

    setLoading(false)
  }

  // Verificar logs do webhook
  const checkWebhookLogs = async () => {
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from("webhook_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

      setResult({
        success: !error,
        data: data || [],
        error: error?.message,
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 Teste Completo - Fluxo de Assinatura</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                <strong>📋 PASSO A PASSO:</strong>
                <br />
                1. Criar assinatura de teste
                <br />
                2. Verificar se foi salva no banco
                <br />
                3. Fazer pagamento no Mercado Pago
                <br />
                4. Verificar se webhook recebeu notificação
                <br />
                5. Confirmar se usuário virou premium
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Status do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle>👤 Status do Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <p>
                  <strong>ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-sm">{user.id}</code>
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <Badge className="bg-green-100 text-green-800">✅ Logado</Badge>
              </div>
            ) : (
              <div className="text-center py-4">
                <Badge className="bg-red-100 text-red-800">❌ Não logado</Badge>
                <p className="text-sm text-gray-600 mt-2">Faça login para testar com seu usuário real</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formulário de Teste */}
        <Card>
          <CardHeader>
            <CardTitle>🎯 Teste 1: Criar Assinatura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="testEmail">Email para Teste:</Label>
                <Input
                  id="testEmail"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <Label htmlFor="testName">Nome para Teste:</Label>
                <Input
                  id="testName"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="Seu Nome"
                />
              </div>
            </div>

            <Button
              onClick={testCreateSubscription}
              disabled={loading || !testEmail || !testName}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "⏳ Criando..." : "🚀 Criar Assinatura de Teste"}
            </Button>
          </CardContent>
        </Card>

        {/* Testes de Verificação */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>🔍 Teste 2: Verificar Assinatura</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={checkSubscriptionStatus}
                disabled={loading || !user}
                className="w-full bg-transparent"
                variant="outline"
              >
                {loading ? "⏳ Verificando..." : "📊 Verificar Status da Assinatura"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📋 Teste 3: Verificar Webhook</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={checkWebhookLogs} disabled={loading} className="w-full bg-transparent" variant="outline">
                {loading ? "⏳ Carregando..." : "🔔 Ver Últimos Webhooks"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Resultado */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>📊 Resultado do Teste</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`p-4 rounded-lg ${
                  result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {result.success ? "✅ SUCESSO" : "❌ ERRO"}
                  </Badge>
                  {result.status && <span className="text-sm text-gray-500">Status: {result.status}</span>}
                </div>

                {/* Se for resultado de criação de assinatura, mostrar link de pagamento */}
                {result.success && result.data?.paymentUrl && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <h4 className="font-semibold text-blue-800 mb-2">🎉 Assinatura Criada!</h4>
                    <p className="text-sm text-blue-700 mb-3">Clique no link abaixo para fazer o pagamento de teste:</p>
                    <a
                      href={result.data.sandboxUrl || result.data.paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      💳 Pagar R$ 17,00 (Teste)
                    </a>
                  </div>
                )}

                <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-60">
                  {JSON.stringify(result.data || result.error, null, 2)}
                </pre>

                <div className="text-xs text-gray-500 mt-2">{new Date(result.timestamp).toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>📝 Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">1</span>
                <div>
                  <strong>Criar Assinatura:</strong> Use o formulário acima para criar uma assinatura de teste
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">2</span>
                <div>
                  <strong>Fazer Pagamento:</strong> Clique no link de pagamento que aparecer
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">3</span>
                <div>
                  <strong>Usar Cartão Teste:</strong> No Mercado Pago, use cartão 4509 9535 6623 3704
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">4</span>
                <div>
                  <strong>Verificar Webhook:</strong> Volte aqui e clique "Ver Últimos Webhooks"
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">5</span>
                <div>
                  <strong>Confirmar Premium:</strong> Verifique se o usuário virou premium
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
