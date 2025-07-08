import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ success: false, error: "Variáveis de ambiente não configuradas" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log("🔍 Testando estrutura do banco após correções...")

    // Testar cada tabela
    const tests = []

    // 1. Testar PROFILES
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, whatsapp_opt_in, whatsapp_preferences")
        .limit(1)

      tests.push({
        table: "profiles",
        success: !profilesError,
        error: profilesError?.message || null,
        columns_found: profilesData ? Object.keys(profilesData[0] || {}).length : 0,
      })
    } catch (err: any) {
      tests.push({
        table: "profiles",
        success: false,
        error: err.message,
        columns_found: 0,
      })
    }

    // 2. Testar USER_SUBSCRIPTIONS
    try {
      const { data: subsData, error: subsError } = await supabase
        .from("user_subscriptions")
        .select("id, user_id, plan_type, billing_cycle, is_active")
        .limit(1)

      tests.push({
        table: "user_subscriptions",
        success: !subsError,
        error: subsError?.message || null,
        columns_found: subsData ? Object.keys(subsData[0] || {}).length : 0,
      })
    } catch (err: any) {
      tests.push({
        table: "user_subscriptions",
        success: false,
        error: err.message,
        columns_found: 0,
      })
    }

    // 3. Testar TRANSACTIONS
    try {
      const { data: transData, error: transError } = await supabase
        .from("transactions")
        .select("id, user_id, amount, type, source")
        .limit(1)

      tests.push({
        table: "transactions",
        success: !transError,
        error: transError?.message || null,
        columns_found: transData ? Object.keys(transData[0] || {}).length : 0,
      })
    } catch (err: any) {
      tests.push({
        table: "transactions",
        success: false,
        error: err.message,
        columns_found: 0,
      })
    }

    // 4. Testar WEBHOOK_LOGS
    try {
      const { data: webhookData, error: webhookError } = await supabase
        .from("webhook_logs")
        .select("id, event_type, processed")
        .limit(1)

      tests.push({
        table: "webhook_logs",
        success: !webhookError,
        error: webhookError?.message || null,
        columns_found: webhookData ? Object.keys(webhookData[0] || {}).length : 0,
      })
    } catch (err: any) {
      tests.push({
        table: "webhook_logs",
        success: false,
        error: err.message,
        columns_found: 0,
      })
    }

    const successfulTests = tests.filter((t) => t.success).length
    const totalTests = tests.length

    return NextResponse.json({
      success: successfulTests === totalTests,
      message: `Teste concluído: ${successfulTests}/${totalTests} tabelas funcionando`,
      data: {
        tests,
        summary: {
          total_tables: totalTests,
          working_tables: successfulTests,
          percentage: Math.round((successfulTests / totalTests) * 100),
        },
      },
    })
  } catch (error: any) {
    console.error("❌ Erro no teste:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao testar banco de dados",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
