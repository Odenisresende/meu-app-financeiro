import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          status: "error",
          message: "Variáveis do Supabase não configuradas",
          details: {
            url: !!supabaseUrl,
            key: !!supabaseKey,
          },
        },
        { status: 500 },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Teste simples de conexão
    const { data, error } = await supabase.from("transactions").select("count").limit(1)

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: "Erro na conexão com Supabase",
          details: {
            url_used: supabaseUrl,
            error: error.message,
          },
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "success",
      message: "Conexão com Supabase OK",
      details: {
        url_used: supabaseUrl,
        connection_test: "✅ Sucesso",
        data_returned: !!data,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Erro interno no teste do Supabase",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
