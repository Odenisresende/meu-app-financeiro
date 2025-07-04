import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("🔔 Webhook recebido:", JSON.stringify(body, null, 2))

    // Log do webhook
    await supabase.from("webhook_logs").insert({
      event_type: body.type || "unknown",
      data: body,
      processed: false,
      created_at: new Date().toISOString(),
    })

    // Processar diferentes tipos de eventos
    if (body.type === "payment") {
      await processPaymentEvent(body)
    } else if (body.type === "subscription_preapproval") {
      await processSubscriptionEvent(body)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("❌ Erro no webhook:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function processPaymentEvent(body: any) {
  try {
    const paymentId = body.data?.id
    if (!paymentId) return

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const payment = await response.json()
    console.log("💳 Pagamento processado:", payment.status)

    if (payment.status === "approved") {
      const userId = payment.external_reference
      if (userId) {
        await activateUserSubscription(userId, payment)
      }
    }
  } catch (error) {
    console.error("Erro ao processar pagamento:", error)
  }
}

async function processSubscriptionEvent(body: any) {
  try {
    const subscriptionId = body.data?.id
    if (!subscriptionId) return

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    const response = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const subscription = await response.json()
    console.log("🔄 Assinatura processada:", subscription.status)

    if (subscription.status === "authorized") {
      const userId = subscription.external_reference
      if (userId) {
        await activateUserSubscription(userId, subscription)
      }
    } else if (subscription.status === "cancelled") {
      const userId = subscription.external_reference
      if (userId) {
        await deactivateUserSubscription(userId)
      }
    }
  } catch (error) {
    console.error("Erro ao processar assinatura:", error)
  }
}

async function activateUserSubscription(userId: string, paymentData: any) {
  try {
    const { error } = await supabase.from("user_subscriptions").upsert({
      user_id: userId,
      subscription_id: paymentData.id,
      status: "active",
      is_active: true,
      plan_type: "premium",
      amount: 17.0,
      currency: "BRL",
      billing_cycle: "monthly",
      subscription_start_date: new Date().toISOString(),
      subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 dias
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Erro ao ativar assinatura:", error)
    } else {
      console.log("✅ Assinatura ativada para usuário:", userId)
    }
  } catch (error) {
    console.error("Erro ao ativar assinatura:", error)
  }
}

async function deactivateUserSubscription(userId: string) {
  try {
    const { error } = await supabase
      .from("user_subscriptions")
      .update({
        status: "cancelled",
        is_active: false,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (error) {
      console.error("Erro ao cancelar assinatura:", error)
    } else {
      console.log("❌ Assinatura cancelada para usuário:", userId)
    }
  } catch (error) {
    console.error("Erro ao cancelar assinatura:", error)
  }
}
