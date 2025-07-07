"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Database,
  CreditCard,
  Globe,
  Settings,
  Bug,
  Zap,
} from "lucide-react"

interface TestResult {
  name: string
  status: "success" | "error" | "warning" | "loading"
  message: string
  details?: any
  duration?: number
}

export default function DiagnosticoCompleto() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState("")

  const tests = [
    {
      name: "Variáveis de Ambiente",
      endpoint: "/api/debug-env",
      icon: Settings,
      description: "Verificar configuração das variáveis de ambiente",
    },
    {
      name: "Conexão Supabase",
      endpoint: "/api/test-supabase-connection",
      icon: Database,
      description: "Testar conexão com banco de dados",
    },
    {
      name: "Estrutura do Banco",
      endpoint: "/api/test-database-structure",
      icon: Database,
      description: "Verificar tabelas e estrutura do banco",
    },
    {
      name: "Conexão Mercado Pago",
      endpoint: "/api/test-mercadopago-connection",
      icon: CreditCard,
      description: "Testar API do Mercado Pago",
    },
    {
      name: "Webhook Mercado Pago",
      endpoint: "/api/test-webhook",
      icon: Globe,
      description: "Verificar configuração do webhook",
    },
    {
      name: "Sistema de Pagamentos",
      endpoint: "/api/test-payment-flow",
      icon: CreditCard,
      description: "Testar fluxo completo de pagamentos",
    },
    {
      name: "Dependências",
      endpoint: "/api/test-dependencies",
      icon: Bug,
      description: "Verificar dependências e imports",
    },
    {
      name: "Status do Sistema",
      endpoint: "/api/system-status",
      icon: Zap,
      description: "Status geral do sistema",
    },
  ]

  const runSingleTest = async (test: any) => {
    const startTime = Date.now()
    setCurrentTest(test.name)

    // Adicionar teste como "loading"
    setResults((prev) => [
      ...prev.filter((r) => r.name !== test.name),
      {
        name: test.name,
        status: "loading",
        message: "Executando teste...",
        duration: 0,
      },
    ])

    try {
      const response = await fetch(test.endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      const duration = Date.now() - startTime

      const result: TestResult = {
        name: test.name,
        status: response.ok && data.success ? "success" : "error",
        message: data.message || (response.ok ? "Teste passou com sucesso" : "Teste falhou"),
        details: data,
        duration,
      }

      setResults((prev) => [...prev.filter((r) => r.name !== test.name), result])
    } catch (error: any) {
      const duration = Date.now() - startTime

      setResults((prev) => [
        ...prev.filter((r) => r.name !== test.name),
        {
          name: test.name,
          status: "error",
          message: `Erro na requisição: ${error.message}`,
          details: { error: error.message },
          duration,
        },
      ])
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setResults([])
    setCurrentTest("")

    for (const test of tests) {
      await runSingleTest(test)
      // Pequena pausa entre testes
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setIsRunning(false)
    setCurrentTest("")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case "loading":
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Sucesso</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">Erro</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Aviso</Badge>
      case "loading":
        return <Badge className="bg-blue-100 text-blue-800">Executando</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pendente</Badge>
    }
  }

  const successCount = results.filter((r) => r.status === "success").length
  const errorCount = results.filter((r) => r.status === "error").length
  const warningCount = results.filter((r) => r.status === "warning").length

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader style={{ backgroundColor: "#152638" }}>
            <CardTitle className="text-white text-xl flex items-center gap-2">
              <Bug className="h-6 w-6" />
              Diagnóstico Completo do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-gray-600">Execute todos os testes para identificar problemas no sistema</p>
                {currentTest && <p className="text-sm text-blue-600 font-medium">Executando: {currentTest}</p>}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={runAllTests}
                  disabled={isRunning}
                  className="bg-[#DDC067] text-[#152638] hover:opacity-90"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Executando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Executar Todos os Testes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo dos Resultados */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{successCount}</div>
                <div className="text-sm text-green-800">Sucessos</div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                <div className="text-sm text-red-800">Erros</div>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
                <div className="text-sm text-yellow-800">Avisos</div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{results.length}</div>
                <div className="text-sm text-blue-800">Total</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de Testes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tests.map((test) => {
            const result = results.find((r) => r.name === test.name)
            const TestIcon = test.icon

            return (
              <Card key={test.name} className="shadow-lg border-0 bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TestIcon className="h-5 w-5 text-[#152638]" />
                      <CardTitle className="text-lg text-[#152638]">{test.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {result && getStatusIcon(result.status)}
                      {result && getStatusBadge(result.status)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{test.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {result && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Status:</span>
                          <span
                            className={
                              result.status === "success"
                                ? "text-green-600"
                                : result.status === "error"
                                  ? "text-red-600"
                                  : result.status === "warning"
                                    ? "text-yellow-600"
                                    : "text-blue-600"
                            }
                          >
                            {result.message}
                          </span>
                        </div>
                        {result.duration && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Duração:</span>
                            <span className="text-gray-600">{result.duration}ms</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => runSingleTest(test)}
                        disabled={isRunning}
                        size="sm"
                        variant="outline"
                        className="flex-1"
                      >
                        {result?.status === "loading" ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Executando
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Executar Teste
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Detalhes do resultado */}
                    {result?.details && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                          Ver Detalhes
                        </summary>
                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                          <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </div>
                      </details>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Instruções */}
        <Card className="shadow-lg border-0 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Como Interpretar os Resultados</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>
                  <strong>Sucesso:</strong> Teste passou sem problemas
                </span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span>
                  <strong>Erro:</strong> Problema crítico que precisa ser corrigido
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span>
                  <strong>Aviso:</strong> Problema menor ou configuração recomendada
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
