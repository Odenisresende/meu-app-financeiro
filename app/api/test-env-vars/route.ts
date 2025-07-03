import { NextResponse } from "next/server"

export async function GET() {
  try {
    const requiredVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "MERCADO_PAGO_ACCESS_TOKEN",
      "MERCADO_PAGO_PUBLIC_KEY",
      "NEXT_PUBLIC_APP_URL",
    ]

    const missing = []
    const configured = []

    for (const varName of requiredVars) {
      if (process.env[varName]) {
        configured.push(varName)
      } else {
        missing.push(varName)
      }
    }

    return NextResponse.json({
      allConfigured: missing.length === 0,
      configured,
      missing,
      total: requiredVars.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      allConfigured: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
      timestamp: new Date().toISOString(),
    })
  }
}
