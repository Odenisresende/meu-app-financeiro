"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

export default function PaymentSuccess() {
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
    console.log("🎉 Pagamento aprovado:", {
      paymentId,
      status,
      externalReference,
    })
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processando pagamento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-green-800 mb-4">Pagamento Aprovado!</h1>
          <p className="text-gray-600 mb-6">
            Seu pagamento foi processado com sucesso. O premium será ativado em alguns minutos.
          </p>

          {paymentData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-bold text-green-800 mb-2">📋 Detalhes do Pagamento:</h3>
              <div className="text-sm space-y-1">
                <p>
                  <strong>ID:</strong> {paymentData.paymentId}
                </p>
                <p>
                  <strong>Status:</strong> {paymentData.status}
                </p>
                <p>
                  <strong>Referência:</strong> {paymentData.externalReference}
                </p>
                <p>
                  <strong>Data:</strong> {new Date(paymentData.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-800 mb-2">⏳ Próximos Passos:</h3>
              <ul className="text-blue-700 text-sm space-y-1 text-left">
                <li>• O webhook processará o pagamento automaticamente</li>
                <li>• O premium será ativado em até 5 minutos</li>
                <li>• Você receberá uma confirmação por email</li>
                <li>• Já pode fechar esta página</li>
              </ul>
            </div>

            <div className="flex flex-col space-y-3">
              <a href="/" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium">
                🏠 Voltar ao App
              </a>

              <a
                href="/debug-complete"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                🔍 Verificar Status
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
