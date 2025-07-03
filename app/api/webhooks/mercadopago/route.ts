import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    console.log("🔔 Webhook do Mercado Pago recebido!")

    const body = await request.json()
    console.log("📋 Dados recebidos:", JSON.stringify(body, null, 2))

    await logWebhook(body, request)

    const response = NextResponse.json({ status: "success" }, { status: 200 })

    processWebhook(body).catch((error) => {
      console.error("💥 Erro no processamento assíncrono:", error)
    })

    return response
  } catch (error) {
    console.error("💥 Erro geral no webhook:", error)
    return NextResponse.json({ status: "success" }, { status: 200 })
  }
}

async function logWebhook(body: any, request: NextRequest) {
  try {
    const { error } = await supabase.from("webhook_logs").insert({
      webhook_type: "mercadopago",
      event_type: body.type || "unknown",
      data: body,
      received_at: new Date().toISOString(),
      ip_address: request.ip || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown",
    })

    if (error) {
      console.error("⚠️ Erro ao registrar webhook:", error)
    } else {
      console.log("✅ Webhook registrado no banco")
    }
  } catch (error) {
    console.error("💥 Erro ao registrar webhook:", error)
  }
}

async function processWebhook(body: any) {
  console.log("🔄 Processando webhook...")

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
  if (!accessToken) {
    console.log("⚠️ Access token do Mercado Pago não configurado")
    return
  }

  try {
    if (body.type === "payment") {
      await handlePaymentWebhook(body, accessToken)
    } else {
      console.log("⚠️ Tipo de webhook não reconhecido:", body.type)
    }

    console.log("✅ Processamento do webhook concluído")
  } catch (error) {
    console.error("💥 Erro no processamento do webhook:", error)
  }
}

async function handlePaymentWebhook(body: any, accessToken: string) {
  const paymentId = body.data?.id
  if (!paymentId) {
    console.log("❌ ID do pagamento não encontrado")
    return
  }

  console.log("💳 Processando pagamento:", paymentId)

  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.log("⚠️ Erro ao buscar pagamento:", response.status)
      return
    }

    const paymentData = await response.json()
    console.log("💰 Dados do pagamento:", paymentData)

    if (paymentData.status === "approved") {
      console.log("✅ Pagamento aprovado!")
      await handlePaymentApproval(paymentData)
    } else if (paymentData.status === "rejected") {
      console.log("❌ Pagamento rejeitado")
    }
  } catch (error) {
    console.error("💥 Erro ao processar pagamento:", error)
  }
}

async function handlePaymentApproval(paymentData: any) {
  const externalReference = paymentData.external_reference

  if (externalReference) {
    console.log("👤 Ativando premium para usuário:", externalReference)

    const { error } = await supabase.from("user_subscriptions").upsert(
      {
        user_id: externalReference,
        subscription_id: `payment_${paymentData.id}`,
        status: "active",
        is_active: true,
        plan_type: "premium",
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    )

    if (error) {
      console.error("❌ Erro ao ativar premium:", error)
    } else {
      console.log("🎉 Premium ativado com sucesso!")
    }
  }
}

export async function GET() {
  return NextResponse.json(
    {
      status: "webhook_active",
      timestamp: new Date().toISOString(),
      message: "Webhook do Mercado Pago está funcionando!",
    },
    { status: 200 },
  )
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
