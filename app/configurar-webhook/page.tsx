"use client"

import { useState } from "react"

export default function ConfigurarWebhook() {
  const [copied, setCopied] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const webhookUrl = "https://www.orcamentoseuplanejamento.com.br/api/webhooks/mercadopago"

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Erro ao copiar:", err)
    }
  }

  const testWebhook = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/webhooks/mercadopago")
      const data = await response.json()
      setTestResult({ success: true, data })
    } catch (error) {
      setTestResult({ success: false, error: "Erro ao testar webhook" })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">🔧 Configurar Webhook - Mercado Pago</h1>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-red-800 mb-4">🚨 AÇÃO NECESSÁRIA</h2>
          <p className="text-red-700 mb-4">
            O webhook ainda não está configurado no Mercado Pago. Sem isso, os pagamentos não ativarão o premium
            automaticamente.
          </p>
        </div>

        <div className="space-y-8">
          {/* Passo 1 */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-bold mb-4">1️⃣ Acesse o Painel do Mercado Pago</h3>
            <p className="text-gray-700 mb-4">Faça login na sua conta do Mercado Pago e acesse as configurações:</p>
            <a
              href="https://www.mercadopago.com.br/developers/panel/app"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block"
            >
              🔗 Abrir Painel do Mercado Pago
            </a>
          </div>

          {/* Passo 2 */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-bold mb-4">2️⃣ Configurar Webhook</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-700 mb-2">
                  <strong>URL do Webhook:</strong>
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={webhookUrl}
                    readOnly
                    className="flex-1 p-3 border rounded-lg bg-gray-50 font-mono text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700"
                  >
                    {copied ? "✅ Copiado!" : "📋 Copiar"}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-gray-700 mb-2">
                  <strong>Eventos para configurar:</strong>
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>payment (Pagamentos)</li>
                  <li>subscription_preapproval (Assinaturas)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Passo 3 */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-bold mb-4">3️⃣ Testar Webhook</h3>
            <p className="text-gray-700 mb-4">Após configurar, teste se o webhook está funcionando:</p>
            <button
              onClick={testWebhook}
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? "Testando..." : "🧪 Testar Webhook"}
            </button>

            {testResult && (
              <div
                className={`mt-4 p-4 rounded-lg ${testResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
              >
                <h4 className={`font-bold ${testResult.success ? "text-green-800" : "text-red-800"}`}>
                  {testResult.success ? "✅ Webhook Funcionando!" : "❌ Erro no Webhook"}
                </h4>
                <pre className="text-sm mt-2 bg-white p-2 rounded overflow-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Instruções Detalhadas */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-800 mb-4">📋 Instruções Detalhadas</h3>
            <ol className="text-sm text-blue-700 space-y-2">
              <li>
                <strong>1.</strong> Acesse{" "}
                <a
                  href="https://www.mercadopago.com.br/developers/panel/app"
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://www.mercadopago.com.br/developers/panel/app
                </a>
              </li>
              <li>
                <strong>2.</strong> Selecione sua aplicação
              </li>
              <li>
                <strong>3.</strong> Vá em "Webhooks" no menu lateral
              </li>
              <li>
                <strong>4.</strong> Clique em "Configurar webhooks"
              </li>
              <li>
                <strong>5.</strong> Cole a URL: <code className="bg-white px-1 rounded">{webhookUrl}</code>
              </li>
              <li>
                <strong>6.</strong> Selecione os eventos: "payment" e "subscription_preapproval"
              </li>
              <li>
                <strong>7.</strong> Salve as configurações
              </li>
              <li>
                <strong>8.</strong> Teste usando o botão acima
              </li>
            </ol>
          </div>

          {/* Voltar */}
          <div className="text-center">
            <a
              href="/test-payment-simple"
              className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 inline-block"
            >
              ← Voltar aos Testes
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
