"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

export default function DiagnosticoAvancado() {
  const [resultado, setResultado] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const executarDiagnostico = async () => {
    setLoading(true)
    const testes = []

    // Teste 1: Debug das variáveis de ambiente
    try {
      const debugEnv = await fetch("/api/debug-env")
      const debugData = await debugEnv.json()
      testes.push({
        nome: "Debug Variáveis de Ambiente",
        status: debugEnv.ok ? "OK" : "ERRO",
        detalhes: debugData,
      })
    } catch (error) {
      testes.push({
        nome: "Debug Variáveis de Ambiente",
        status: "ERRO",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }

    // Teste 2: Teste direto do Supabase
    try {
      const supabaseTest = await fetch("/api/test-supabase-direct")
      const supabaseData = await supabaseTest.json()
      testes.push({
        nome: "Teste Direto Supabase",
        status: supabaseTest.ok ? "OK" : "ERRO",
        detalhes: supabaseData,
      })
    } catch (error) {
      testes.push({
        nome: "Teste Direto Supabase",
        status: "ERRO",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }

    // Teste 3: Health check
    try {
      const health = await fetch("/api/health")
      const healthData = await health.json()
      testes.push({
        nome: "Health Check",
        status: health.ok ? "OK" : "ERRO",
        detalhes: healthData,
      })
    } catch (error) {
      testes.push({
        nome: "Health Check",
        status: "ERRO",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }

    setResultado({
      timestamp: new Date().toISOString(),
      url: window.location.href,
      testes,
    })
    setLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OK":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "ERRO":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-6 w-6" />
              Diagnóstico Avançado - Seu Planejamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Este diagnóstico vai investigar em detalhes como as variáveis de ambiente estão sendo lidas e por que o
                Supabase funciona mesmo sem as variáveis configuradas.
              </AlertDescription>
            </Alert>

            <Button onClick={executarDiagnostico} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Executando Diagnóstico...
                </>
              ) : (
                "🔍 Executar Diagnóstico Avançado"
              )}
            </Button>

            {resultado && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800">Informações da Sessão</h3>
                  <div className="text-sm text-blue-700 mt-2 space-y-1">
                    <p>
                      <strong>URL:</strong> {resultado.url}
                    </p>
                    <p>
                      <strong>Timestamp:</strong> {resultado.timestamp}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">📊 Resultados dos Testes</h3>
                  {resultado.testes.map((teste: any, index: number) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-base">
                          <span className="flex items-center gap-2">
                            {getStatusIcon(teste.status)}
                            {teste.nome}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              teste.status === "OK" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {teste.status}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <pre className="text-xs overflow-auto whitespace-pre-wrap">
                            {JSON.stringify(teste.detalhes, null, 2)}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Próximo passo:</strong> Com base nos resultados acima, vou identificar exatamente como
                    resolver o problema das variáveis de ambiente.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
