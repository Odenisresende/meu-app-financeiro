"use client"

import { useState, useEffect } from "react"

export default function ProductionTest() {
  const [environmentData, setEnvironmentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [testResults, setTestResults] = useState<any>({})

  useEffect(() => {
    checkEnvironment()
  }, [])

  const checkEnvironment = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-payment-flow")
      const data = await response.json()
      setEnvironmentData(data)
    } catch (error) {
      console.error("Erro ao verificar ambiente:", error)
    }
    setLoading(false)
  }

  const createRealPayment = async () => {
    try {
      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "production-user-" + Date.now() }),
      })
      const data = await response.json()
      setTestResults({ ...testResults, payment: data })

      if (data.success && data.initPoint) {
        window.open(data.initPoint, "_blank")
      }
    } catch (error) {
      setTestResults({ ...testResults, payment: { success: false, error: "Erro ao criar pagamento" } })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando ambiente...</p>
        </div>
      </div>
    )
  }

  const isSandbox = environmentData?.tests?.environment?.isSandbox
  const isProduction = !isSandbox

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">🚀 Teste de Produção</h1>

        {/* Alerta de Ambiente */}
        <div
          className={`rounded-lg p-6 mb-8 border ${
            isProduction ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"
          }`}
        >
          <h2 className={`text-xl font-bold mb-4 ${isProduction ? "text-red-800" : "text-yellow-800"}`}>
            {isProduction ? "🚨 AMBIENTE DE PRODUÇÃO" : "🧪 AMBIENTE SANDBOX"}
          </h2>
          <p className={`mb-4 ${isProduction ? "text-red-700" : "text-yellow-700"}`}>
            {isProduction
              ? "ATENÇÃO: Os pagamentos são REAIS e vão cobrar dinheiro do cartão!"
              : "Os pagamentos são simulados. Use cartões de teste."}
          </p>

          {isProduction && (
            <div className="bg-red-100 border border-red-300 rounded p-4">
              <h3 className="font-bold text-red-800 mb-2">⚠️ ANTES DE CONTINUAR:</h3>
              <ul className="text-red-700 text-sm space-y-1">
                <li>• Certifique-se de que quer fazer um pagamento REAL</li>
                <li>• O valor será cobrado no cartão (R$ 19,90)</li>
                <li>• Configure o webhook no Mercado Pago primeiro</li>
                <li>• Tenha certeza de que o sistema está funcionando</li>
              </ul>
            </div>
          )}
        </div>

        {/* Status do Sistema */}
        {environmentData && (
          <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
            <h3 className="text-lg font-bold mb-4">📊 Status do Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div
                  className={`text-2xl mb-2 ${
                    environmentData.tests?.mercadoPago?.success ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {environmentData.tests?.mercadoPago?.success ? "✅" : "❌"}
                </div>
                <p className="font-medium">Mercado Pago</p>
                <p className="text-sm text-gray-600">{environmentData.tests?.environment?.environment}</p>
              </div>

              <div className="text-center">
                <div
                  className={`text-2xl mb-2 ${
                    environmentData.tests?.supabase?.success ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {environmentData.tests?.supabase?.success ? "✅" : "❌"}
                </div>
                <p className="font-medium">Supabase</p>
                <p className="text-sm text-gray-600">Banco de dados</p>
              </div>

              <div className="text-center">
                <div
                  className={`text-2xl mb-2 ${
                    environmentData.tests?.webhookLogs?.success ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {environmentData.tests?.webhookLogs?.success ? "✅" : "❌"}
                </div>
                <p className="font-medium">Webhooks</p>
                <p className="text-sm text-gray-600">{environmentData.tests?.webhookLogs?.count || 0} logs</p>
              </div>
            </div>
          </div>
        )}

        {/* Botão de Teste */}
        <div className="text-center mb-8">
          {isProduction ? (
            <div className="space-y-4">
              <button
                onClick={createRealPayment}
                className="bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 text-lg font-semibold"
              >
                💳 CRIAR PAGAMENTO REAL (R$ 19,90)
              </button>
              <p className="text-red-600 text-sm">⚠️ Este pagamento será cobrado no seu cartão!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={createRealPayment}
                className="bg-yellow-600 text-white px-8 py-4 rounded-lg hover:bg-yellow-700 text-lg font-semibold"
              >
                🧪 CRIAR PAGAMENTO TESTE
              </button>
              <p className="text-yellow-600 text-sm">Use cartão: 4509 9535 6623 3704, 11/25, 123, APRO</p>
            </div>
          )}
        </div>

        {/* Resultado do Teste */}
        {testResults.payment && (
          <div
            className={`rounded-lg p-6 border ${
              testResults.payment.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            }`}
          >
            <h3 className={`font-bold mb-4 ${testResults.payment.success ? "text-green-800" : "text-red-800"}`}>
              {testResults.payment.success ? "✅ Pagamento Criado!" : "❌ Erro no Pagamento"}
            </h3>
            <pre className="text-sm bg-white p-4 rounded overflow-auto">
              {JSON.stringify(testResults.payment, null, 2)}
            </pre>
          </div>
        )}

        {/* Links Úteis */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <a href="/verificar-ambiente" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            🔍 Verificar Ambiente
          </a>

          <a href="/configurar-tokens" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">
            🔧 Configurar Tokens
          </a>

          <a href="/configurar-webhook" className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700">
            🔗 Configurar Webhook
          </a>
        </div>
      </div>
    </div>
  )
}
