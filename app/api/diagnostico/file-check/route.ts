import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get("file")

    if (!fileName) {
      return NextResponse.json({
        exists: false,
        message: "Nome do arquivo não fornecido",
        details: "Parâmetro file é obrigatório",
      })
    }

    const filePath = path.join(process.cwd(), fileName)
    const exists = fs.existsSync(filePath)

    if (!exists) {
      return NextResponse.json({
        exists: false,
        message: `Arquivo ${fileName} não encontrado`,
        details: `Caminho verificado: ${filePath}`,
      })
    }

    // Verificar se é um arquivo válido (não vazio)
    const stats = fs.statSync(filePath)
    const isEmpty = stats.size === 0

    let content = ""
    let hasIssues = false
    const issues = []

    try {
      content = fs.readFileSync(filePath, "utf8")

      // Verificações específicas por tipo de arquivo
      if (fileName.endsWith(".tsx") || fileName.endsWith(".ts")) {
        if (content.includes("... This file was left out for brevity")) {
          hasIssues = true
          issues.push("Arquivo contém placeholder em vez de código real")
        }

        if (fileName.includes("auth-wrapper") && !content.includes("export.*useAuth")) {
          hasIssues = true
          issues.push("auth-wrapper.tsx não exporta useAuth")
        }
      }

      if (fileName === "package.json") {
        try {
          const packageJson = JSON.parse(content)
          if (!packageJson.dependencies) {
            hasIssues = true
            issues.push("package.json não tem seção dependencies")
          }
        } catch {
          hasIssues = true
          issues.push("package.json tem JSON inválido")
        }
      }
    } catch (error) {
      hasIssues = true
      issues.push(`Erro ao ler arquivo: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
    }

    return NextResponse.json({
      exists: true,
      message: hasIssues ? `Arquivo ${fileName} existe mas tem problemas` : `Arquivo ${fileName} está OK`,
      details: JSON.stringify(
        {
          size: stats.size,
          isEmpty,
          hasIssues,
          issues,
          preview: content.substring(0, 200) + (content.length > 200 ? "..." : ""),
        },
        null,
        2,
      ),
    })
  } catch (error) {
    return NextResponse.json({
      exists: false,
      message: "Erro ao verificar arquivo",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    })
  }
}
