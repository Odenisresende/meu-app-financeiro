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
    const present = []

    for (const varName of requiredVars) {
      const value = process.env[varName]
      if (!value || value.trim() === "") {
        missing.push(varName)
      } else {
        present.push(varName)
      }
    }

    return NextResponse.json({
      allPresent: missing.length === 0,
      message:
        missing.length === 0
          ? "Todas as variáveis de ambiente estão configuradas"
          : `${missing.length} variável(is) de ambiente faltando`,
      missing,
      present,
      total: requiredVars.length,
    })
  } catch (error) {
    return NextResponse.json({
      allPresent: false,
      message: "Erro ao verificar variáveis de ambiente",
      missing: ["Erro na verificação"],
      present: [],
      total: 0,
    })
  }
}
