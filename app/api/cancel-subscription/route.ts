import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const supabaseUrl = "https://nsvxswjgpqcxizbqdhoy.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zdnhzd2pncHFjeGl6YnFkaG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDc1NzIsImV4cCI6MjA2NjcyMzU3Mn0.3H-xp0EOYtO5M4GiDWs_tenRtk3aLukpzfhyAwlu4nI"
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID é obrigatório" }, { status: 400 })
    }

    console.log("🚫 Iniciando cancelamento para usuário:", userId)

    // Buscar assinatura ativa do usuário
    const { data: subscription, error: fetchError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single()

    if (fetchError || !subscription) {
      return NextResponse.json({ error: "Assinatura não encontrada" }, { status: 404 })
    }

    const subscriptionId = subscription.subscription_id

    // Cancelar no Mercado Pago
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ error: "Token do Mercado Pago não configurado" }, { status: 500 })
    }

    try {
      console.log("🔄 Cancelando no Mercado Pago:", subscriptionId)

      const cancelResponse = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "cancelled",
        }),
      })

      if (!cancelResponse.ok) {
        const errorData = await cancelResponse.json()
        console.error("❌ Erro do Mercado Pago:", errorData)
        return NextResponse.json({ error: "Erro ao cancelar no Mercado Pago" }, { status: 500 })
      }

      console.log("✅ Cancelado no Mercado Pago com sucesso!")
    } catch (mpError) {
      console.error("💥 Erro na API do Mercado Pago:", mpError)
      return NextResponse.json({ error: "Erro de comunicação com Mercado Pago" }, { status: 500 })
    }

    // Atualizar no banco de dados
    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update({
        status: "cancelled",
        is_active: false,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("subscription_id", subscriptionId)

    if (updateError) {
      console.error("❌ Erro ao atualizar banco:", updateError)
      return NextResponse.json({ error: "Erro ao atualizar status no banco" }, { status: 500 })
    }

    console.log("🎉 Assinatura cancelada com sucesso!")

    return NextResponse.json({
      success: true,
      message: "Assinatura cancelada com sucesso",
      subscription_id: subscriptionId,
    })
  } catch (error) {
    console.error("💥 Erro geral:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
