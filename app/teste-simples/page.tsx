"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, RefreshCw, Globe, Wifi, Server, Database } from "lucide-react"

export default function TesteSimples() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [info, setInfo] = useState<any>(null)
  const [dnsTest, setDnsTest] = useState<any>(null)

  useEffect(() => {
    // Teste básico ao carregar a página
    const testarCarregamento = async () => {
      try {
        // Teste 1: Verificar se conseguimos fazer fetch
        const response = await fetch("/api/test-routing")
        const data = await response.json()

        setInfo({
          page_loaded: true,
          api_accessible: response.ok,
          current_url: window.location.href,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          api_response: data,
        })

        setStatus("success")
      } catch (error) {
        setInfo({
          page_loaded: true,
          api_accessible: false,
          error: error instanceof Error ? error.message : "Erro desconhecido",
          current_url: window.location.href,
          timestamp: new Date().toISOString(),
        })
        setStatus("error")
      }
    }

    testarCarregamento()
  }, [])

  const testarDNS = async () => {
    try {
      const response = await fetch("/api/test-dns")
      const data = await response.json()
      setDnsTest(data)
    } catch (error) {
      setDnsTest({
        error: error instanceof Error ? error.message : "Erro no teste DNS",
      })
    }
  }

  const testarProducao = async () => {
    try {
      const response = await fetch("/api/test-production")
      const data = await response.json()

      setInfo((prev: any) => ({
        ...prev,
        production_test: data,
      }))
    } catch (error) {
      setInfo((prev: any) => ({
        ...prev,
        production_test: {
          error: error instanceof Error ? error.message : "Erro no teste",
        },
      }))
    }
  }

  const limparCache = () => {
    if (typeof window !== "undefined") {
      // Tentar limpar cache
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader style={{ backgroundColor: "#152638" }}>
            <CardTitle className="text-white text-xl flex items-center gap-2">
              <Globe className="h-6 w-6" />
              Diagnóstico DNS e Carregamento
            </CardTitle>
            <p className="text-white/80 text-sm">
              DNS configurado: 216.198.79.193 ✅ | Verificando propagação e carregamento
            </p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Status Principal */}
            <div className="flex items-center gap-2">
              {status === "loading" && <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />}
              {status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
              {status === "error" && <XCircle className="h-5 w-5 text-red-500" />}

              <span className="font-medium">Status do carregamento:</span>

              <Badge
                className={
                  status === "success"
                    ? "bg-green-100 text-green-800"
                    : status === "error"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                }
              >
                {status === "loading" ? "Carregando..." : status === "success" ? "Sucesso" : "Erro"}
              </Badge>
            </div>

            {/* Botões de Teste */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={testarDNS} className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                Testar DNS
              </Button>
              <Button
                onClick={testarProducao}
                className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
              >
                <Server className="h-4 w-4" />
                Testar Produção
              </Button>
              <Button
                onClick={limparCache}
                className="bg-orange-600 text-white hover:bg-orange-700 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Limpar Cache
              </Button>
            </div>

            {/* Informações Básicas */}
            {info && (
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Informações Básicas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Página carregou:</strong> {info.page_loaded ? "✅ Sim" : "❌ Não"}
                    </div>
                    <div>
                      <strong>API acessível:</strong> {info.api_accessible ? "✅ Sim" : "❌ Não"}
                    </div>
                    <div className="md:col-span-2">
                      <strong>URL atual:</strong> {info.current_url}
                    </div>
                    <div className="md:col-span-2">
                      <strong>Timestamp:</strong> {info.timestamp}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Teste DNS */}
            {dnsTest && (
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wifi className="h-5 w-5" />
                    Resultado do Teste DNS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-xs overflow-auto whitespace-pre-wrap max-h-96">
                      {JSON.stringify(dnsTest, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Teste de Produção */}
            {info?.production_test && (
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Teste de Produção
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-xs overflow-auto whitespace-pre-wrap max-h-96">
                      {JSON.stringify(info.production_test, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Próximos Passos */}
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">🎯 Próximos Passos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>✅ DNS está configurado corretamente (216.198.79.193)</div>
                  <div>✅ Domínios estão configurados no Vercel</div>
                  <div>🔍 Se esta página carregou, o problema pode ser cache</div>
                  <div>🔍 Teste em modo incógnito: Ctrl+Shift+N</div>
                  <div>🔍 Teste no celular (dados móveis)</div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
