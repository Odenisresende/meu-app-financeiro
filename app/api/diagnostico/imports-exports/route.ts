import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const issues = []

    // Verificar auth-wrapper.tsx
    const authWrapperPath = path.join(process.cwd(), "components/auth-wrapper.tsx")
    if (fs.existsSync(authWrapperPath)) {
      const content = fs.readFileSync(authWrapperPath, "utf8")

      if (!content.includes("export") || !content.includes("useAuth")) {
        issues.push("auth-wrapper.tsx: useAuth não está sendo exportado")
      }

      if (content.includes("... This file was left out for brevity")) {
        issues.push("auth-wrapper.tsx: contém placeholder em vez de código real")
      }
    } else {
      issues.push("auth-wrapper.tsx: arquivo não encontrado")
    }

    // Verificar lib/supabase-client.ts
    const supabaseClientPath = path.join(process.cwd(), "lib/supabase-client.ts")
    if (fs.existsSync(supabaseClientPath)) {
      const content = fs.readFileSync(supabaseClientPath, "utf8")

      if (!content.includes("createClient") || !content.includes("export")) {
        issues.push("lib/supabase-client.ts: não exporta cliente Supabase corretamente")
      }
    } else {
      issues.push("lib/supabase-client.ts: arquivo não encontrado")
    }

    // Verificar lib/supabase.ts (arquivo alternativo)
    const supabasePath = path.join(process.cwd(), "lib/supabase.ts")
    if (fs.existsSync(supabasePath)) {
      const content = fs.readFileSync(supabasePath, "utf8")

      if (content.includes("... This file was left out for brevity")) {
        issues.push("lib/supabase.ts: contém placeholder em vez de código real")
      }
    }

    return NextResponse.json({
      hasMissingExports: issues.length > 0,
      message:
        issues.length === 0
          ? "Todos os exports estão corretos"
          : `${issues.length} problema(s) de import/export encontrado(s)`,
      missingExports: issues,
    })
  } catch (error) {
    return NextResponse.json({
      hasMissingExports: true,
      message: "Erro ao verificar imports/exports",
      missingExports: [error instanceof Error ? error.message : "Erro desconhecido"],
    })
  }
}
