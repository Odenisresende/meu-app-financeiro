"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  CreditCard,
  Settings,
  TestTube,
  Copy,
  ExternalLink,
  Crown,
  User,
  Mail,
  Hash,
} from "lucide-react"

export default function TestPaymentComplete() {
  // Estados para configuração
  const [testData, setTestData] = useState({
    name: "João Silva",
    email: "joao.silva@email.com",
    userId: "user_123456789",
  })

  // Estados para resultados
  const [results, setResults] = useState<{ [key: string]: any }>({})
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({})

  // Geradores automáticos
  const generateEmail = () => {
    const domains = ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com"]
    const names = ["joao", "maria", "pedro", "ana", "carlos", "lucia"]
    const numbers = Math.floor(Math.random() * 999) + 1
    const name = names[Math.floor(Math.random() * names.length)]
    const domain = domains[Math.floor(Math.random() * domains.length)]
    return `${name}${numbers}@${domain}`
  }

  const generateUserId = () => {
    return `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`
  }

  // Função genérica para executar testes
  const runTest = async (testKey: string, endpoint: string, data?: any) => {
    setLoading((prev) => ({ ...prev, [testKey]: true }))

    try {
      const response = await fetch(endpoint, {
        method: data ? "POST" : "GET",
        headers: data ? { "Content-Type": "application/json" } : {},
        body: data ? JSON.stringify(data) : undefined,
      })

      const result = await response.json()

      setResults((prev) => ({
        ...prev,
        [testKey]: {
          success: response.ok,
          status: response.status,
          data: result,
          timestamp: new Date().toLocaleString("pt-BR"),
        },
      }))
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [testKey]: {
          success: false,
          error: error instanceof Error ? error.message : "Erro desconhecido",
          timestamp: new Date().toLocaleString("pt-BR"),
        },
      }))
    } finally {
      setLoading((prev) => ({ ...prev, [testKey]: false }))
    }
  }

  // Testes específicos
  const testEnvironment = () => runTest("env", "/api/test-env")
  const testMercadoPago = () => runTest("mp", "/api/test-mp-connection")
  const testSupabase = () => runTest("supabase", "/api/test-supabase-direct")

  const createRealPayment = () =>
    runTest("payment", "/api/create-subscription", {
      userId: testData.userId,
      userEmail: testData.email,
      userName: testData.name,
    })

  const checkPaymentStatus = () => runTest("status", `/api/check-subscription?userId=${testData.userId}`)

  const simulatePayment = () =>
    runTest("simulate", "/api/simulate-payment", {
      userId: testData.userId,
      amount: 17.0,
    })

  const activatePremium = () =>
    runTest("activate", "/api/activate-premium-manual", {
      userId: testData.userId,
    })

  // Função para copiar texto
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copiado para a área de transferência!")
  }

  // Componente para mostrar resultados
  const ResultCard = ({ testKey, title }: { testKey: string; title: string }) => {
    const result = results[testKey]
    const isLoading = loading[testKey]

    if (!result && !isLoading) return null

    return (
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            {title}
            <Badge variant={result?.success ? "default" : "destructive"} className="ml-auto">
              {result?.success ? "Sucesso" : "Erro"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded p-3">
            <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-lg border-0">
          <CardHeader style={{ backgroundColor: "#152638" }}>
            <CardTitle className="text-white text-xl flex items-center gap-2">
              <TestTube className="h-6 w-6" />
              Central de Testes de Pagamento
            </CardTitle>
            <p className="text-white/80 text-sm">
              Teste completo de todas as funcionalidades de pagamento e assinatura
            </p>
          </CardHeader>
        </Card>

        {/* Tabs principais */}
        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuração
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pagamento Real
            </TabsTrigger>
            <TabsTrigger value="simulation" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Simulação
            </TabsTrigger>
            <TabsTrigger value="cards" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Cartões de Teste
            </TabsTrigger>
          </TabsList>

          {/* Aba Configuração */}
          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dados do Teste
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nome Completo
                    </Label>
                    <Input
                      id="name"
                      value={testData.name}
                      onChange={(e) => setTestData({ ...testData, name: e.target.value })}
                      placeholder="João Silva"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="email"
                        type="email"
                        value={testData.email}
                        onChange={(e) => setTestData({ ...testData, email: e.target.value })}
                        placeholder="joao@email.com"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTestData({ ...testData, email: generateEmail() })}
                      >
                        Gerar
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="userId" className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      User ID
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="userId"
                        value={testData.userId}
                        onChange={(e) => setTestData({ ...testData, userId: e.target.value })}
                        placeholder="user_123456789"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTestData({ ...testData, userId: generateUserId() })}
                      >
                        Gerar
                      </Button>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Importante:</strong> Use dados fictícios para testes. Nunca use informações reais de
                    clientes.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Testes de Configuração */}
            <Card>
              <CardHeader>
                <CardTitle>Testes de Configuração</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={testEnvironment}
                    disabled={loading.env}
                    variant="outline"
                    className="h-20 flex-col bg-transparent"
                  >
                    {loading.env ? (
                      <RefreshCw className="h-4 w-4 animate-spin mb-2" />
                    ) : (
                      <Settings className="h-4 w-4 mb-2" />
                    )}
                    Variáveis de Ambiente
                  </Button>

                  <Button
                    onClick={testSupabase}
                    disabled={loading.supabase}
                    variant="outline"
                    className="h-20 flex-col bg-transparent"
                  >
                    {loading.supabase ? (
                      <RefreshCw className="h-4 w-4 animate-spin mb-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mb-2" />
                    )}
                    Conexão Supabase
                  </Button>

                  <Button
                    onClick={testMercadoPago}
                    disabled={loading.mp}
                    variant="outline"
                    className="h-20 flex-col bg-transparent"
                  >
                    {loading.mp ? (
                      <RefreshCw className="h-4 w-4 animate-spin mb-2" />
                    ) : (
                      <CreditCard className="h-4 w-4 mb-2" />
                    )}
                    Mercado Pago API
                  </Button>
                </div>

                <ResultCard testKey="env" title="Teste de Variáveis de Ambiente" />
                <ResultCard testKey="supabase" title="Teste de Conexão Supabase" />
                <ResultCard testKey="mp" title="Teste de Conexão Mercado Pago" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Pagamento Real */}
          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Pagamento Real no Mercado Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Atenção:</strong> Isso criará um pagamento real no Mercado Pago. Use apenas para testes em
                    ambiente de desenvolvimento.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={createRealPayment}
                    disabled={loading.payment}
                    className="h-16 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading.payment ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CreditCard className="h-4 w-4 mr-2" />
                    )}
                    Criar Pagamento Real
                  </Button>

                  <Button
                    onClick={checkPaymentStatus}
                    disabled={loading.status}
                    variant="outline"
                    className="h-16 bg-transparent"
                  >
                    {loading.status ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Verificar Status
                  </Button>
                </div>

                <ResultCard testKey="payment" title="Resultado da Criação de Pagamento" />
                <ResultCard testKey="status" title="Status do Pagamento" />

                {results.payment?.data?.init_point && (
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-green-900">Link de Pagamento Criado!</h4>
                          <p className="text-green-700 text-sm">Clique para abrir o checkout do Mercado Pago</p>
                        </div>
                        <Button
                          onClick={() => window.open(results.payment.data.init_point, "_blank")}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Abrir Checkout
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Simulação */}
          <TabsContent value="simulation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Simulação de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Seguro:</strong> Estas simulações não criam pagamentos reais, apenas testam a lógica do
                    sistema.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={simulatePayment}
                    disabled={loading.simulate}
                    className="h-16 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {loading.simulate ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <TestTube className="h-4 w-4 mr-2" />
                    )}
                    Simular Pagamento Aprovado
                  </Button>

                  <Button
                    onClick={activatePremium}
                    disabled={loading.activate}
                    className="h-16 bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    {loading.activate ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Crown className="h-4 w-4 mr-2" />
                    )}
                    Ativar Premium Manual
                  </Button>
                </div>

                <ResultCard testKey="simulate" title="Resultado da Simulação" />
                <ResultCard testKey="activate" title="Resultado da Ativação Premium" />

                {(results.simulate?.success || results.activate?.success) && (
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-yellow-600" />
                        <div>
                          <h4 className="font-semibold text-yellow-900">Status Premium Ativo!</h4>
                          <p className="text-yellow-700 text-sm">O usuário agora tem acesso aos recursos premium</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Cartões de Teste */}
          <TabsContent value="cards" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cartões de Teste do Mercado Pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Use estes cartões apenas em ambiente de testes. Eles simulam diferentes cenários de pagamento.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cartão Aprovado */}
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-green-900 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Pagamento Aprovado
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Número:</span>
                          <div className="flex items-center gap-2">
                            <code className="bg-white px-2 py-1 rounded text-sm">4111 1111 1111 1111</code>
                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard("4111111111111111")}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">CVV:</span>
                          <code className="bg-white px-2 py-1 rounded text-sm">123</code>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Validade:</span>
                          <code className="bg-white px-2 py-1 rounded text-sm">12/25</code>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-300">✅ Aprovado</Badge>
                    </CardContent>
                  </Card>

                  {/* Cartão Rejeitado */}
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-red-900 flex items-center gap-2">
                        <XCircle className="h-5 w-5" />
                        Pagamento Rejeitado
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Número:</span>
                          <div className="flex items-center gap-2">
                            <code className="bg-white px-2 py-1 rounded text-sm">4000 0000 0000 0002</code>
                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard("4000000000000002")}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">CVV:</span>
                          <code className="bg-white px-2 py-1 rounded text-sm">123</code>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Validade:</span>
                          <code className="bg-white px-2 py-1 rounded text-sm">12/25</code>
                        </div>
                      </div>
                      <Badge className="bg-red-100 text-red-800 border-red-300">❌ Rejeitado</Badge>
                    </CardContent>
                  </Card>

                  {/* Cartão Pendente */}
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-yellow-900 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Pagamento Pendente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Número:</span>
                          <div className="flex items-center gap-2">
                            <code className="bg-white px-2 py-1 rounded text-sm">4000 0000 0000 0051</code>
                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard("4000000000000051")}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">CVV:</span>
                          <code className="bg-white px-2 py-1 rounded text-sm">123</code>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Validade:</span>
                          <code className="bg-white px-2 py-1 rounded text-sm">12/25</code>
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">⏳ Pendente</Badge>
                    </CardContent>
                  </Card>

                  {/* Cartão com Erro */}
                  <Card className="border-gray-200 bg-gray-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-gray-900 flex items-center gap-2">
                        <XCircle className="h-5 w-5" />
                        Erro no Pagamento
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Número:</span>
                          <div className="flex items-center gap-2">
                            <code className="bg-white px-2 py-1 rounded text-sm">4000 0000 0000 0069</code>
                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard("4000000000000069")}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">CVV:</span>
                          <code className="bg-white px-2 py-1 rounded text-sm">123</code>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Validade:</span>
                          <code className="bg-white px-2 py-1 rounded text-sm">12/25</code>
                        </div>
                      </div>
                      <Badge className="bg-gray-100 text-gray-800 border-gray-300">⚠️ Erro</Badge>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">📋 Instruções de Uso</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Use qualquer nome no titular do cartão</li>
                      <li>• Use qualquer CPF válido (ex: 11111111111)</li>
                      <li>• A data de validade deve ser futura</li>
                      <li>• O CVV pode ser qualquer número de 3 dígitos</li>
                      <li>• Clique no ícone de copiar para copiar o número do cartão</li>
                    </ul>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
