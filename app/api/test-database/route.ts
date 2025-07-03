import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Configuração Supabase incompleta",
          details: "SUPABASE_URL ou SUPABASE_ANON_KEY não configurados",
        },
        { status: 400 },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Testa conexão
    const { data, error } = await supabase.from("subscriptions").select("count").limit(1)

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Erro ao acessar tabela subscriptions",
          details: error.message,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Conexão com banco OK",
      details: "Tabela subscriptions acessível",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
