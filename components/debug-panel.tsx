"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"

export default function DebugPanel() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)

  const runDiagnostics = async () => {
    setIsLoading(true)
    const results: any = {}

    try {
      // 1. Verificar variáveis de ambiente (client-side)
      console.log("🔍 Verificando variáveis de ambiente...")
      results.env = {
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "❌ Não encontrada",
        // Supabase vars são hardcoded no lib/supabase.ts, então sempre existem
        supabaseUrl: "✅ Configurada (hardcoded)",
        supabaseKey: "✅ Configurada (hardcoded)",
      }

      // 2. Testar conexão com Supabase
      console.log("🔍 Testando Supabase...")
      try {
        const { data, error } = await supabase.from("profiles").select("count").limit(1)
        results.supabase = {
          status: error ? "❌ Erro" : "✅ Conectado",
          error: error?.message || null,
        }
      } catch (err: any) {
        results.supabase = {
          status: "❌ Erro de conexão",
          error: err.message,
        }
      }

      // 3. Verificar tabelas essenciais
      console.log("🔍 Verificando tabelas...")
      try {
        // Testar tabelas uma por uma
        const tables = ["profiles", "transactions", "user_subscriptions"]
        const tableResults = []

        for (const table of tables) {
          try {
            const { data, error } = await supabase.from(table).select("*").limit(1)
            tableResults.push({
              name: table,
              status: error ? "❌" : "✅",
              error: error?.message,
            })
          } catch (err: any) {
            tableResults.push({
              name: table,
              status: "❌",
              error: err.message,
            })
          }
        }

        results.tables = {
          status: tableResults.every((t) => t.status === "✅") ? "✅ Todas OK" : "⚠️ Algumas com problema",
          details: tableResults,
        }
      } catch (err: any) {
        results.tables = {
          status: "❌ Erro geral",
          error: err.message,
        }
      }

      // 4. Testar API de pagamento
      console.log("🔍 Testando API de pagamento...")
      try {
        const response = await fetch("/api/test-env")
        const data = await response.json()
        results.payment = {
          status: response.ok ? "✅ API OK" : "❌ Erro na API",
          data: data,
        }
      } catch (err: any) {
        results.payment = {
          status: "❌ Erro de conexão",
          error: err.message,
        }
      }

      // 5. Verificar webhook
      console.log("🔍 Testando webhook...")
      try {
        const response = await fetch("/api/webhooks/mercadopago", { method: "GET" })
        const data = await response.json()
        results.webhook = {
          status: response.ok ? "✅ Webhook OK" : "❌ Webhook com erro",
          data: data,
        }
      } catch (err: any) {
        results.webhook = {
          status: "❌ Webhook inacessível",
          error: err.message,
        }
      }

      // 6. Verificar usuário atual
      console.log("🔍 Verificando usuário...")
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()
        results.user = {
          status: user ? "✅ Logado" : "❌ Não logado",
          email: user?.email || "N/A",
          id: user?.id || "N/A",
          error: error?.message || null,
        }
      } catch (err: any) {
        results.user = {
          status: "❌ Erro de autenticação",
          error: err.message,
        }
      }

      // 7. Testar criação de assinatura
      console.log("🔍 Testando criação de assinatura...")
      try {
        const response = await fetch("/api/create-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ test: true }),
        })
        const data = await response.json()
        results.subscription = {
          status: response.ok ? "✅ API de assinatura OK" : "❌ Erro na API",
          data: data,
        }
      } catch (err: any) {
        results.subscription = {
          status: "❌ API inacessível",
          error: err.message,
        }
      }

      setDebugInfo(results)
    } catch (error: any) {
      console.error("Erro no diagnóstico:", error)
      results.general = {
        status: "❌ Erro geral",
        error: error.message,
      }
      setDebugInfo(results)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const getStatusColor = (status: string) => {
    if (status.includes("✅")) return "bg-green-100 text-green-800"
    if (status.includes("❌")) return "bg-red-100 text-red-800"
    if (status.includes("⚠️")) return "bg-yellow-100 text-yellow-800"
    return "bg-gray-100 text-gray-800"
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔧 Debug Panel - Diagnóstico Completo
            <Button onClick={runDiagnostics} disabled={isLoading} size="sm">
              {isLoading ? "Analisando..." : "Executar Novamente"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Variáveis de Ambiente */}
          <div>
            <h3 className="font-semibold mb-2">🌍 Variáveis de Ambiente</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>NEXT_PUBLIC_APP_URL:</span>
                <Badge variant="outline">{debugInfo.env?.NEXT_PUBLIC_APP_URL}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Supabase URL:</span>
                <Badge className="bg-green-100 text-green-800">{debugInfo.env?.supabaseUrl || "✅ OK"}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Supabase Key:</span>
                <Badge className="bg-green-100 text-green-800">{debugInfo.env?.supabaseKey || "✅ OK"}</Badge>
              </div>
            </div>
          </div>

          {/* Supabase */}
          <div>
            <h3 className="font-semibold mb-2">🗄️ Banco de Dados (Supabase)</h3>
            <Badge className={getStatusColor(debugInfo.supabase?.status || "")}>
              {debugInfo.supabase?.status || "Verificando..."}
            </Badge>
            {debugInfo.supabase?.error && <p className="text-sm text-red-600 mt-1">{debugInfo.supabase.error}</p>}
          </div>

          {/* Tabelas */}
          <div>
            <h3 className="font-semibold mb-2">📋 Estrutura das Tabelas</h3>
            <Badge className={getStatusColor(debugInfo.tables?.status || "")}>
              {debugInfo.tables?.status || "Verificando..."}
            </Badge>
            {debugInfo.tables?.details && (
              <div className="mt-2 space-y-1">
                {debugInfo.tables.details.map((table: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{table.name}:</span>
                    <Badge className={getStatusColor(table.status)}>
                      {table.status} {table.status === "❌" && table.error}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* API de Pagamento */}
          <div>
            <h3 className="font-semibold mb-2">💳 API de Pagamento</h3>
            <Badge className={getStatusColor(debugInfo.payment?.status || "")}>
              {debugInfo.payment?.status || "Verificando..."}
            </Badge>
            {debugInfo.payment?.data && (
              <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto max-h-32">
                {JSON.stringify(debugInfo.payment.data, null, 2)}
              </pre>
            )}
          </div>

          {/* API de Assinatura */}
          <div>
            <h3 className="font-semibold mb-2">📝 API de Assinatura</h3>
            <Badge className={getStatusColor(debugInfo.subscription?.status || "")}>
              {debugInfo.subscription?.status || "Verificando..."}
            </Badge>
            {debugInfo.subscription?.error && (
              <p className="text-sm text-red-600 mt-1">{debugInfo.subscription.error}</p>
            )}
          </div>

          {/* Webhook */}
          <div>
            <h3 className="font-semibold mb-2">🔔 Webhook</h3>
            <Badge className={getStatusColor(debugInfo.webhook?.status || "")}>
              {debugInfo.webhook?.status || "Verificando..."}
            </Badge>
          </div>

          {/* Usuário */}
          <div>
            <h3 className="font-semibold mb-2">👤 Usuário Atual</h3>
            <Badge className={getStatusColor(debugInfo.user?.status || "")}>
              {debugInfo.user?.status || "Verificando..."}
            </Badge>
            {debugInfo.user?.email && (
              <div className="text-sm mt-1">
                <p>Email: {debugInfo.user.email}</p>
                <p>ID: {debugInfo.user.id?.substring(0, 8)}...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
