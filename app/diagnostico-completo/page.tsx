"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Globe,
  Database,
  CreditCard,
  Rocket,
  Heart,
} from "lucide-react"

interface TestResult {
  status: "success" | "error" | "warning"
  message: string
  data?: any
}

export default function DiagnosticoCompleto() {
  const [results, setResults] = useState<{ [key: string]: TestResult }>({})
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({})
  const [allTests, setAllTests] = useState(false)

  const tests = [
    {
      key: "debug-env",
      name: "🔍 Debug Variáveis de Ambiente",
      description: "Verificar todas as variáveis de ambiente",
      icon: Database,
      critical: true,
    },
    {
      key: "test-supabase-direct",
      name: "🗄️ Teste Direto Supabase",
      description: "Conexão direta com banco de dados",
      icon: Database,
      critical: true,
    },
    {
      key: "test-mp-connection",
      name: "💳 Mercado Pago Connection",
      description: "Verificar integração de pagamentos",
      icon: CreditCard,
      critical: false,
    },
    {
      key: "force-redeploy",
      name: "🚀 Informações do Deploy",
      description: "Status do deployment atual",
      icon: Rocket,
      critical: false,
    },
    {
      key: "health",
      name: "❤️ Health Check",
      description: "Status geral da aplicação",
      icon: Heart,
      critical: false,
    },
  ]

  const runTest = async (testKey: string) => {
    setLoading((prev) => ({ ...prev, [testKey]: true }))

    try {
      const response = await fetch(`/api/${testKey}`)
      const data = await response.json()

      setResults((prev) => ({
        ...prev,
        [testKey]: {
          status: response.ok ? "success" : "error",
          message: data.message || "Teste executado",
          data,
        },
      }))
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [testKey]: {
          status: "error",
          message: "Erro na execução do teste",
          data: { error: error instanceof Error ? error.message : "Erro desconhecido" },
        },
      }))
    } finally {
      setLoading((prev) => ({ ...prev, [testKey]: false }))
    }
  }

  const runAllTests = async () => {
    setAllTests(true)
    for (const test of tests) {
      await runTest(test.key)
      // Pequeno delay entre testes
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
    setAllTests(false)
  }

  const getStatusIcon = (status: string, critical: boolean) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return critical ? (
          <XCircle className="h-5 w-5 text-red-600" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-orange-600" />
        )
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string, critical: boolean) => {
    if (status === "success") {
      return <Badge className="bg-green-100 text-green-800 border-green-200">OK</Badge>
    }
    if (status === "error") {
      return critical ? (
        <Badge className="bg-red-100 text-red-800 border-red-200">CRÍTICO</Badge>
      ) : (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200">ERRO</Badge>
      )
    }
    if (status === "warning") {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">AVISO</Badge>
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader style={{ backgroundColor: "#152638" }}>
            <CardTitle className="text-white text-xl flex items-center gap-2">
              <Globe className="h-6 w-6" />
              Diagnóstico Completo do Sistema
            </CardTitle>
            <p className="text-white/80 text-sm">Verificação completa de todas as integrações e configurações</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Button
                onClick={runAllTests}
                disabled={allTests}
                className="bg-[#DDC067] text-[#152638] hover:opacity-90"
              >
                {allTests ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Executando Testes...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Executar Todos os Testes
                  </>
                )}
              </Button>

              <div className="text-sm text-gray-600 flex items-center">
                Testes executados: {Object.keys(results).length}/{tests.length}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tests */}
        <div className="space-y-4">
          {tests.map((test) => {
            const result = results[test.key]
            const isLoading = loading[test.key]
            const Icon = test.icon

            return (
              <Card key={test.key} className="shadow-lg border-0 bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-[#152638]" />
                      <div>
                        <CardTitle className="text-lg text-[#152638] flex items-center gap-2">
                          {test.name}
                          {result && getStatusBadge(result.status, test.critical)}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {result && getStatusIcon(result.status, test.critical)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runTest(test.key)}
                        disabled={isLoading}
                        className="border-[#DDC067] text-[#DDC067] hover:bg-[#DDC067] hover:text-[#152638]"
                      >
                        {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Testar"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {result && (
                  <CardContent className="pt-0">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>

        {/* Summary */}
        {Object.keys(results).length > 0 && (
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader style={{ backgroundColor: "#152638" }}>
              <CardTitle className="text-white">📊 Resumo dos Testes</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(results).filter((r) => r.status === "success").length}
                  </div>
                  <div className="text-sm text-gray-600">Sucessos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {Object.values(results).filter((r) => r.status === "error").length}
                  </div>
                  <div className="text-sm text-gray-600">Erros</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {Object.values(results).filter((r) => r.status === "warning").length}
                  </div>
                  <div className="text-sm text-gray-600">Avisos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
