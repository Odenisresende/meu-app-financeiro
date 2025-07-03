"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

export default function PaymentFailure() {
  const searchParams = useSearchParams()
  const [paymentData, setPaymentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const paymentId = searchParams.get("payment_id")
    const status = searchParams.get("status")
    const externalReference = searchParams.get("external_reference")

    setPaymentData({
      paymentId,
      status,
      externalReference,
      timestamp: new Date().toISOString(),
    })
    setLoading(false)

    // Log para debug
    console.log("❌ Pagamento rejeitado:", {
      paymentId,
      status,
      externalReference,
    })
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando pagamento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-800 mb-4">Pagamento Rejeitado</h1>
          <p className="text-gray-600 mb-6">
            Não foi possível processar seu pagamento. Verifique os dados do cartão e tente novamente.
          </p>

          {paymentData && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-bold text-red-800 mb-2">📋 Detalhes:</h3>
              <div className="text-sm space-y-1">
                <p>
                  <strong>ID:</strong> {paymentData.paymentId || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong> {paymentData.status || "rejected"}
                </p>
                <p>
                  <strong>Referência:</strong> {paymentData.externalReference || "N/A"}
                </p>
                <p>
                  <strong>Data:</strong> {new Date(paymentData.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-bold text-yellow-800 mb-2">💡 Possíveis Causas:</h3>
              <ul className="text-yellow-700 text-sm space-y-1 text-left">
                <li>• Dados do cartão incorretos</li>
                <li>• Cartão sem limite disponível</li>
                <li>• Cartão bloqueado ou vencido</li>
                <li>• Problema na conexão</li>
              </ul>
            </div>

            <div className="flex flex-col space-y-3">
              <a
                href="/test-payment-simple"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                🔄 Tentar Novamente
              </a>

              <a href="/" className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-medium">
                🏠 Voltar ao App
              </a>

              <a
                href="/debug-complete"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-medium"
              >
                🔍 Debug Sistema
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
