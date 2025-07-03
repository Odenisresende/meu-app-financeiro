"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, Loader2, Download } from "lucide-react"

export default function CorrigirNextJS() {
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runDiagnostic = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/fix-nextjs-issue")
      const data = await response.json()
      setDiagnostics(data)
    } catch (error) {
      console.error("Erro no diagnóstico:", error)
    }
    setIsLoading(false)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🔧 Corrigir Problema Next.js</h1>
        <p className="text-muted-foreground">Diagnóstico específico para resolver o problema "Problema com Next.js"</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Diagnóstico Next.js</CardTitle>
          <CardDescription>Verificar configuração e importação do Next.js</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runDiagnostic} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Diagnosticando...
              </>
            ) : (
              "Executar Diagnóstico Next.js"
            )}
          </Button>
        </CardContent>
      </Card>

      {diagnostics && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {diagnostics.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Status Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={diagnostics.success ? "default" : "destructive"}>
                {diagnostics.success ? "Next.js OK" : "Problemas Detectados"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Node.js:</strong> {diagnostics.diagnostics?.nodeVersion}
                </div>
                <div>
                  <strong>Ambiente:</strong> {diagnostics.diagnostics?.environment}
                </div>
                <div>
                  <strong>Plataforma:</strong> {diagnostics.diagnostics?.platform}
                </div>
                <div>
                  <strong>Arquitetura:</strong> {diagnostics.diagnostics?.architecture}
                </div>
              </div>
            </CardContent>
          </Card>

          {diagnostics.errors && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Erros Detectados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {diagnostics.errors.nextImport && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <strong>Erro de Importação Next.js:</strong>
                      <pre className="text-xs mt-1">{diagnostics.errors.nextImport}</pre>
                    </div>
                  )}
                  {diagnostics.errors.config && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <strong>Erro de Configuração:</strong>
                      <pre className="text-xs mt-1">{diagnostics.errors.config}</pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Recomendações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {diagnostics.recommendations?.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">🛠️ Solução Recomendada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-green-700">
                  <strong>1. Substituir next.config.mjs:</strong> Use a versão corrigida
                </p>
                <Button variant="outline" className="w-full bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Baixar next.config.mjs Corrigido
                </Button>

                <p className="text-sm text-green-700">
                  <strong>2. Limpar cache e reinstalar:</strong>
                </p>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono">
                  rm -rf node_modules package-lock.json
                  <br />
                  npm install
                  <br />
                  npm run build
                </div>

                <p className="text-sm text-green-700">
                  <strong>3. Fazer novo deploy no Vercel</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
