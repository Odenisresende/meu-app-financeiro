"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"

interface DiagnosticResult {
  name: string
  status: "success" | "error" | "warning" | "loading"
  message: string
  details?: string
}

export default function DiagnosticoPagamento() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostic = async () => {
    setIsRunning(true)
    setResults([])

    const tests = [
      { name: "Variáveis de Ambiente", endpoint: "/api/test-env" },
      { name: "Conexão Mercado Pago", endpoint: "/api/test-mp-connection" },
      { name: "Estrutura do Banco", endpoint: "/api/test-database" },
      { name: "API de Pagamento", endpoint: "/api/test-payment" },
      { name: "Webhook", endpoint: "/api/test-webhook" },
    ]

    for (const test of tests) {
      setResults((prev) => [
        ...prev,
        {
          name: test.name,
          status: "loading",
          message: "Testando...",
        },
      ])

      try {
        const response = await fetch(test.endpoint)
        const data = await response.json()

        setResults((prev) =>
          prev.map((result) =>
            result.name === test.name
              ? {
                  name: test.name,
                  status: response.ok ? "success" : "error",
                  message: data.message || "Teste concluído",
                  details: data.details,
                }
              : result,
          ),
        )
      } catch (error) {
        setResults((prev) =>
          prev.map((result) =>
            result.name === test.name
              ? {
                  name: test.name,
                  status: "error",
                  message: "Erro na conexão",
                  details: error instanceof Error ? error.message : "Erro desconhecido",
                }
              : result,
          ),
        )
      }

      // Delay entre testes
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "loading":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
    }
  }

  const getStatusBadge = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            OK
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">ERRO</Badge>
      case "warning":
        return (
          <Badge variant="secondary" className="bg-yellow-500">
            AVISO
          </Badge>
        )
      case "loading":
        return <Badge variant="outline">TESTANDO</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Diagnóstico de Pagamento</h1>
        <p className="text-gray-600">Verificação completa do sistema de pagamentos Mercado Pago</p>
      </div>

      <div className="grid gap-6">
        {/* Botão de Diagnóstico */}
        <Card>
          <CardHeader>
            <CardTitle>Executar Diagnóstico</CardTitle>
            <CardDescription>Testa todas as integrações e configurações do sistema de pagamento</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runDiagnostic} disabled={isRunning} className="w-full">
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Executando Diagnóstico...
                </>
              ) : (
                "Executar Diagnóstico Completo"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resultados */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados do Diagnóstico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{result.name}</h3>
                        {getStatusBadge(result.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                      {result.details && (
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">{result.details}</pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Checklist Manual */}
        <Card>
          <CardHeader>
            <CardTitle>Checklist Manual</CardTitle>
            <CardDescription>Itens importantes para verificar manualmente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="tokens" className="rounded" />
                <label htmlFor="tokens" className="text-sm">
                  Tokens do Mercado Pago estão corretos (Access Token e Public Key)
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="https" className="rounded" />
                <label htmlFor="https" className="text-sm">
                  Site está rodando em HTTPS (obrigatório para MP)
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="webhook-url" className="rounded" />
                <label htmlFor="webhook-url" className="text-sm">
                  URL do webhook configurada no painel do Mercado Pago
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="domain" className="rounded" />
                <label htmlFor="domain" className="text-sm">
                  Domínio autorizado no painel do Mercado Pago
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="env-vars" className="rounded" />
                <label htmlFor="env-vars" className="text-sm">
                  Variáveis de ambiente configuradas no Vercel
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="database" className="rounded" />
                <label htmlFor="database" className="text-sm">
                  Tabela de subscriptions existe e está acessível
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Possíveis Problemas */}
        <Card>
          <CardHeader>
            <CardTitle>Possíveis Problemas Comuns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-medium text-red-700">Tokens Incorretos</h4>
                <p className="text-sm text-gray-600">
                  Verifique se está usando tokens de produção (não sandbox) e se estão corretos
                </p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-medium text-yellow-700">Webhook Inacessível</h4>
                <p className="text-sm text-gray-600">URL do webhook deve ser HTTPS e acessível publicamente</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium text-blue-700">Domínio Não Autorizado</h4>
                <p className="text-sm text-gray-600">Adicione seu domínio nas configurações do Mercado Pago</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium text-purple-700">Variáveis de Ambiente</h4>
                <p className="text-sm text-gray-600">
                  Certifique-se que todas as env vars estão configuradas no Vercel
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
