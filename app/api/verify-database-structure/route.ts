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

    // Verificar estrutura das tabelas principais
    const tables = ["profiles", "user_subscriptions", "transactions", "webhook_logs"]
    const results: any = {}

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from("information_schema.columns")
          .select("column_name, data_type, is_nullable, column_default")
          .eq("table_name", table)
          .eq("table_schema", "public")

        results[table] = {
          exists: !error && data && data.length > 0,
          columns: data || [],
          error: error?.message || null,
        }
      } catch (err: any) {
        results[table] = {
          exists: false,
          columns: [],
          error: err.message,
        }
      }
    }

    // Verificar colunas específicas que precisamos
    const requiredColumns = {
      profiles: ["whatsapp_opt_in", "whatsapp_preferences"],
      user_subscriptions: ["billing_cycle"],
      transactions: ["user_id", "amount", "type"],
      webhook_logs: ["event_type", "payload"],
    }

    const missingColumns: any = {}

    for (const [table, columns] of Object.entries(requiredColumns)) {
      if (results[table]?.exists) {
        const existingColumns = results[table].columns.map((col: any) => col.column_name)
        missingColumns[table] = columns.filter((col) => !existingColumns.includes(col))
      } else {
        missingColumns[table] = columns
      }
    }

    return NextResponse.json({
      success: true,
      message: "Verificação da estrutura do banco concluída",
      data: {
        tables: results,
        missing_columns: missingColumns,
        summary: {
          total_tables: tables.length,
          existing_tables: Object.values(results).filter((r: any) => r.exists).length,
          total_missing_columns: Object.values(missingColumns).flat().length,
        },
      },
    })
  } catch (error: any) {
    console.error("Erro na verificação:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro na verificação da estrutura",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
