import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const packageJsonPath = path.join(process.cwd(), "package.json")

    if (!fs.existsSync(packageJsonPath)) {
      return NextResponse.json({
        hasConflicts: true,
        message: "package.json não encontrado",
        conflicts: ["package.json missing"],
      })
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))
    const dependencies = packageJson.dependencies || {}

    const conflicts = []

    // Verificar conflitos específicos do Capacitor
    const capacitorCore = dependencies["@capacitor/core"]
    const capacitorCamera = dependencies["@capacitor/camera"]

    if (capacitorCore && capacitorCamera) {
      const coreVersion = capacitorCore.replace(/[\^~]/, "")
      const cameraVersion = capacitorCamera.replace(/[\^~]/, "")

      const coreMajor = Number.parseInt(coreVersion.split(".")[0])
      const cameraMajor = Number.parseInt(cameraVersion.split(".")[0])

      if (coreMajor !== cameraMajor) {
        conflicts.push(`@capacitor/core@${capacitorCore} vs @capacitor/camera@${capacitorCamera}`)
      }
    }

    // Verificar outras dependências problemáticas
    const problematicDeps = ["@capacitor/android", "@capacitor/cli", "@capacitor/app", "@capacitor/haptics"]

    for (const dep of problematicDeps) {
      if (dependencies[dep] && capacitorCore) {
        const depVersion = dependencies[dep].replace(/[\^~]/, "")
        const coreVersion = capacitorCore.replace(/[\^~]/, "")

        const depMajor = Number.parseInt(depVersion.split(".")[0])
        const coreMajor = Number.parseInt(coreVersion.split(".")[0])

        if (depMajor !== coreMajor) {
          conflicts.push(`${dep}@${dependencies[dep]} vs @capacitor/core@${capacitorCore}`)
        }
      }
    }

    return NextResponse.json({
      hasConflicts: conflicts.length > 0,
      message:
        conflicts.length === 0
          ? "Nenhum conflito de versão encontrado"
          : `${conflicts.length} conflito(s) de versão encontrado(s)`,
      conflicts,
    })
  } catch (error) {
    return NextResponse.json({
      hasConflicts: true,
      message: "Erro ao verificar conflitos de versão",
      conflicts: [error instanceof Error ? error.message : "Erro desconhecido"],
    })
  }
}
