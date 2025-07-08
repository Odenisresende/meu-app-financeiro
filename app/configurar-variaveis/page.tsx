"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, ExternalLink, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export default function ConfigurarVariaveis() {
  const [copied, setCopied] = useState<string | null>(null)
  const [envStatus, setEnvStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const checkEnvironmentVariables = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-env-vars")
      const data = await response.json()
      setEnvStatus(data)
    } catch (error) {
      console.error("Erro ao verificar variáveis:", error)
    }
    setLoading(false)
  }

  useEffect(() => {
    checkEnvironmentVariables()
  }, [])

  const envVars = [
    {
      key: "NEXT_PUBLIC_SUPABASE_URL",
      value: "https://nsvxswjgpqcxizbqdhoy.supabase.co",
      description: "URL do projeto Supabase",
      required: true,
    },
    {
      key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      value:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zdnhzd2pncHFjeGl6YnFkaG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDc1NzIsImV4cCI6MjA2NjcyMzU3Mn0.3H-xp0EOYtO5M4GiDWs_tenRtk3aLukpzfhyAwlu4nI",
      description: "Chave pública do Supabase",
      required: true,
    },
    {
      key: "MERCADO_PAGO_ACCESS_TOKEN",
      value: "SEU_ACCESS_TOKEN_AQUI",
      description: "Token de acesso do Mercado Pago (obtenha em developers.mercadopago.com)",
      required: true,
    },
    {
      key: "MERCADO_PAGO_PUBLIC_KEY",
      value: "SEU_PUBLIC_KEY_AQUI",
      description: "Chave pública do Mercado Pago",
      required: true,
    },
    {
      key: "NEXT_PUBLIC_APP_URL",
      value: "https://seu-app.vercel.app",
      description: "URL do seu app no Vercel (substitua pelo seu domínio)",
      required: true,
    },
  ]

  const getStatusIcon = (varName: string) => {
    if (!envStatus) return <AlertTriangle className="h-4 w-4 text-yellow-500" />

    const isConfigured = envStatus.configured?.includes(varName)
    return isConfigured ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getStatusText = (varName: string) => {
    if (!envStatus) return "Verificando..."

    const isConfigured = envStatus.configured?.includes(varName)
    return isConfigured ? "✅ Configurada" : "❌ Não configurada"
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-blue-500" />
              Passo 2: Configurar Variáveis de Ambiente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertDescription>
                <strong>Status atual:</strong>{" "}
                {envStatus?.allConfigured ? "✅ Todas configuradas!" : "⚠️ Algumas variáveis precisam ser configuradas"}
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">📋 Passo a Passo:</h3>
                <Button onClick={checkEnvironmentVariables} disabled={loading} variant="outline">
                  {loading ? "Verificando..." : "🔄 Verificar Status"}
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Acesse o Vercel Dashboard</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-transparent"
                      onClick={() => window.open("https://vercel.com/dashboard", "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir Vercel
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Vá para Settings → Environment Variables</p>
                    <p className="text-sm text-gray-600">
                      Clique no seu projeto, depois Settings, depois Environment Variables
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Adicione as variáveis abaixo uma por uma</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">🔑 Variáveis para Adicionar:</h3>

              {envVars.map((env, index) => (
                <div key={env.key} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{env.key}</h4>
                      {getStatusIcon(env.key)}
                      <span className="text-xs text-gray-500">{getStatusText(env.key)}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(env.key, env.key)}>
                      <Copy className="h-4 w-4 mr-1" />
                      {copied === env.key ? "Copiado!" : "Copiar Nome"}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{env.description}</p>
                  <div className="bg-gray-100 p-2 rounded text-sm font-mono break-all">{env.value}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-transparent"
                    onClick={() => copyToClipboard(env.value, `${env.key}-value`)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    {copied === `${env.key}-value` ? "Copiado!" : "Copiar Valor"}
                  </Button>
                </div>
              ))}
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> Após adicionar as variáveis, o Vercel fará um novo deploy automaticamente.
                Aguarde alguns minutos e clique em "Verificar Status" acima.
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button
                onClick={() => (window.location.href = "/testar-autenticacao")}
                className="flex-1"
                disabled={!envStatus?.allConfigured}
              >
                ➡️ Próximo: Testar Autenticação
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open("https://vercel.com/dashboard", "_blank")}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ir para Vercel
              </Button>
            </div>
          </CardContent>
        </Card>

        {envStatus && (
          <Card>
            <CardHeader>
              <CardTitle>📊 Status Detalhado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-green-600 mb-2">
                    ✅ Configuradas ({envStatus.configured?.length || 0})
                  </h4>
                  <ul className="text-sm space-y-1">
                    {envStatus.configured?.map((variable: string) => (
                      <li key={variable} className="text-green-700">
                        • {variable}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-red-600 mb-2">❌ Faltando ({envStatus.missing?.length || 0})</h4>
                  <ul className="text-sm space-y-1">
                    {envStatus.missing?.map((variable: string) => (
                      <li key={variable} className="text-red-700">
                        • {variable}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
