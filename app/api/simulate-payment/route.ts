import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function POST(request: Request) {
  try {
    const { userId, paymentId, amount } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID é obrigatório" }, { status: 400 })
    }

    console.log("🧪 Simulando pagamento para usuário:", userId)

    // Simular dados do pagamento aprovado
    const simulatedPayment = {
      id: paymentId || `sim_${Date.now()}`,
      status: "approved",
      external_reference: userId,
      transaction_amount: amount || 17.0,
      currency_id: "BRL",
      payment_method_id: "pix",
      date_created: new Date().toISOString(),
      date_approved: new Date().toISOString(),
    }

    // Log da simulação
    await supabase.from("webhook_logs").insert({
      event_type: "payment_simulation",
      data: simulatedPayment,
      processed: false,
      created_at: new Date().toISOString(),
    })

    // Ativar premium para o usuário
    const { error: subscriptionError } = await supabase.from("user_subscriptions").upsert({
      user_id: userId,
      subscription_id: simulatedPayment.id,
      status: "active",
      is_active: true,
      plan_type: "premium",
      amount: simulatedPayment.transaction_amount,
      currency: "BRL",
      billing_cycle: "monthly",
      subscription_start_date: new Date().toISOString(),
      subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (subscriptionError) {
      console.error("❌ Erro ao ativar premium:", subscriptionError)
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao ativar premium",
          details: subscriptionError,
        },
        { status: 500 },
      )
    }

    console.log("✅ Premium ativado com sucesso para:", userId)

    return NextResponse.json({
      success: true,
      message: "Pagamento simulado e premium ativado!",
      payment: simulatedPayment,
      user_id: userId,
    })
  } catch (error: any) {
    console.error("💥 Erro na simulação:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
