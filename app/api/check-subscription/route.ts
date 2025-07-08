import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nsvxswjgpqcxizbqdhoy.supabase.co"
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zdnhzd2pncHFjeGl6YnFkaG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDc1NzIsImV4cCI6MjA2NjcyMzU3Mn0.3H-xp0EOYtO5M4GiDWs_tenRtk3aLukpzfhyAwlu4nI"

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 })
    }

    console.log("🔍 Verificando assinatura para usuário:", userId)

    // Buscar assinatura ativa
    const { data: subscription, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("❌ Erro ao buscar subscription:", error)
      return NextResponse.json({ error: "Erro ao buscar subscription" }, { status: 500 })
    }

    // Verificar se a assinatura está ativa e não expirou
    let isActive = false
    let status = "inactive"

    if (subscription) {
      const now = new Date()
      const expiresAt = subscription.expires_at ? new Date(subscription.expires_at) : null

      // Verificar se não expirou
      const notExpired = !expiresAt || expiresAt > now

      // Considerar ativo se tem status ativo/trial e não expirou
      isActive = (subscription.status === "active" || subscription.status === "trial") && notExpired
      status = subscription.status || "inactive"

      console.log("📊 Status da assinatura:", {
        subscription_id: subscription.subscription_id,
        status: subscription.status,
        expires_at: subscription.expires_at,
        is_active: isActive,
        not_expired: notExpired,
      })
    } else {
      console.log("📭 Nenhuma assinatura encontrada para o usuário")
    }

    return NextResponse.json({
      success: true,
      isActive,
      status,
      subscription: subscription || null,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("💥 Erro ao verificar subscription:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
