"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function TestPaymentPage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runTests = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/test-payment-flow")
      const data = await response.json()
      setTestResults(data)
    } catch (error) {
      setTestResults({ error: "Erro ao executar testes" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Teste de Pagamento</h1>
        <p className="text-gray-600">Teste completo da integração com Mercado Pago</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Testes Automáticos</CardTitle>
            <CardDescription>Verificar configuração e conectividade</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runTests} disabled={isLoading} className="w-full">
              {isLoading ? "Executando..." : "Executar Testes"}
            </Button>

            {testResults && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">{JSON.stringify(testResults, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💳 Teste Manual</CardTitle>
            <CardDescription>Testar fluxo completo de pagamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Use os dados de teste do Mercado Pago:</p>
            <div className="bg-blue-50 p-3 rounded text-sm">
              <strong>Cartão de teste:</strong>
              <br />
              Número: 4509 9535 6623 3704
              <br />
              Vencimento: 11/25
              <br />
              CVV: 123
              <br />
              Nome: APRO (aprovado)
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                Componente de assinatura será carregado aqui quando a autenticação estiver funcionando.
              </p>
              <Button disabled className="w-full">
                Teste de Pagamento (Requer Login)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
