import { NextResponse } from "next/server"

export async function GET() {
  try {
    const debugInfo = {
      process_env: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "não definida",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "configurada" : "não definida",
        MERCADO_PAGO_ACCESS_TOKEN: process.env.MERCADO_PAGO_ACCESS_TOKEN ? "configurada" : "não definida",
        MERCADO_PAGO_PUBLIC_KEY: process.env.MERCADO_PAGO_PUBLIC_KEY ? "configurada" : "não definida",
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "não definida",
        NODE_ENV: process.env.NODE_ENV || "não definida",
      },
      status: {
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        MERCADO_PAGO_ACCESS_TOKEN: !!process.env.MERCADO_PAGO_ACCESS_TOKEN,
        MERCADO_PAGO_PUBLIC_KEY: !!process.env.MERCADO_PAGO_PUBLIC_KEY,
        NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
      },
      vercel_info: {
        VERCEL: process.env.VERCEL || "não definida",
        VERCEL_ENV: process.env.VERCEL_ENV || "não definida",
        VERCEL_URL: process.env.VERCEL_URL || "não definida",
        VERCEL_REGION: process.env.VERCEL_REGION || "não definida",
        VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA || "not-vercel",
      },
      runtime_info: {
        platform: process.platform,
        node_version: process.version,
        timestamp: new Date().toISOString(),
      },
    }

    const allVarsConfigured = [
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      process.env.MERCADO_PAGO_ACCESS_TOKEN,
      process.env.MERCADO_PAGO_PUBLIC_KEY,
      process.env.NEXT_PUBLIC_APP_URL,
    ].every(Boolean)

    const missingVars = [
      !process.env.NEXT_PUBLIC_SUPABASE_URL && "NEXT_PUBLIC_SUPABASE_URL",
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      !process.env.MERCADO_PAGO_ACCESS_TOKEN && "MERCADO_PAGO_ACCESS_TOKEN",
      !process.env.MERCADO_PAGO_PUBLIC_KEY && "MERCADO_PAGO_PUBLIC_KEY",
      !process.env.NEXT_PUBLIC_APP_URL && "NEXT_PUBLIC_APP_URL",
    ].filter(Boolean)

    return NextResponse.json({
      status: "success",
      debug_info: debugInfo,
      summary: {
        all_vars_configured: allVarsConfigured,
        missing_vars: missingVars,
        is_vercel: !!process.env.VERCEL,
        environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Erro ao obter informações de debug",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
