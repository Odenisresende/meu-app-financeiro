"use client"

import { useState, useEffect } from "react"

export default function DebugComplete() {
  const [debugData, setDebugData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDebugData()
  }, [])

  const fetchDebugData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug-complete")
      const data = await response.json()
      setDebugData(data)
    } catch (error) {
      console.error("Erro ao buscar dados de debug:", error)
    }
    setLoading(false)
  }

  const renderSection = (title: string, data: any, bgColor = "bg-white") => {
    return (
      <div className={`${bgColor} rounded-lg p-6 shadow-sm border`}>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
        <pre className="text-sm bg-gray-50 p-4 rounded overflow-auto max-h-96">{JSON.stringify(data, null, 2)}</pre>
      </div>
    )
  }

  const getStatusColor = (success: boolean) => {
    return success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando diagnóstico completo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Diagnóstico Completo</h1>
          <p className="text-gray-600">Análise detalhada de todas as configurações e conexões</p>
          <button onClick={fetchDebugData} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            🔄 Atualizar Diagnóstico
          </button>
        </div>

        {debugData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ambiente */}
            {renderSection("🌍 Ambiente", debugData.environment)}

            {/* Mercado Pago */}
            {renderSection(
              "💳 Mercado Pago",
              debugData.mercadoPago,
              getStatusColor(debugData.mercadoPago?.connectionTest?.ok),
            )}

            {/* Supabase */}
            {renderSection(
              "🗄️ Supabase",
              debugData.supabase,
              getStatusColor(debugData.supabase?.connectionTest?.success),
            )}

            {/* URLs */}
            {renderSection("🔗 URLs", debugData.urls)}

            {/* Webhook Logs */}
            {renderSection("📋 Logs de Webhook", debugData.webhookLogs, getStatusColor(debugData.webhookLogs?.success))}

            {/* Resumo Geral */}
            <div className="lg:col-span-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-blue-800">📊 Resumo do Diagnóstico</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div
                      className={`text-2xl mb-2 ${debugData.mercadoPago?.connectionTest?.ok ? "text-green-600" : "text-red-600"}`}
                    >
                      {debugData.mercadoPago?.connectionTest?.ok ? "✅" : "❌"}
                    </div>
                    <p className="font-medium">Mercado Pago</p>
                    <p className="text-sm text-gray-600">
                      {debugData.mercadoPago?.connectionTest?.ok ? "Conectado" : "Erro de conexão"}
                    </p>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-2xl mb-2 ${debugData.supabase?.connectionTest?.success ? "text-green-600" : "text-red-600"}`}
                    >
                      {debugData.supabase?.connectionTest?.success ? "✅" : "❌"}
                    </div>
                    <p className="font-medium">Supabase</p>
                    <p className="text-sm text-gray-600">
                      {debugData.supabase?.connectionTest?.success ? "Conectado" : "Erro de conexão"}
                    </p>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-2xl mb-2 ${debugData.webhookLogs?.count > 0 ? "text-green-600" : "text-yellow-600"}`}
                    >
                      {debugData.webhookLogs?.count > 0 ? "📋" : "⏳"}
                    </div>
                    <p className="font-medium">Webhooks</p>
                    <p className="text-sm text-gray-600">{debugData.webhookLogs?.count || 0} logs encontrados</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
