import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        valid: false,
        issues: ["Variáveis do Supabase não configuradas"],
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const issues = []

    // Verificar tabelas essenciais
    const tables = ["profiles", "transactions", "user_subscriptions"]

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select("*").limit(1)
        if (error) {
          issues.push(`Tabela ${table}: ${error.message}`)
        }
      } catch (err) {
        issues.push(`Erro ao verificar tabela ${table}`)
      }
    }

    return NextResponse.json({
      valid: issues.length === 0,
      issues: issues.length > 0 ? issues : undefined,
      message: issues.length === 0 ? "Estrutura do banco OK" : "Problemas encontrados",
    })
  } catch (error) {
    return NextResponse.json({
      valid: false,
      issues: [error instanceof Error ? error.message : "Erro desconhecido"],
    })
  }
}
