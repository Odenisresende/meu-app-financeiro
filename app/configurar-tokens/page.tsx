"use client"

import { useState } from "react"

export default function ConfigurarTokens() {
  const [environment, setEnvironment] = useState<"sandbox" | "production">("sandbox")

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">🔧 Configurar Tokens do Mercado Pago</h1>

        {/* Seletor de Ambiente */}
        <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
          <h2 className="text-xl font-bold mb-4">1️⃣ Escolha o Ambiente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setEnvironment("sandbox")}
              className={`p-6 rounded-lg border-2 transition-colors ${
                environment === "sandbox" ? "border-yellow-500 bg-yellow-50" : "border-gray-200 hover:border-yellow-300"
              }`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">🧪</div>
                <h3 className="font-bold text-yellow-800">SANDBOX (Teste)</h3>
                <p className="text-sm text-yellow-600 mt-2">Pagamentos simulados, sem cobrança real</p>
              </div>
            </button>

            <button
              onClick={() => setEnvironment("production")}
              className={`p-6 rounded-lg border-2 transition-colors ${
                environment === "production" ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-red-300"
              }`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">🚨</div>
                <h3 className="font-bold text-red-800">PRODUÇÃO (Real)</h3>
                <p className="text-sm text-red-600 mt-2">Pagamentos reais, cobra dinheiro!</p>
              </div>
            </button>
          </div>
        </div>

        {/* Instruções para Sandbox */}
        {environment === "sandbox" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-yellow-800 mb-4">🧪 Configuração SANDBOX</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-yellow-700 mb-2">📋 Passo a Passo:</h3>
                <ol className="text-yellow-700 space-y-2">
                  <li>
                    1. Acesse:{" "}
                    <a
                      href="https://www.mercadopago.com.br/developers/panel/app"
                      target="_blank"
                      className="underline"
                      rel="noreferrer"
                    >
                      Painel do Mercado Pago
                    </a>
                  </li>
                  <li>2. Vá em "Credenciais de teste"</li>
                  <li>3. Copie o "Access Token" (começa com TEST-)</li>
                  <li>4. Copie a "Public Key" (começa com TEST-)</li>
                  <li>5. Configure no Vercel (variáveis de ambiente)</li>
                </ol>
              </div>

              <div className="bg-yellow-100 border border-yellow-300 rounded p-4">
                <h4 className="font-bold text-yellow-800 mb-2">🔑 Variáveis no Vercel:</h4>
                <div className="font-mono text-sm space-y-1">
                  <p>
                    <strong>MERCADO_PAGO_ACCESS_TOKEN</strong> = TEST-1234...
                  </p>
                  <p>
                    <strong>MERCADO_PAGO_PUBLIC_KEY</strong> = TEST-abcd...
                  </p>
                </div>
              </div>

              <div className="bg-green-100 border border-green-300 rounded p-4">
                <h4 className="font-bold text-green-800 mb-2">💳 Cartões de Teste:</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Aprovado:</strong> 4509 9535 6623 3704
                  </p>
                  <p>
                    <strong>Rejeitado:</strong> 4000 0000 0000 0002
                  </p>
                  <p>
                    <strong>Vencimento:</strong> 11/25 | <strong>CVV:</strong> 123
                  </p>
                  <p>
                    <strong>Nome:</strong> APRO APRO
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instruções para Produção */}
        {environment === "production" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-red-800 mb-4">🚨 Configuração PRODUÇÃO</h2>

            <div className="bg-red-100 border border-red-300 rounded p-4 mb-6">
              <h3 className="font-bold text-red-800 mb-2">⚠️ ATENÇÃO:</h3>
              <ul className="text-red-700 text-sm space-y-1">
                <li>• Os pagamentos serão REAIS e cobrarão dinheiro</li>
                <li>• Use apenas quando estiver pronto para produção</li>
                <li>• Teste primeiro no ambiente SANDBOX</li>
                <li>• Você precisa ter uma conta verificada no Mercado Pago</li>
              </ul>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-red-700 mb-2">📋 Passo a Passo:</h3>
                <ol className="text-red-700 space-y-2">
                  <li>
                    1. Acesse:{" "}
                    <a
                      href="https://www.mercadopago.com.br/developers/panel/app"
                      target="_blank"
                      className="underline"
                      rel="noreferrer"
                    >
                      Painel do Mercado Pago
                    </a>
                  </li>
                  <li>2. Vá em "Credenciais de produção"</li>
                  <li>3. Copie o "Access Token" (NÃO começa com TEST-)</li>
                  <li>4. Copie a "Public Key" (NÃO começa com TEST-)</li>
                  <li>5. Configure no Vercel (variáveis de ambiente)</li>
                </ol>
              </div>

              <div className="bg-red-100 border border-red-300 rounded p-4">
                <h4 className="font-bold text-red-800 mb-2">🔑 Variáveis no Vercel:</h4>
                <div className="font-mono text-sm space-y-1">
                  <p>
                    <strong>MERCADO_PAGO_ACCESS_TOKEN</strong> = APP_USR-1234...
                  </p>
                  <p>
                    <strong>MERCADO_PAGO_PUBLIC_KEY</strong> = APP_USR-abcd...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Como Configurar no Vercel */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-800 mb-4">⚙️ Como Configurar no Vercel</h2>

          <ol className="text-blue-700 space-y-3">
            <li>
              <strong>1. Acesse o projeto no Vercel:</strong>
              <br />
              <a
                href="https://vercel.com/dashboard"
                target="_blank"
                className="underline text-blue-600"
                rel="noreferrer"
              >
                https://vercel.com/dashboard
              </a>
            </li>
            <li>
              <strong>2. Vá em Settings → Environment Variables</strong>
            </li>
            <li>
              <strong>3. Adicione/Edite as variáveis:</strong>
              <div className="bg-blue-100 border border-blue-300 rounded p-3 mt-2 font-mono text-sm">
                <p>MERCADO_PAGO_ACCESS_TOKEN</p>
                <p>MERCADO_PAGO_PUBLIC_KEY</p>
              </div>
            </li>
            <li>
              <strong>4. Salve e faça redeploy</strong>
            </li>
          </ol>
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="https://www.mercadopago.com.br/developers/panel/app"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            🔗 Abrir Painel MP
          </a>

          <a
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
          >
            ⚙️ Abrir Vercel
          </a>

          <a href="/verificar-ambiente" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
            🔍 Verificar Configuração
          </a>
        </div>
      </div>
    </div>
  )
}
