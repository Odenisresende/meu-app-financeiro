import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Verificar se estamos em produção
    const isProduction = process.env.VERCEL_ENV === "production"
    const isDevelopment = process.env.NODE_ENV === "development"

    // Informações do ambiente atual
    const environmentInfo = {
      vercel_env: process.env.VERCEL_ENV,
      node_env: process.env.NODE_ENV,
      vercel_url: process.env.VERCEL_URL,
      is_production: isProduction,
      is_development: isDevelopment,
      timestamp: new Date().toISOString(),
    }

    // Testar se conseguimos acessar recursos básicos
    const basicTests = {
      can_access_env_vars: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      can_create_response: true,
      current_url: process.env.VERCEL_URL || "localhost",
    }

    return NextResponse.json({
      status: "success",
      message: "Teste de produção executado",
      environment: environmentInfo,
      tests: basicTests,
      recommendation: isProduction
        ? "✅ Ambiente de produção detectado"
        : "⚠️ Não está em produção - pode ser o problema",
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Erro no teste de produção",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
