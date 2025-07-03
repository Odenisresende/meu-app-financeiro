import { NextResponse } from "next/server"

export async function GET() {
  try {
    return NextResponse.json({
      status: "success",
      message: "Deploy info retrieved",
      deploy_info: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        vercel_env: process.env.VERCEL_ENV,
        region: process.env.VERCEL_REGION,
        deployment_url: process.env.VERCEL_URL,
      },
      env_status: {
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        MERCADO_PAGO_ACCESS_TOKEN: !!process.env.MERCADO_PAGO_ACCESS_TOKEN,
        MERCADO_PAGO_PUBLIC_KEY: !!process.env.MERCADO_PAGO_PUBLIC_KEY,
      },
      all_vars_available: !![
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        process.env.MERCADO_PAGO_ACCESS_TOKEN,
        process.env.MERCADO_PAGO_PUBLIC_KEY,
      ].every(Boolean),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Erro ao obter informações do deploy",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
