"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestPaymentPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testPayment = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-payment-flow")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: "Erro ao testar pagamento" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testPayment} disabled={loading} className="w-full">
            {loading ? "Testando..." : "Testar Fluxo de Pagamento"}
          </Button>

          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
