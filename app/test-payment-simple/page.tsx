"use client"

import { useState } from "react"

export default function TestPaymentSimple() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState<string | null>(null)

  const testAPIs = async () => {
    setLoading("apis")
    try {
      const response = await fetch("/api/test-payment-flow")
      const data = await response.json()
      setResults({ ...results, apis: data })
    } catch (error) {
      setResults({ ...results, apis: { success: false, error: "Erro ao testar APIs" } })
    }
    setLoading(null)
  }

  const createPayment = async () => {
    setLoading("payment")
    try {
      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "test-user-123" }),
      })
      const data = await response.json()
      setResults({ ...results, payment: data })

      if (data.success && data.initPoint) {
        window.open(data.initPoint, "_blank")
      }
    } catch (error) {
      setResults({ ...results, payment: { success: false, error: "Erro ao criar pagamento" } })
    }
    setLoading(null)
  }

  const checkPremium = async () => {
    setLoading("check")
    try {
      const response = await fetch("/api/check-subscription?userId=test-user-123")
      const data = await response.json()
      setResults({ ...results, check: data })
    } catch (error) {
      setResults({ ...results, check: { success: false, error: "Erro ao verificar premium" } })
    }
    setLoading(null)
  }

  const activateManual = async () => {
    setLoading("activate")
    try {
      const response = await fetch("/api/activate-premium-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "test-user-123" }),
      })
      const data = await response.json()
      setResults({ ...results, activate: data })

      // Verificar novamente após ativar
      if (data.success) {
        setTimeout(() => {
          checkPremium()
        }, 1000)
      }
    } catch (error) {
      setResults({ ...results, activate: { success: false, error: "Erro ao ativar premium" } })
    }
    setLoading(null)
  }

  const debugWebhook = async () => {
    setLoading("debug")
    try {
      const response = await fetch("/api/debug-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const data = await response.json()
      setResults({ ...results, debug: data })
    } catch (error) {
      setResults({ ...results, debug: { success: false, error: "Erro ao testar webhook" } })
    }
    setLoading(null)
  }

  const renderResult = (key: string, title: string) => {
    const result = results[key]
    if (!result) return null

    const isSuccess = result.success || result.status === "✅ OK"
    const bgColor = isSuccess ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
    const textColor = isSuccess ? "text-green-800" : "text-red-800"
    const icon = isSuccess ? "✅" : "❌"

    return (
      <div className={`border rounded-lg p-4 mt-4 ${bgColor}`}>
        <h3 className={`font-bold ${textColor} mb-2`}>
          {icon} {title}
        </h3>
        <pre className="text-sm overflow-auto max-h-60 bg-white p-2 rounded">{JSON.stringify(result, null, 2)}</pre>
      </div>
    )
  }

  const renderPremiumStatus = () => {
    const result = results.check
    if (!result) return null

    return (
      <div
        className={`border rounded-lg p-4 mt-4 ${result.isPremium ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}
      >
        <h3 className={`font-bold ${result.isPremium ? "text-green-800" : "text-yellow-800"} mb-2`}>
          {result.isPremium ? "🎉 Premium ATIVO!" : "⏳ Premium não ativo"}
        </h3>
        <div className="text-sm space-y-1">
          <p>
            <strong>Status:</strong> {result.status}
          </p>
          <p>
            <strong>Plano:</strong> {result.planType}
          </p>
          <p>
            <strong>Is Active:</strong> {result.isActive ? "true" : "false"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">🧪 Teste de Integração - Mercado Pago</h1>

        <div className="space-y-6">
          {/* Teste 1: APIs */}
          <div>
            <button
              onClick={testAPIs}
              disabled={loading === "apis"}
              className="w-full bg-slate-600 text-white py-4 px-6 rounded-lg hover:bg-slate-700 disabled:opacity-50 text-lg font-semibold"
            >
              {loading === "apis" ? "Testando..." : "1. Testar APIs"}
            </button>
            {renderResult("apis", "Resultado do Teste de APIs")}
          </div>

          {/* Teste 2: Pagamento */}
          <div>
            <button
              onClick={createPayment}
              disabled={loading === "payment"}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-lg font-semibold"
            >
              {loading === "payment" ? "Criando..." : "2. Criar Pagamento Mensal"}
            </button>
            {renderResult("payment", "Pagamento criado!")}
          </div>

          {/* Teste 3: Verificar Premium */}
          <div>
            <button
              onClick={checkPremium}
              disabled={loading === "check"}
              className="w-full bg-purple-600 text-white py-4 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 text-lg font-semibold"
            >
              {loading === "check" ? "Verificando..." : "3. Verificar Status Premium"}
            </button>
            {renderPremiumStatus()}
          </div>

          {/* Teste 4: Ativar Manual */}
          <div>
            <button
              onClick={activateManual}
              disabled={loading === "activate"}
              className="w-full bg-orange-600 text-white py-4 px-6 rounded-lg hover:bg-orange-700 disabled:opacity-50 text-lg font-semibold"
            >
              {loading === "activate" ? "Ativando..." : "4. Ativar Premium Manualmente (Teste)"}
            </button>
            {renderResult("activate", "Premium ativado manualmente!")}
          </div>

          {/* Teste 5: Debug Webhook */}
          <div>
            <button
              onClick={debugWebhook}
              disabled={loading === "debug"}
              className="w-full bg-red-600 text-white py-4 px-6 rounded-lg hover:bg-red-700 disabled:opacity-50 text-lg font-semibold"
            >
              {loading === "debug" ? "Testando..." : "5. Testar Webhook (Debug)"}
            </button>
            {renderResult("debug", "Teste do Webhook")}
          </div>
        </div>

        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-bold text-red-800 mb-2">🚨 PROBLEMA IDENTIFICADO:</h3>
          <p className="text-red-700 mb-3">
            O webhook está funcionando internamente, mas o <strong>Mercado Pago não está chamando nosso webhook</strong>{" "}
            quando o pagamento é processado.
          </p>
          <div className="text-center">
            <a
              href="/configurar-webhook"
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-medium inline-block"
            >
              🔧 CONFIGURAR WEBHOOK AGORA
            </a>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-bold text-blue-800 mb-2">📋 Instruções:</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>
              1. <strong>PRIMEIRO:</strong> Configure o webhook no Mercado Pago (botão vermelho acima)
            </li>
            <li>
              2. <strong>Teste as APIs</strong> - Verifica se tudo está configurado
            </li>
            <li>
              3. <strong>Crie o pagamento</strong> - Abrirá nova aba do Mercado Pago
            </li>
            <li>
              4. <strong>Use cartão de teste:</strong> 4509 9535 6623 3704, 11/25, 123, APRO
            </li>
            <li>
              5. <strong>Volte aqui e verifique</strong> - Se o premium foi ativado automaticamente
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
