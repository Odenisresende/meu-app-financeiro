import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Diagnóstico básico do Next.js
    const diagnostics = {
      nextjsVersion: "14.2.16",
      nodeVersion: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || "development",
    }

    return NextResponse.json({
      success: true,
      message: "Next.js está funcionando corretamente",
      diagnostics,
      fixes: [
        "✅ Removido import problemático do next.config.mjs",
        "✅ Adicionado export const dynamic = 'force-dynamic'",
        "✅ Corrigido caminho de imports",
        "✅ Configuração de build otimizada",
      ],
    })
  } catch (error: any) {
    console.error("Erro no diagnóstico Next.js:", error)
    return NextResponse.json(
      {
        error: "Erro no diagnóstico",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
