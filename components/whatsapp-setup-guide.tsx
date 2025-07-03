"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Copy, CheckCircle, AlertTriangle, Phone, Settings, Zap } from "lucide-react"

export default function WhatsAppSetupGuide() {
  const [copiedStep, setCopiedStep] = useState<string>("")

  const copyToClipboard = (text: string, step: string) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(step)
    setTimeout(() => setCopiedStep(""), 2000)
  }

  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://seu-app.vercel.app"}/api/whatsapp/webhook`

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader style={{ backgroundColor: "#152638" }}>
        <CardTitle className="flex items-center gap-2 text-white text-sm sm:text-xl">
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
          Configuração Completa WhatsApp
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="space-y-6">
          {/* Alerta importante */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 text-yellow-800 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-bold">IMPORTANTE!</span>
            </div>
            <p className="text-sm text-yellow-700">
              O número que você conectou é seu número PESSOAL. Para receber mensagens, você precisa criar um número
              COMERCIAL no Meta Business.
            </p>
          </div>

          {/* Passo 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-bold text-gray-800">Criar Meta Business Account</h3>
            </div>
            <div className="ml-8 space-y-2">
              <p className="text-sm text-gray-600">Crie uma conta comercial no Facebook Business</p>
              <Button
                onClick={() => window.open("https://business.facebook.com/", "_blank")}
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Meta Business
              </Button>
            </div>
          </div>

          {/* Passo 2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-bold text-gray-800">Criar App WhatsApp</h3>
            </div>
            <div className="ml-8 space-y-2">
              <p className="text-sm text-gray-600">No Meta for Developers, criar app Business + WhatsApp</p>
              <Button
                onClick={() => window.open("https://developers.facebook.com/", "_blank")}
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Meta for Developers
              </Button>
            </div>
          </div>

          {/* Passo 3 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-bold text-gray-800">Configurar Webhook</h3>
            </div>
            <div className="ml-8 space-y-3">
              <div className="bg-gray-50 p-3 rounded border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">URL do Webhook:</p>
                    <code className="text-sm font-mono">{webhookUrl}</code>
                  </div>
                  <Button onClick={() => copyToClipboard(webhookUrl, "webhook")} size="sm" variant="ghost">
                    {copiedStep === "webhook" ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Verify Token:</p>
                    <code className="text-sm font-mono">seu_token_secreto_123</code>
                  </div>
                  <Button onClick={() => copyToClipboard("seu_token_secreto_123", "token")} size="sm" variant="ghost">
                    {copiedStep === "token" ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Passo 4 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                4
              </div>
              <h3 className="font-bold text-gray-800">Configurar Variáveis de Ambiente</h3>
            </div>
            <div className="ml-8">
              <p className="text-sm text-gray-600 mb-2">Adicione no Vercel (Settings → Environment Variables):</p>
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                <div>WHATSAPP_ACCESS_TOKEN=EAAxxxxx</div>
                <div>WHATSAPP_PHONE_NUMBER_ID=123456789</div>
                <div>WHATSAPP_VERIFY_TOKEN=seu_token_secreto_123</div>
              </div>
            </div>
          </div>

          {/* Passo 5 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">
                5
              </div>
              <h3 className="font-bold text-gray-800">Testar Integração</h3>
            </div>
            <div className="ml-8">
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <div className="flex items-center gap-2 text-green-800 mb-2">
                  <Phone className="h-4 w-4" />
                  <span className="font-medium">Como testar:</span>
                </div>
                <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
                  <li>Pegue o número do bot que o Meta vai fornecer</li>
                  <li>Do SEU WhatsApp pessoal, envie: "Comprei lanche por 25 reais"</li>
                  <li>PARA o número do bot</li>
                  <li>Aguarde resposta automática</li>
                  <li>Verifique se apareceu no app</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Custos */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800 mb-2">
              <Zap className="h-5 w-5" />
              <span className="font-bold">Custos:</span>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • <strong>Gratuito:</strong> 1000 mensagens/mês
              </li>
              <li>
                • <strong>Número teste:</strong> Gratuito por 90 dias
              </li>
              <li>
                • <strong>Número oficial:</strong> ~R$ 50/mês
              </li>
            </ul>
          </div>

          {/* Botão de ajuda */}
          <div className="text-center">
            <Button
              onClick={() => window.open("https://developers.facebook.com/docs/whatsapp/getting-started", "_blank")}
              className="w-full"
              style={{ backgroundColor: "#25D366", color: "white" }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Documentação Oficial WhatsApp
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
