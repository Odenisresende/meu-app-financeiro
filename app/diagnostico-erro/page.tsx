"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, XCircle, Info, RefreshCw } from "lucide-react"

interface DiagnosticResult {
  category: string
  test: string
  status: "success" | "error" | "warning" | "info"
  message: string
  details?: string
}

export default function DiagnosticoErro() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostics = async () => {
    setIsRunning(true)
    setResults([])

    const diagnostics: DiagnosticResult[] = []

    // 1. Verificar dependências do package.json
    try {
      const response = await fetch("/api/diagnostico/dependencies")
      const data = await response.json()

      diagnostics.push({
        category: "Dependencies",
        test: "Package.json Analysis",
        status: data.success ? "success" : "error",
        message: data.message,
        details: data.details,
      })
    } catch (error) {
      diagnostics.push({
        category: "Dependencies",
        test: "Package.json Analysis",
        status: "error",
        message: "Erro ao analisar package.json",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }

    // 2. Verificar conflitos de versão
    try {
      const response = await fetch("/api/diagnostico/version-conflicts")
      const data = await response.json()

      diagnostics.push({
        category: "Version Conflicts",
        test: "Capacitor Version Check",
        status: data.hasConflicts ? "error" : "success",
        message: data.message,
        details: data.conflicts?.join(", "),
      })
    } catch (error) {
      diagnostics.push({
        category: "Version Conflicts",
        test: "Capacitor Version Check",
        status: "error",
        message: "Erro ao verificar conflitos",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }

    // 3. Verificar arquivos essenciais
    const essentialFiles = [
      "package.json",
      "next.config.mjs",
      "app/layout.tsx",
      "components/auth-wrapper.tsx",
      "lib/supabase-client.ts",
    ]

    for (const file of essentialFiles) {
      try {
        const response = await fetch(`/api/diagnostico/file-check?file=${encodeURIComponent(file)}`)
        const data = await response.json()

        diagnostics.push({
          category: "File Structure",
          test: `Check ${file}`,
          status: data.exists ? "success" : "error",
          message: data.message,
          details: data.details,
        })
      } catch (error) {
        diagnostics.push({
          category: "File Structure",
          test: `Check ${file}`,
          status: "error",
          message: `Erro ao verificar ${file}`,
          details: error instanceof Error ? error.message : "Erro desconhecido",
        })
      }
    }

    // 4. Verificar imports e exports
    try {
      const response = await fetch("/api/diagnostico/imports-exports")
      const data = await response.json()

      diagnostics.push({
        category: "Imports/Exports",
        test: "Missing Exports Check",
        status: data.hasMissingExports ? "error" : "success",
        message: data.message,
        details: data.missingExports?.join(", "),
      })
    } catch (error) {
      diagnostics.push({
        category: "Imports/Exports",
        test: "Missing Exports Check",
        status: "error",
        message: "Erro ao verificar imports/exports",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }

    // 5. Verificar configurações do Next.js
    try {
      const response = await fetch("/api/diagnostico/nextjs-config")
      const data = await response.json()

      diagnostics.push({
        category: "Next.js Config",
        test: "Configuration Check",
        status: data.isValid ? "success" : "warning",
        message: data.message,
        details: data.details,
      })
    } catch (error) {
      diagnostics.push({
        category: "Next.js Config",
        test: "Configuration Check",
        status: "error",
        message: "Erro ao verificar configuração Next.js",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }

    // 6. Verificar variáveis de ambiente
    try {
      const response = await fetch("/api/diagnostico/env-vars")
      const data = await response.json()

      diagnostics.push({
        category: "Environment",
        test: "Environment Variables",
        status: data.allPresent ? "success" : "warning",
        message: data.message,
        details: data.missing?.join(", "),
      })
    } catch (error) {
      diagnostics.push({
        category: "Environment",
        test: "Environment Variables",
        status: "warning",
        message: "Erro ao verificar variáveis de ambiente",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }

    setResults(diagnostics)
    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      success: "default",
      error: "destructive",
      warning: "secondary",
      info: "outline",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{status.toUpperCase()}</Badge>
  }

  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.category]) {
        acc[result.category] = []
      }
      acc[result.category].push(result)
      return acc
    },
    {} as Record<string, DiagnosticResult[]>,
  )

  const errorCount = results.filter((r) => r.status === "error").length
  const warningCount = results.filter((r) => r.status === "warning").length
  const successCount = results.filter((r) => r.status === "success").length

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              Diagnóstico de Erros - Financial Control App
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Button onClick={runDiagnostics} disabled={isRunning} className="flex items-center gap-2">
                {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {isRunning ? "Executando..." : "Executar Diagnóstico"}
              </Button>

              {results.length > 0 && (
                <div className="flex gap-2">
                  <Badge variant="destructive">{errorCount} Erros</Badge>
                  <Badge variant="secondary">{warningCount} Avisos</Badge>
                  <Badge variant="default">{successCount} OK</Badge>
                </div>
              )}
            </div>

            {isRunning && (
              <div className="text-sm text-gray-600">Analisando dependências, arquivos e configurações...</div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {Object.entries(groupedResults).map(([category, categoryResults]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryResults.map((result, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0 mt-0.5">{getStatusIcon(result.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{result.test}</span>
                        {getStatusBadge(result.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{result.message}</p>
                      {result.details && (
                        <details className="text-xs text-gray-500">
                          <summary className="cursor-pointer hover:text-gray-700">Ver detalhes</summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">{result.details}</pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Summary */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resumo e Próximos Passos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {errorCount > 0 && (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span>{errorCount} erro(s) crítico(s) encontrado(s) que impedem o deploy</span>
                  </div>
                )}
                {warningCount > 0 && (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{warningCount} aviso(s) que podem causar problemas</span>
                  </div>
                )}
                {successCount > 0 && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>{successCount} verificação(ões) passou(ram) com sucesso</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
