"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Clock, CreditCard, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react"

export default function TestPaymentComplete() {
  const [userEmail, setUserEmail] = useState("cliente.teste@exemplo.com")
  const [userName, setUserName] = useState("João Silva Teste")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<any>(null)

  const createTestPayment = async () => {
    setLoading(true)
    setResult(null)
    setPaymentStatus(null)

    try {
      console.log("Enviando dados:", { userEmail, userName })

      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail,
          userName,
          planType: "premium",
          amount: 19.9,
        }),
      })

      const data = await response.json()
      console.log("Resposta da API:", data)

      if (data.success) {
        setResult({
          type: "success",
          message: "Pagamento criado com sucesso!",
          data: data,
        })

        // Abrir checkout do Mercado Pago
        const checkoutUrl = data.sandboxUrl || data.paymentUrl
        if (checkoutUrl) {
          console.log("Abrindo checkout:", checkoutUrl)
          window.open(checkoutUrl, "_blank")
        }
      } else {
        setResult({
          type: "error",
          message: data.error || "Erro desconhecido",
          details: data.details,
        })
      }
    } catch (error) {
      console.error("Erro ao criar pagamento:", error)
      setResult({
        type: "error",
        message: "Erro ao conectar com o servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
    } finally {
      setLoading(false)
    }
  }

  const checkPaymentStatus = async () => {
    if (!result?.data?.preferenceId) {
      alert("Primeiro crie um pagamento!")
      return
    }

    try {
      const response = await fetch(`/api/check-payment-status?preferenceId=${result.data.preferenceId}`)
      const data = await response.json()
      setPaymentStatus(data)
    } catch (error) {
      console.error("Erro ao verificar status:", error)
      setPaymentStatus({
        error: "Erro ao verificar status",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }
  }

  const generateRandomEmail = () => {
    const domains = ["exemplo.com", "teste.com", "demo.com"]
    const names = ["cliente", "usuario", "comprador", "teste"]
    const randomName = names[Math.floor(Math.random() * names.length)]
    const randomDomain = domains[Math.floor(Math.random() * domains.length)]
    const randomNumber = Math.floor(Math.random() * 1000)

    setUserEmail(`${randomName}${randomNumber}@${randomDomain}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header com Status do Banco */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Problemas Corrigidos!
            </CardTitle>
            <CardDescription>
              ✅ Erro de constraint do banco corrigido (usando INSERT ao invés de UPSERT)
              <br />✅ Configuração do Mercado Pago otimizada para evitar erro "pagar para si mesmo"
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Formulário de Teste */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              Teste Completo de Pagamento
            </CardTitle>
            <CardDescription>Teste o fluxo completo de pagamento com Mercado Pago</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userName">Nome Completo</Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <Label htmlFor="userEmail">Email</Label>
                <div className="flex gap-2">
                  <Input
                    id="userEmail"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="cliente@exemplo.com"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateRandomEmail}
                    className="px-3 bg-transparent"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> Use um email diferente da sua conta do Mercado Pago. Clique no botão de
                refresh para gerar um email aleatório.
              </AlertDescription>
            </Alert>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Plano Premium</h4>
              <p className="text-blue-700 text-sm mb-2">
                • Controle financeiro completo
                <br />• Relatórios em PDF
                <br />• Integração WhatsApp
                <br />• Suporte prioritário
              </p>
              <p className="text-2xl font-bold text-blue-900">R$ 19,90/mês</p>
            </div>

            <Button
              onClick={createTestPayment}
              disabled={loading || !userEmail || !userName}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando Pagamento...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Criar Pagamento de Teste
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resultado do Teste */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.type === "success" ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Resultado do Teste
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert
                className={result.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
              >
                <AlertDescription>
                  <div className="space-y-2">
                    <p className={result.type === "success" ? "text-green-800" : "text-red-800"}>{result.message}</p>
                    {result.details && <p className="text-sm text-gray-600">Detalhes: {result.details}</p>}
                    {result.data && (
                      <div className="mt-3 p-3 bg-gray-100 rounded text-sm space-y-1">
                        <p>
                          <strong>Preference ID:</strong> {result.data.preferenceId}
                        </p>
                        <p>
                          <strong>User ID:</strong> {result.data.testUserId}
                        </p>
                        <p>
                          <strong>Email:</strong> {result.data.userEmail}
                        </p>
                        <p>
                          <strong>Nome:</strong> {result.data.userName}
                        </p>
                        {result.data.sandboxUrl && (
                          <p>
                            <strong>URL Checkout:</strong>
                            <a
                              href={result.data.sandboxUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline ml-1"
                            >
                              <ExternalLink className="h-3 w-3 inline mr-1" />
                              Abrir novamente
                            </a>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              {result.type === "success" && (
                <div className="mt-4 space-y-3">
                  <Button onClick={checkPaymentStatus} variant="outline" className="w-full bg-transparent">
                    <Clock className="h-4 w-4 mr-2" />
                    Verificar Status do Pagamento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Status do Pagamento */}
        {paymentStatus && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Status do Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentStatus.error ? (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Erro:</strong> {paymentStatus.error}
                    {paymentStatus.details && <br />}
                    {paymentStatus.details && <span className="text-sm">{paymentStatus.details}</span>}
                  </AlertDescription>
                </Alert>
              ) : (
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                  {JSON.stringify(paymentStatus, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        )}

        {/* Cartões de Teste */}
        <Card>
          <CardHeader>
            <CardTitle>Cartões de Teste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">✅ Aprovado</h4>
                <p className="text-sm text-green-600 font-mono mb-1">5031 7557 3453 0604</p>
                <p className="text-xs text-green-600">CVV: 123 | Validade: 11/25</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-800 mb-2">❌ Rejeitado</h4>
                <p className="text-sm text-red-600 font-mono mb-1">5031 4332 1540 6351</p>
                <p className="text-xs text-red-600">CVV: 123 | Validade: 11/25</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">⏳ Pendente</h4>
                <p className="text-sm text-yellow-600 font-mono mb-1">4235 6477 2802 5682</p>
                <p className="text-xs text-yellow-600">CVV: 123 | Validade: 11/25</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
