import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const packageJsonPath = path.join(process.cwd(), "package.json")

    if (!fs.existsSync(packageJsonPath)) {
      return NextResponse.json({
        success: false,
        message: "package.json não encontrado",
        details: "Arquivo package.json não existe no diretório raiz",
      })
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))
    const dependencies = packageJson.dependencies || {}

    // Verificar conflitos do Capacitor
    const capacitorDeps = Object.entries(dependencies)
      .filter(([name]) => name.startsWith("@capacitor/"))
      .map(([name, version]) => ({ name, version }))

    const conflicts = []
    const coreVersion = dependencies["@capacitor/core"]

    if (coreVersion) {
      for (const dep of capacitorDeps) {
        if (dep.name !== "@capacitor/core") {
          // Verificar se as versões são compatíveis
          const depVersion = dep.version as string
          if (depVersion.includes("7.") && coreVersion.includes("6.")) {
            conflicts.push(`${dep.name}@${dep.version} incompatível com @capacitor/core@${coreVersion}`)
          }
        }
      }
    }

    return NextResponse.json({
      success: conflicts.length === 0,
      message:
        conflicts.length === 0
          ? "Todas as dependências estão compatíveis"
          : `${conflicts.length} conflito(s) de dependência encontrado(s)`,
      details: JSON.stringify(
        {
          capacitorDeps,
          conflicts,
          totalDeps: Object.keys(dependencies).length,
        },
        null,
        2,
      ),
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Erro ao analisar dependências",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    })
  }
}
