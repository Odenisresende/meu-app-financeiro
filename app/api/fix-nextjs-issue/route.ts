import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Verificações específicas do Next.js
    const diagnostics = {
      nextVersion: process.version,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV,
      platform: process.platform,
      architecture: process.arch,
    }

    // Verificar se conseguimos importar Next.js corretamente
    let nextImportError = null
    try {
      const nextModule = await import("next")
      diagnostics.nextImported = true
    } catch (error) {
      nextImportError = error instanceof Error ? error.message : "Erro desconhecido"
      diagnostics.nextImported = false
    }

    // Verificar configuração do Next.js
    let configError = null
    try {
      // Tentar ler a configuração
      const config = await import("../../next.config.mjs")
      diagnostics.configLoaded = true
    } catch (error) {
      configError = error instanceof Error ? error.message : "Erro na configuração"
      diagnostics.configLoaded = false
    }

    return NextResponse.json({
      success: !nextImportError && !configError,
      diagnostics,
      errors: {
        nextImport: nextImportError,
        config: configError,
      },
      recommendations: [
        "Verificar se Next.js está instalado corretamente",
        "Verificar compatibilidade da versão do Node.js",
        "Verificar se next.config.mjs está correto",
        "Limpar cache do npm/yarn e reinstalar dependências",
      ],
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
      timestamp: new Date().toISOString(),
    })
  }
}
