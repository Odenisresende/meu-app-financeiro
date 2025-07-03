"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, ExternalLink, CheckCircle, XCircle } from "lucide-react"

export default function ConfigurarEnv() {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const envVars = [
    {
      key: "NEXT_PUBLIC_SUPABASE_URL",
      value: "https://nsvxswjgpqcxizbqdhoy.supabase.co",
      description: "URL do projeto Supabase",
    },
    {
      key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      value:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zdnhzd2pncHFjeGl6YnFkaG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDc1NzIsImV4cCI6MjA2NjcyMzU3Mn0.3H-xp0EOYtO5M4GiDWs_tenRtk3aLukpzfhyAwlu4nI",
      description: "Chave pública do Supabase",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-red-500" />
              Configuração de Variáveis de Ambiente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertDescription>
                <strong>Problema identificado:</strong> As variáveis do Supabase não estão configuradas no Vercel. Siga
                os passos abaixo para resolver.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">📋 Passo a Passo:</h3>

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
                    <p className="font-medium">Vá para o projeto "Seu Planejamento"</p>
                    <p className="text-sm text-gray-600">Clique no projeto na lista</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Acesse Settings → Environment Variables</p>
                    <p className="text-sm text-gray-600">
                      Na aba lateral, clique em Settings, depois Environment Variables
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Adicione as variáveis abaixo:</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">🔑 Variáveis para Adicionar:</h3>

              {envVars.map((env, index) => (
                <div key={env.key} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{env.key}</h4>
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
                Aguarde alguns minutos e teste novamente.
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button onClick={() => window.open("/diagnostico-simples", "_blank")} className="flex-1">
                🔍 Testar Após Configurar
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
      </div>
    </div>
  )
}
