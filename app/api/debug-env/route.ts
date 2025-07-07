import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Lista de variáveis permitidas no cliente (apenas NEXT_PUBLIC_*)
    const clientSafeVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_APP_URL"]

    // Lista de variáveis do servidor (apenas status)
    const serverVars = ["MERCADO_PAGO_ACCESS_TOKEN", "MERCADO_PAGO_PUBLIC_KEY"]

    const envStatus: Record<string, any> = {}

    // Verificar variáveis do cliente
    clientSafeVars.forEach((varName) => {
      const value = process.env[varName]
      envStatus[varName] = {
        defined: !!value,
        value: value || "não definida",
        type: "client",
      }
    })

    // Verificar variáveis do servidor (apenas status)
    serverVars.forEach((varName) => {
      const value = process.env[varName]
      envStatus[varName] = {
        defined: !!value,
        value: value ? "✅ Definida" : "❌ Não definida",
        type: "server",
      }
    })

    // Informações do ambiente
    const environmentInfo = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV || "local",
      VERCEL: !!process.env.VERCEL,
      timestamp: new Date().toISOString(),
    }

    // Verificações de formato
    const formatChecks = {
      supabase_url_format: process.env.NEXT_PUBLIC_SUPABASE_URL?.includes(".supabase.co")
        ? "✅ Formato correto"
        : "❌ Formato incorreto",
      mercado_pago_token_format: process.env.MERCADO_PAGO_ACCESS_TOKEN?.startsWith("APP_USR-")
        ? "✅ Formato correto"
        : "❌ Formato incorreto",
    }

    return NextResponse.json({
      success: true,
      environment_variables: envStatus,
      environment_info: environmentInfo,
      format_checks: formatChecks,
      message: "Variáveis de ambiente verificadas com sucesso",
    })
  } catch (error: any) {
    console.error("Erro ao verificar variáveis de ambiente:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Erro ao verificar variáveis de ambiente",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
