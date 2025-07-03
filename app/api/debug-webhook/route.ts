import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function POST(request: Request) {
  try {
    console.log("🧪 Iniciando teste de debug do webhook...")

    // Simular dados reais do Mercado Pago
    const mockWebhookData = {
      id: Date.now(),
      live_mode: false,
      type: "payment",
      date_created: new Date().toISOString(),
      application_id: 123456789,
      user_id: 123456789,
      version: 1,
      api_version: "v1",
      action: "payment.updated",
      data: {
        id: "debug-payment-123",
      },
    }

    console.log("📋 Dados simulados:", JSON.stringify(mockWebhookData, null, 2))

    // Chamar nosso webhook real
    const webhookResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mockWebhookData),
    })

    const webhookResult = await webhookResponse.json()

    console.log("📊 Resposta do webhook:", webhookResult)

    // Aguardar um pouco para o processamento assíncrono
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Verificar se foi salvo no banco
    const { data: webhookLogs, error: logsError } = await supabase
      .from("webhook_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5)

    if (logsError) {
      console.error("❌ Erro ao buscar logs:", logsError)
    }

    return NextResponse.json({
      success: true,
      message: "Debug do webhook executado com sucesso!",
      results: {
        mockData: mockWebhookData,
        webhookResponse: webhookResult,
        recentLogs: webhookLogs || [],
        logsCount: webhookLogs?.length || 0,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("💥 Erro no debug:", error)
    return NextResponse.json({
      success: false,
      error: "Erro interno no debug",
      details: error.message,
      timestamp: new Date().toISOString(),
    })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Endpoint de debug para webhook do Mercado Pago",
    usage: "Faça POST para simular um webhook completo",
    description: "Testa o webhook real e verifica se salva logs no banco",
    timestamp: new Date().toISOString(),
  })
}
