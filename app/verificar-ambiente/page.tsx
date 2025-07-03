"use client"

import { useState, useEffect } from "react"

export default function VerificarAmbiente() {
  const [environmentData, setEnvironmentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  const { tests, summary } = environmentData || {}
  const isSandbox = tests?.environment?.isSandbox

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">🔍 Verificação de Ambiente</h1>

        {/* Alerta Principal */}
        <div
          className={`rounded-lg p-6 mb-8 ${isSandbox ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200"} border`}
        >
          <h2 className={`text-xl font-bold mb-4 ${isSandbox ? "text-yellow-800" : "text-red-800"}`}>
            {isSandbox ? "⚠️ AMBIENTE SANDBOX" : "🚨 AMBIENTE PRODUÇÃO"}
          </h2>
          <p className={`${isSandbox ? "text-yellow-700" : "text-red-700"} mb-4`}>
            {isSandbox
              ? "Você está usando tokens de TESTE. Os pagamentos são simulados e não cobram dinheiro real."
              : "Você está usando tokens de PRODUÇÃO. Os pagamentos são REAIS e vão cobrar dinheiro!"}
          </p>

          {!isSandbox && (
            <div className="bg-red-100 border border-red-300 rounded p-4">
              <h3 className="font-bold text-red-800 mb-2">⚠️ ATENÇÃO:</h3>
              <ul className="text-red-700 text-sm space-y-1">
                <li>• Todos os pagamentos serão cobrados no cartão real</li>
                <li>• Use apenas para testes com valores baixos</li>
                <li>• Considere usar ambiente SANDBOX para testes</li>
              </ul>
            </div>
          )}
        </div>

        {/* Resultados dos Testes */}
        <div className="space-y-6">
          {tests &&
            Object.entries(tests).map(([testName, testResult]: [string, any]) => (
              <div key={testName} className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold capitalize">{testName.replace(/([A-Z])/g, " $1").trim()}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      testResult.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {testResult.success ? "✅ OK" : "❌ Erro"}
                  </span>
                </div>

                <pre className="text-sm bg-gray-50 p-4 rounded overflow-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            ))}
        </div>

        {/* Resumo e Recomendações */}
        {summary && (
          <div className="mt-8 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-800 mb-4">📋 Resumo</h3>
              <div className="space-y-2 text-blue-700">
                <p>
                  <strong>Ambiente:</strong> {summary.environment}
                </p>
                <p>
                  <strong>Pronto para teste:</strong> {summary.readyForTesting ? "Sim" : "Não"}
                </p>
                <p>
                  <strong>Todos os testes:</strong> {summary.allTestsPassed ? "Passaram" : "Falharam"}
                </p>
              </div>
            </div>

            {summary.warnings?.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-yellow-800 mb-4">⚠️ Avisos</h3>
                <ul className="text-yellow-700 space-y-1">
                  {summary.warnings.map((warning: string, index: number) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {summary.recommendations?.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-green-800 mb-4">💡 Recomendações</h3>
                <ul className="text-green-700 space-y-1">
                  {summary.recommendations.map((rec: string, index: number) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Ações */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button onClick={checkEnvironment} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            🔄 Verificar Novamente
          </button>

          <a href="/configurar-tokens" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">
            🔧 Configurar Tokens
          </a>

          <a href="/test-payment-simple" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
            🧪 Testar Pagamentos
          </a>
        </div>
      </div>
    </div>
  )
}
