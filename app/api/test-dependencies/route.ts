import { NextResponse } from "next/server"

export async function GET() {
  try {
    const warnings = []

    // Verificar Next.js
    try {
      const nextPackage = require("next/package.json")
      if (nextPackage.version.startsWith("15.")) {
        warnings.push("Next.js 15 pode ter problemas de compatibilidade")
      }
    } catch (error) {
      warnings.push("Problema com Next.js: " + (error instanceof Error ? error.message : "Erro desconhecido"))
    }

    // Verificar React
    try {
      const reactPackage = require("react/package.json")
      // Verificações específicas do React se necessário
    } catch (error) {
      warnings.push("Problema com React: " + (error instanceof Error ? error.message : "Erro desconhecido"))
    }

    // Verificar Supabase
    try {
      require("@supabase/supabase-js")
    } catch (error) {
      warnings.push("Problema com Supabase: " + (error instanceof Error ? error.message : "Erro desconhecido"))
    }

    return NextResponse.json({
      valid: warnings.length === 0,
      warnings: warnings.length > 0 ? warnings : undefined,
      message: warnings.length === 0 ? "Todas as dependências OK" : "Possíveis problemas detectados",
    })
  } catch (error) {
    return NextResponse.json({
      valid: false,
      warnings: [error instanceof Error ? error.message : "Erro desconhecido"],
    })
  }
}
