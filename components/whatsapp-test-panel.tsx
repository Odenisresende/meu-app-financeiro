"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Send, CheckCircle, AlertCircle } from "lucide-react"

interface WhatsAppTestPanelProps {
  user: any
}

export default function WhatsAppTestPanel({ user }: WhatsAppTestPanelProps) {
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [lastTest, setLastTest] = useState<string>("")

  const runWebhookTest = async () => {
    setTestStatus("testing")

    try {
      // Testar se o webhook está configurado
      const response = await fetch("/api/test-env")
      const data = await response.json()

      if (data.whatsapp_configured) {
        setTestStatus("success")
        setLastTest("Webhook configurado corretamente!")
      } else {
        setTestStatus("error")
        setLastTest("Variáveis de ambiente não configuradas")
      }
    } catch (error) {
      setTestStatus("error")
      setLastTest("Erro ao testar webhook")
    }
  }

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader style={{ backgroundColor: "#152638" }}>
        <CardTitle className="flex items-center gap-2 text-white text-sm sm:text-xl">
          <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          Teste de Integração
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="space-y-4">
          {/* Status do teste */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-2">🧪 Teste de Funcionamento:</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Envie uma mensagem para seu WhatsApp</li>
              <li>Aguarde 5-10 segundos</li>
              <li>Recarregue a página</li>
              <li>Verifique se apareceu na lista</li>
            </ol>
          </div>

          {/* Botão de teste */}
          <Button
            onClick={runWebhookTest}
            disabled={testStatus === "testing"}
            className="w-full font-medium"
            style={{ backgroundColor: "#25D366", color: "white" }}
          >
            {testStatus === "testing" ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Testando Webhook...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Testar Configuração
              </>
            )}
          </Button>

          {/* Resultado do teste */}
          {testStatus !== "idle" && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                testStatus === "success"
                  ? "bg-green-50 text-green-800"
                  : testStatus === "error"
                    ? "bg-red-50 text-red-800"
                    : "bg-blue-50 text-blue-800"
              }`}
            >
              {testStatus === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <span className="text-sm">{lastTest}</span>
            </div>
          )}

          {/* Exemplos de mensagens */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-bold text-yellow-800 mb-2">💬 Mensagens de Teste:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• "Comprei pão por 8 reais"</li>
              <li>• "Almocei no restaurante 45"</li>
              <li>• "Recebi freelance 800 reais"</li>
              <li>• "Investi 200 na poupança"</li>
            </ul>
          </div>

          {/* Troubleshooting */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-2">🔧 Se não funcionar:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>1. Configure as variáveis de ambiente</li>
              <li>2. Configure o webhook no Meta</li>
              <li>3. Verifique os logs no Vercel</li>
              <li>4. Teste com ngrok localmente</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
