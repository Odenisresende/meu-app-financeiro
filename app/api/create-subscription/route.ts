import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function POST(request: Request) {
  try {
    const { userId, planType = "premium" } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 })
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    const publicKey = process.env.MERCADO_PAGO_PUBLIC_KEY

    if (!accessToken || !publicKey) {
      return NextResponse.json({ error: "Tokens do Mercado Pago não configurados" }, { status: 500 })
    }

    // Criar preferência de pagamento
    const preferenceData = {
      items: [
        {
          title: "Plano Premium - Seu Planejamento",
          description: "Acesso completo ao app de controle financeiro",
          quantity: 1,
          currency_id: "BRL",
          unit_price: 19.9,
        },
      ],
      payer: {
        email: "usuario@exemplo.com",
      },
      external_reference: userId,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending`,
      },
      auto_return: "approved",
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
    }

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferenceData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Erro do Mercado Pago:", errorText)
      return NextResponse.json({ error: "Erro ao criar preferência de pagamento" }, { status: 500 })
    }

    const preference = await response.json()

    // Salvar no banco
    const { error: dbError } = await supabase.from("user_subscriptions").upsert(
      {
        user_id: userId,
        status: "pending",
        is_active: false,
        plan_type: planType,
        preference_id: preference.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    )

    if (dbError) {
      console.error("Erro ao salvar no banco:", dbError)
      return NextResponse.json({ error: "Erro ao salvar subscription" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    })
  } catch (error: any) {
    console.error("Erro ao criar subscription:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
