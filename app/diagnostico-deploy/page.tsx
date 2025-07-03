"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"

interface DiagnosticResult {
  name: string
  status: "success" | "error" | "warning" | "loading"
  message: string
  details?: string
}

export default function DiagnosticoDeploy() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const diagnostics = [
    {
      name: "Variáveis de Ambiente",
      test: async () => {
        const response = await fetch("/api/test-env-vars")
        const data = await response.json()
        return {
          status: data.allConfigured ? "success" : "error",
          message: data.allConfigured ? "Todas configuradas" : "Variáveis faltando",
          details: JSON.stringify(data.missing, null, 2),
        }
      },
    },
    {
      name: "Conexão Supabase",
      test: async () => {
        const response = await fetch("/api/test-supabase-connection")
        const data = await response.json()
        return {
          status: data.connected ? "success" : "error",
          message: data.connected ? "Conectado com sucesso" : "Falha na conexão",
          details: data.error || "Conexão OK",
        }
      },
    },
    {
      name: "Estrutura do Banco",
      test: async () => {
        const response = await fetch("/api/test-database-structure")
        const data = await response.json()
        return {
          status: data.valid ? "success" : "error",
          message: data.valid ? "Estrutura válida" : "Problemas na estrutura",
          details: data.issues?.join("\n") || "Estrutura OK",
        }
      },
    },
    {
      name: "APIs do Mercado Pago",
      test: async () => {
        const response = await fetch("/api/test-mercadopago-connection")
        const data = await response.json()
        return {
          status: data.connected ? "success" : "error",
          message: data.connected ? "APIs funcionando" : "Problema nas APIs",
          details: data.error || "APIs OK",
        }
      },
    },
    {
      name: "Webhook Endpoint",
      test: async () => {
        const response = await fetch("/api/webhooks/mercadopago")
        const data = await response.json()
        return {
          status: response.ok ? "success" : "error",
          message: response.ok ? "Webhook ativo" : "Webhook com problema",
          details: data.message || "Endpoint OK",
        }
      },
    },
    {
      name: "Build Dependencies",
      test: async () => {
        const response = await fetch("/api/test-dependencies")
        const data = await response.json()
        return {
          status: data.valid ? "success" : "warning",
          message: data.valid ? "Dependências OK" : "Possíveis problemas",
          details: data.warnings?.join("\n") || "Todas as dependências OK",
        }
      },
    },
  ]

  const runDiagnostics = async () => {
    setIsRunning(true)
    setResults([])

    for (const diagnostic of diagnostics) {
      setResults((prev) => [
        ...prev,
        {
          name: diagnostic.name,
          status: "loading",
          message: "Testando...",
        },
      ])

      try {
        const result = await diagnostic.test()
        setResults((prev) => prev.map((r) => (r.name === diagnostic.name ? { name: diagnostic.name, ...result } : r)))
      } catch (error) {
        setResults((prev) =>
          prev.map((r) =>
            r.name === diagnostic.name
              ? {
                  name: diagnostic.name,
                  status: "error" as const,
                  message: "Erro no teste",
                  details: error instanceof Error ? error.message : "Erro desconhecido",
                }
              : r,
          ),
        )
      }

      // Pequena pausa entre testes
      await new Promise((resolve) => setTimeout(resolve, 500))
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
    const variants = {
      success: "default",
      error: "destructive",
      warning: "secondary",
      loading: "outline",
    } as const

    return <Badge variant={variants[status]}>{status === "loading" ? "Testando" : status}</Badge>
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🔍 Diagnóstico de Deploy</h1>
        <p className="text-muted-foreground">Identifique problemas que podem estar causando falhas no deploy</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Executar Diagnóstico Completo</CardTitle>
          <CardDescription>Este teste verificará todos os componentes críticos do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runDiagnostics} disabled={isRunning} className="w-full">
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Executando Diagnóstico...
              </>
            ) : (
              "Iniciar Diagnóstico"
            )}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Resultados do Diagnóstico</h2>

          {results.map((result, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <h3 className="font-semibold">{result.name}</h3>
                  </div>
                  {getStatusBadge(result.status)}
                </div>

                <p className="text-sm text-muted-foreground mb-2">{result.message}</p>

                {result.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium">Ver detalhes</summary>
                    <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">{result.details}</pre>
                  </details>
                )}
              </CardContent>
            </Card>
          ))}

          {!isRunning && results.length === diagnostics.length && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-blue-800 mb-2">📋 Resumo do Diagnóstico</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {results.filter((r) => r.status === "success").length}
                    </div>
                    <div className="text-green-600">Sucessos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {results.filter((r) => r.status === "warning").length}
                    </div>
                    <div className="text-yellow-600">Avisos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {results.filter((r) => r.status === "error").length}
                    </div>
                    <div className="text-red-600">Erros</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>🛠️ Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Se houver erros:</strong> Corrija os problemas identificados antes de fazer novo deploy
            </p>
            <p>
              <strong>Se tudo estiver OK:</strong> O problema pode estar na configuração do Vercel
            </p>
            <p>
              <strong>Variáveis de ambiente:</strong> Verifique se estão configuradas no painel do Vercel
            </p>
            <p>
              <strong>Build errors:</strong> Verifique os logs de build no Vercel para erros específicos
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
