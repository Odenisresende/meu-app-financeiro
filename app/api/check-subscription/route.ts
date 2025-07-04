import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Força a rota a ser dinâmica
export const dynamic = "force-dynamic"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
)

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 })
    }

    // Se não tiver Supabase configurado, retorna mock
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({
        success: true,
        isActive: false,
        status: "inactive",
        subscription: null,
        message: "Supabase não configurado - usando dados mock",
        timestamp: new Date().toISOString(),
      })
    }

    const { data: subscription, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Erro ao buscar subscription:", error)
      return NextResponse.json({ error: "Erro ao buscar subscription" }, { status: 500 })
    }

    const isActive = subscription?.is_active || false
    const status = subscription?.status || "inactive"

    return NextResponse.json({
      success: true,
      isActive,
      status,
      subscription: subscription || null,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Erro ao verificar subscription:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
