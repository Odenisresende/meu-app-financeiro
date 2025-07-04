import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function POST(request: Request) {
  try {
    const { userId, userEmail, userName } = await request.json()

    console.log("🚀 Criando assinatura para:", { userId, userEmail, userName })

    if (!userId || !userEmail || !userName) {
      return NextResponse.json({ error: "Dados do usuário são obrigatórios" }, { status: 400 })
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ error: "Token do Mercado Pago não configurado" }, { status: 500 })
    }

    // Criar assinatura recorrente no Mercado Pago
    const subscriptionData = {
      reason: "Plano Premium - Seu Planejamento",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 17.0,
        currency_id: "BRL",
        repetitions: 12, // 1 ano, depois renova automaticamente
        billing_day: new Date().getDate(), // Dia do mês para cobrança
        billing_day_proportional: true,
      },
      payer_email: userEmail,
      back_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      external_reference: userId,
      status: "pending",
    }

    console.log("📋 Dados da assinatura:", JSON.stringify(subscriptionData, null, 2))

    const response = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `subscription_${userId}_${Date.now()}`,
      },
      body: JSON.stringify(subscriptionData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Erro do Mercado Pago:", errorText)
      return NextResponse.json(
        {
          error: "Erro ao criar assinatura",
          details: errorText,
          status: response.status,
        },
        { status: 500 },
      )
    }

    const subscription = await response.json()
    console.log("✅ Assinatura criada:", subscription.id)

    // Salvar assinatura no banco - com verificação
    try {
      console.log("🔍 Verificando se usuário já tem assinatura...")

      // Primeiro, verificar se já existe assinatura para este usuário
      const { data: existingSubscription, error: selectError } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (selectError && selectError.code !== "PGRST116") {
        // PGRST116 = "not found" - isso é OK, significa que não existe
        console.error("⚠️ Erro ao verificar assinatura existente:", selectError)
      }

      if (existingSubscription) {
        console.log("📝 Atualizando assinatura existente...")
        // Usuário já tem assinatura - vamos atualizar
        const { error: updateError } = await supabase
          .from("user_subscriptions")
          .update({
            subscription_id: subscription.id,
            status: "pending",
            is_active: false,
            plan_type: "premium",
            amount: 17.0,
            currency: "BRL",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)

        if (updateError) {
          console.error("⚠️ Erro ao atualizar assinatura:", updateError)
        } else {
          console.log("✅ Assinatura atualizada com sucesso")
        }
      } else {
        console.log("➕ Criando nova assinatura...")
        // Usuário não tem assinatura - vamos criar
        const { error: insertError } = await supabase.from("user_subscriptions").insert({
          user_id: userId,
          subscription_id: subscription.id,
          status: "pending",
          is_active: false,
          plan_type: "premium",
          amount: 17.0,
          currency: "BRL",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error("⚠️ Erro ao criar assinatura:", insertError)
        } else {
          console.log("✅ Nova assinatura criada com sucesso")
        }
      }
    } catch (dbError) {
      console.error("💥 Erro geral de banco:", dbError)
    }

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      paymentUrl: subscription.init_point,
      sandboxUrl: subscription.sandbox_init_point,
      message: "Assinatura recorrente criada com sucesso!",
      testInstructions: {
        cardNumber: "4509 9535 6623 3704",
        expiryDate: "11/25",
        cvv: "123",
        name: "APRO",
      },
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
