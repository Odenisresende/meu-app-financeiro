import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function POST(request: Request) {
  try {
    const { userId, subscriptionId = "manual-activation" } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 })
    }

    console.log(`🎉 Ativando premium manualmente para usuário: ${userId}`)

    const { data: updateResult, error } = await supabase
      .from("user_subscriptions")
      .upsert(
        {
          user_id: userId,
          status: "active",
          is_active: true,
          subscription_id: subscriptionId,
          plan_type: "premium",
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      )
      .select()

    if (error) {
      console.error("❌ Erro ao ativar premium:", error)
      return NextResponse.json({
        success: false,
        error: "Erro ao ativar premium",
        details: error.message,
      })
    }

    console.log("✅ Premium ativado com sucesso!")

    return NextResponse.json({
      success: true,
      message: "Premium ativado manualmente com sucesso!",
      subscription: updateResult?.[0] || null,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("💥 Erro ao ativar premium:", error)
    return NextResponse.json({
      success: false,
      error: "Erro interno do servidor",
      details: error.message,
    })
  }
}
