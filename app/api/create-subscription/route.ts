import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { userId, planType } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID é obrigatório" }, { status: 400 })
    }

    console.log("💳 Criando assinatura para usuário:", userId, "Plano:", planType)

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ error: "Mercado Pago não configurado" }, { status: 500 })
    }

    // Criar preferência de pagamento
    const preferenceData = {
      items: [
        {
          title: "Seu Planejamento - Premium",
          description: "Assinatura mensal do plano Premium",
          quantity: 1,
          currency_id: "BRL",
          unit_price: 17.0,
        },
      ],
      payer: {
        email: "usuario@exemplo.com", // Você pode pegar do usuário
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending`,
      },
      auto_return: "approved",
      external_reference: userId,
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

    const preference = await response.json()

    if (!response.ok) {
      console.error("❌ Erro do Mercado Pago:", preference)
      return NextResponse.json({ error: "Erro ao criar preferência de pagamento" }, { status: 500 })
    }

    console.log("✅ Preferência criada:", preference.id)

    return NextResponse.json({
      success: true,
      preference_id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
    })
  } catch (error: any) {
    console.error("💥 Erro ao criar assinatura:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
