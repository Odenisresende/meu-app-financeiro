import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Verificar variáveis de ambiente
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      MERCADO_PAGO_ACCESS_TOKEN: !!process.env.MERCADO_PAGO_ACCESS_TOKEN,
      MERCADO_PAGO_PUBLIC_KEY: !!process.env.MERCADO_PAGO_PUBLIC_KEY,
      NODE_ENV: process.env.NODE_ENV,
    }

    return NextResponse.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      message: "App funcionando normalmente",
      version: "160-fixed",
      environment: envCheck,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "ERROR",
        error: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
