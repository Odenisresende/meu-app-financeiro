import { NextResponse } from "next/server"

export async function GET() {
  try {
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      MERCADO_PAGO_ACCESS_TOKEN: process.env.MERCADO_PAGO_ACCESS_TOKEN,
      MERCADO_PAGO_PUBLIC_KEY: process.env.MERCADO_PAGO_PUBLIC_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NODE_ENV: process.env.NODE_ENV,
    }

    const status = {
      NEXT_PUBLIC_SUPABASE_URL: envVars.NEXT_PUBLIC_SUPABASE_URL ? "✅ Configurada" : "❌ Não configurada",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Configurada" : "❌ Não configurada",
      MERCADO_PAGO_ACCESS_TOKEN: envVars.MERCADO_PAGO_ACCESS_TOKEN ? "✅ Configurada" : "❌ Não configurada",
      MERCADO_PAGO_PUBLIC_KEY: envVars.MERCADO_PAGO_PUBLIC_KEY ? "✅ Configurada" : "❌ Não configurada",
      NEXT_PUBLIC_APP_URL: envVars.NEXT_PUBLIC_APP_URL ? "✅ Configurada" : "❌ Não configurada",
      NODE_ENV: envVars.NODE_ENV || "não definida",
      supabase_url_value: envVars.NEXT_PUBLIC_SUPABASE_URL || "não definida",
    }

    return NextResponse.json({
      status: "success",
      environment_variables: status,
      missing_vars: Object.entries(status)
        .filter(([key, value]) => value.includes("❌"))
        .map(([key]) => key),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
