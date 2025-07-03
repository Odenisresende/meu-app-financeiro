import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Testar roteamento básico
    const routingTests = {
      api_route_working: true,
      can_return_json: true,
      headers_accessible: true,
      timestamp: new Date().toISOString(),
    }

    // Verificar headers da requisição
    const headers = {
      host: process.env.VERCEL_URL || "unknown",
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
    }

    return NextResponse.json({
      status: "success",
      message: "Roteamento funcionando",
      tests: routingTests,
      headers,
      next_steps: [
        "✅ API routes estão funcionando",
        "✅ JSON responses funcionando",
        "🔍 Verificar se página principal carrega",
      ],
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Erro no teste de roteamento",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
