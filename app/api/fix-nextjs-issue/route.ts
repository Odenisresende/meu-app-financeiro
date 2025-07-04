import { NextResponse } from "next/server"

// Força a rota a ser dinâmica
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      nextjs_version: "14.2.16",
      node_version: process.version,
      environment: process.env.NODE_ENV,
      vercel_env: process.env.VERCEL_ENV || "development",
      platform: process.platform,
      architecture: process.arch,
      status: "healthy",
      fixes_applied: [
        "✅ Removido import problemático do next.config.mjs",
        "✅ Adicionado export const dynamic = 'force-dynamic'",
        "✅ Corrigido caminho de imports",
        "✅ Configuração de build otimizada",
      ],
    }

    return NextResponse.json({
      success: true,
      message: "Next.js está funcionando corretamente",
      data: diagnostics,
    })
  } catch (error: any) {
    console.error("Erro no diagnóstico Next.js:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro no diagnóstico",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
