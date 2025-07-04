"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, CreditCard, User, Mail } from "lucide-react"

export default function TestPaymentComplete() {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentResult, setPaymentResult] = useState<any>(null)
  const [userEmail, setUserEmail] = useState("")
  const [userName, setUserName] = useState("")

  const createTestPayment = async () => {
    if (!userEmail || !userName) {
      alert("Preencha email e nome para teste")
      return
    }

    setIsLoading(true)
    setPaymentResult(null)

    try {
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
      setPaymentResult(data)

      if (data.success && data.paymentUrl) {
        // Abrir URL de pagamento em nova aba
        window.open(data.paymentUrl, "_blank")
      }
    } catch (error) {
      console.error("Erro ao criar pagamento:", error)
      setPaymentResult({
        success: false,
        error: "Erro ao conectar com o servidor",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const checkPaymentStatus = async () => {
    if (!paymentResult?.paymentId) return

    try {
      const response = await fetch(`/api/check-payment-status?paymentId=${paymentResult.paymentId}`)
      const data = await response.json()

      setPaymentResult((prev) => ({
        ...prev,
        status: data.status,
        statusDetail: data.statusDetail,
        lastCheck: new Date().toLocaleTimeString(),
      }))
    } catch (error) {
      console.error("Erro ao verificar status:", error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              Teste Completo de Pagamento - Mercado Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Formulário de Teste */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Dados para Teste</h3>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nome Completo
                  </Label>
                  <Input
                    type="text"
                    placeholder="João Silva"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    type="email"
                    placeholder="joao@email.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Plano Premium</h4>
                  <p className="text-blue-700 text-sm mb-2">
                    • Controle financeiro completo • Relatórios em PDF • Integração WhatsApp • Suporte prioritário
                  </p>
                  <p className="text-2xl font-bold text-blue-900">R$ 19,90/mês</p>
                </div>

                <Button
                  onClick={createTestPayment}
                  disabled={isLoading || !userEmail || !userName}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
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
              </div>

              {/* Resultado */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Resultado do Teste</h3>

                {paymentResult ? (
                  <div className="space-y-4">
                    {paymentResult.success ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-900">Pagamento Criado!</span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <p>
                            <strong>ID:</strong> {paymentResult.paymentId}
                          </p>
                          <p>
                            <strong>URL:</strong>
                            <a
                              href={paymentResult.paymentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline ml-1"
                            >
                              Abrir Pagamento
                            </a>
                          </p>
                          {paymentResult.status && (
                            <div className="flex items-center gap-2 mt-3">
                              {getStatusIcon(paymentResult.status)}
                              <Badge className={getStatusColor(paymentResult.status)}>
                                {paymentResult.status.toUpperCase()}
                              </Badge>
                              {paymentResult.lastCheck && (
                                <span className="text-xs text-gray-500">
                                  Última verificação: {paymentResult.lastCheck}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <Button
                          onClick={checkPaymentStatus}
                          variant="outline"
                          size="sm"
                          className="mt-3 bg-transparent"
                        >
                          Verificar Status
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle className="h-5 w-5 text-red-600" />
                          <span className="font-medium text-red-900">Erro no Pagamento</span>
                        </div>
                        <p className="text-red-700 text-sm">{paymentResult.error}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Preencha os dados e clique em "Criar Pagamento de Teste"</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>Como Testar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Cartões de Teste</h4>
                <div className="space-y-2 text-sm">
                  <div className="bg-green-50 p-3 rounded">
                    <p>
                      <strong>Aprovado:</strong> 5031 7557 3453 0604
                    </p>
                    <p>CVV: 123 | Validade: 11/25</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <p>
                      <strong>Rejeitado:</strong> 5031 4332 1540 6351
                    </p>
                    <p>CVV: 123 | Validade: 11/25</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded">
                    <p>
                      <strong>Pendente:</strong> 5031 4332 1540 6351
                    </p>
                    <p>CVV: 123 | Validade: 11/25</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Fluxo de Teste</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Preencha nome e email</li>
                  <li>Clique em "Criar Pagamento"</li>
                  <li>Uma nova aba abrirá com o checkout</li>
                  <li>Use um cartão de teste</li>
                  <li>Complete o pagamento</li>
                  <li>Volte aqui e clique "Verificar Status"</li>
                  <li>Verifique se o webhook foi recebido</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
