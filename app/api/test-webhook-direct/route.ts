import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST() {
  try {
    console.log("🧪 Testando webhook diretamente...")

    // Simular dados de webhook do Mercado Pago
    const mockWebhookData = {
      type: "payment",
      data: {
        id: "123456789",
      },
    }

    // Simular dados de pagamento aprovado
    const mockPaymentData = {
      id: "123456789",
      status: "approved",
      external_reference: "test-user-123",
    }

    console.log("💳 Simulando pagamento aprovado...")

    // Ativar premium diretamente
    const { error } = await supabase
      .from("user_subscriptions")
      .update({
        status: "active",
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", "test-user-123")

    if (error) {
      console.error("❌ Erro ao ativar premium:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao ativar premium",
          details: error,
        },
        { status: 500 },
      )
    }

    console.log("✅ Premium ativado com sucesso!")

    return NextResponse.json({
      success: true,
      message: "Webhook simulado com sucesso!",
      mockData: {
        webhook: mockWebhookData,
        payment: mockPaymentData,
      },
    })
  } catch (error: any) {
    console.error("💥 Erro no teste:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Endpoint para testar webhook diretamente",
    usage: "POST para simular ativação",
  })
}
