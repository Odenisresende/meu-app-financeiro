import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        connected: false,
        error: "Variáveis do Supabase não configuradas",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Teste simples de conexão
    const { data, error } = await supabase.from("profiles").select("count").limit(1)

    if (error) {
      return NextResponse.json({
        connected: false,
        error: error.message,
      })
    }

    return NextResponse.json({
      connected: true,
      message: "Conexão com Supabase OK",
    })
  } catch (error) {
    return NextResponse.json({
      connected: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    })
  }
}
