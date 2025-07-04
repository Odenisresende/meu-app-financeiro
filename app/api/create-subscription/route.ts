import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function POST(request: Request) {
  try {
    const { userEmail, userName, planType = "premium", amount = 19.9 } = await request.json()

    if (!userEmail || !userName) {
      return NextResponse.json({ error: "Email e nome são obrigatórios" }, { status: 400 })
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    const publicKey = process.env.MERCADO_PAGO_PUBLIC_KEY

    if (!accessToken || !publicKey) {
      return NextResponse.json({ error: "Tokens do Mercado Pago não configurados" }, { status: 500 })
    }

    // Gerar um ID único baseado no timestamp para evitar conflitos
    const testUserId = `test_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Criar preferência de pagamento com configurações para evitar erro "pagar para si mesmo"
    const preferenceData = {
      items: [
        {
          title: "Plano Premium - Seu Planejamento",
          description: "Acesso completo ao app de controle financeiro",
          quantity: 1,
          currency_id: "BRL",
          unit_price: amount,
        },
      ],
      payer: {
        name: userName,
        email: userEmail,
        // Adicionar informações do pagador para evitar conflito
        identification: {
          type: "CPF",
          number: "12345678901", // CPF fictício para teste
        },
      },
      external_reference: testUserId,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL || "https://seu-app.vercel.app"}/payment/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL || "https://seu-app.vercel.app"}/payment/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL || "https://seu-app.vercel.app"}/payment/pending`,
      },
      auto_return: "approved",
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://seu-app.vercel.app"}/api/webhooks/mercadopago`,
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12,
      },
      // Configurações adicionais para sandbox
      purpose: "wallet_purchase",
      marketplace: "NONE",
    }

    console.log("Criando preferência com dados:", JSON.stringify(preferenceData, null, 2))

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `${testUserId}_${Date.now()}`,
      },
      body: JSON.stringify(preferenceData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Erro do Mercado Pago:", errorText)
      return NextResponse.json(
        {
          error: "Erro ao criar preferência de pagamento",
          details: errorText,
          status: response.status,
        },
        { status: 500 },
      )
    }

    const preference = await response.json()
    console.log("Preferência criada:", preference.id)

    // Salvar no banco usando INSERT ao invés de UPSERT para evitar erro de constraint
    try {
      const { error: dbError } = await supabase.from("user_subscriptions").insert({
        user_id: testUserId,
        preference_id: preference.id,
        status: "pending",
        is_active: false,
        plan_type: planType,
        amount: amount,
        currency: "BRL",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (dbError) {
        console.error("Erro ao salvar no banco:", dbError)
        // Não falhar a requisição por erro de banco em teste
      } else {
        console.log("Subscription salva no banco com sucesso")
      }
    } catch (dbError) {
      console.error("Erro de banco (não crítico para teste):", dbError)
    }

    return NextResponse.json({
      success: true,
      preferenceId: preference.id,
      paymentUrl: preference.init_point,
      sandboxUrl: preference.sandbox_init_point,
      testUserId: testUserId,
      userEmail: userEmail,
      userName: userName,
      message: "Preferência criada com sucesso! Use um email diferente do configurado na conta MP.",
    })
  } catch (error: any) {
    console.error("Erro ao criar subscription:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
