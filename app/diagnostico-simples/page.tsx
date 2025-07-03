"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DiagnosticoSimples() {
  const [resultado, setResultado] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testarTudo = async () => {
    setLoading(true)
    const testes = []

    // Teste 1: Health Check
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

    // Teste 2: Variáveis de ambiente
    try {
      const env = await fetch("/api/test-env")
      const envData = await env.json()
      testes.push({
        nome: "Variáveis de Ambiente",
        status: env.ok ? "OK" : "ERRO",
        detalhes: envData,
      })
    } catch (error) {
      testes.push({
        nome: "Variáveis de Ambiente",
        status: "ERRO",
        detalhes: "API não encontrada",
      })
    }

    // Teste 3: Supabase
    try {
      const { supabase } = await import("@/lib/supabase")
      const { data, error } = await supabase.from("profiles").select("count").limit(1)

      testes.push({
        nome: "Conexão Supabase",
        status: error ? "ERRO" : "OK",
        detalhes: error ? error.message : "Conectado com sucesso",
      })
    } catch (error) {
      testes.push({
        nome: "Conexão Supabase",
        status: "ERRO",
        detalhes: error instanceof Error ? error.message : "Erro de conexão",
      })
    }

    // Teste 4: Mercado Pago
    try {
      const mpTest = await fetch("/api/test-mp-connection")
      const mpData = await mpTest.json()
      testes.push({
        nome: "Mercado Pago",
        status: mpTest.ok ? "OK" : "ERRO",
        detalhes: mpData,
      })
    } catch (error) {
      testes.push({
        nome: "Mercado Pago",
        status: "ERRO",
        detalhes: "API não encontrada",
      })
    }

    setResultado({
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      testes,
    })
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Diagnóstico Rápido - Seu Planejamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testarTudo} disabled={loading} className="w-full">
              {loading ? "Testando..." : "Executar Diagnóstico Completo"}
            </Button>

            {resultado && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded">
                  <h3 className="font-semibold">Informações do Sistema</h3>
                  <p>
                    <strong>URL:</strong> {resultado.url}
                  </p>
                  <p>
                    <strong>Timestamp:</strong> {resultado.timestamp}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Resultados dos Testes</h3>
                  {resultado.testes.map((teste: any, index: number) => (
                    <div
                      key={index}
                      className={`p-3 rounded border ${
                        teste.status === "OK" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{teste.nome}</span>
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            teste.status === "OK" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {teste.status}
                        </span>
                      </div>
                      <pre className="mt-2 text-sm bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(teste.detalhes, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>

                <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                  <h3 className="font-semibold text-yellow-800">Próximos Passos</h3>
                  <div className="text-sm text-yellow-700 mt-2">
                    <p>1. Se Supabase está com erro: Configure as variáveis no Vercel</p>
                    <p>2. Se Mercado Pago está com erro: Configure os tokens MP</p>
                    <p>3. Se tudo estiver OK: O app deve funcionar normalmente</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
