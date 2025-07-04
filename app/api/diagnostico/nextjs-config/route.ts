import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const configPath = path.join(process.cwd(), "next.config.mjs")

    if (!fs.existsSync(configPath)) {
      return NextResponse.json({
        isValid: false,
        message: "next.config.mjs não encontrado",
        details: "Arquivo de configuração do Next.js não existe",
      })
    }

    const content = fs.readFileSync(configPath, "utf8")
    const issues = []

    // Verificações básicas
    if (!content.includes("nextConfig")) {
      issues.push("Configuração nextConfig não encontrada")
    }

    if (!content.includes("export default")) {
      issues.push("Export default não encontrado")
    }

    // Verificações específicas para o projeto
    if (!content.includes("images")) {
      issues.push("Configuração de imagens não encontrada (pode causar problemas)")
    }

    if (!content.includes("eslint") || !content.includes("ignoreDuringBuilds")) {
      issues.push("ESLint não está configurado para ignorar erros durante build")
    }

    if (!content.includes("typescript") || !content.includes("ignoreBuildErrors")) {
      issues.push("TypeScript não está configurado para ignorar erros durante build")
    }

    return NextResponse.json({
      isValid: issues.length === 0,
      message:
        issues.length === 0
          ? "Configuração Next.js está correta"
          : `${issues.length} problema(s) na configuração Next.js`,
      details: JSON.stringify(
        {
          issues,
          preview: content.substring(0, 300) + (content.length > 300 ? "..." : ""),
        },
        null,
        2,
      ),
    })
  } catch (error) {
    return NextResponse.json({
      isValid: false,
      message: "Erro ao verificar configuração Next.js",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    })
  }
}
