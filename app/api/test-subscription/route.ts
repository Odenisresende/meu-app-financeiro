import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const supabaseUrl = "https://nsvxswjgpqcxizbqdhoy.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zdnhzd2pncHFjeGl6YnFkaG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDc1NzIsImV4cCI6MjA2NjcyMzU3Mn0.3H-xp0EOYtO5M4GiDWs_tenRtk3aLukpzfhyAwlu4nI"
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const { action, userId } = await request.json()

    if (action === "create_test") {
      // Criar assinatura de teste
      const testSubscriptionId = `test-sub-${Date.now()}`

      const { data, error } = await supabase.from("user_subscriptions").upsert(
        {
          user_id: userId,
          subscription_id: testSubscriptionId,
          status: "active",
          is_active: true,
          plan_type: "premium",
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      )

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Assinatura de teste criada",
        subscription_id: testSubscriptionId,
        data,
      })
    }

    if (action === "check_status") {
      // Verificar status da assinatura
      const { data, error } = await supabase.from("user_subscriptions").select("*").eq("user_id", userId).single()

      if (error) {
        return NextResponse.json({ error: "Assinatura não encontrada" }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        subscription: data,
      })
    }

    return NextResponse.json({ error: "Ação não reconhecida" }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "API de teste de assinaturas ativa",
    endpoints: {
      "POST /api/test-subscription": {
        create_test: "Criar assinatura de teste",
        check_status: "Verificar status da assinatura",
      },
    },
  })
}
