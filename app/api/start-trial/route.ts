import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

// Usar as credenciais corretas do Supabase
const supabaseUrl = "https://nsvxswjgpqcxizbqdhoy.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zdnhzd2pncHFjeGl6YnFkaG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDc1NzIsImV4cCI6MjA2NjcyMzU3Mn0.3H-xp0EOYtO5M4GiDWs_tenRtk3aLukpzfhyAwlu4nI"

// Usar client normal para operações básicas
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const { userId, forceNew } = await request.json()

    console.log("=== INÍCIO DO TRIAL AUTOMÁTICO ===")
    console.log("User ID recebido:", userId)
    console.log("Force New:", forceNew)

    if (!userId) {
      console.log("❌ User ID não fornecido")
      return NextResponse.json({ error: "User ID é obrigatório" }, { status: 400 })
    }

    // Se forceNew = true, deletar qualquer trial existente primeiro
    if (forceNew) {
      console.log("🗑️ FORÇANDO NOVO - Deletando trials existentes...")
      const { error: deleteError } = await supabase.from("user_subscriptions").delete().eq("user_id", userId)

      if (deleteError) {
        console.log("⚠️ Erro ao deletar (ignorando):", deleteError)
      } else {
        console.log("✅ Trials existentes deletados")
      }
    } else {
      // Verificar se usuário já teve trial (apenas se não for forceNew)
      console.log("🔍 Verificando trial existente...")
      const { data: existingTrial, error: checkError } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", userId)

      console.log("Trial existente:", { existingTrial, checkError })

      if (existingTrial && existingTrial.length > 0) {
        console.log("✅ Usuário já tem trial/assinatura, retornando existente")
        const existing = existingTrial[0]

        // Calcular dias restantes
        const now = new Date()
        const expiresAt = existing.expires_at ? new Date(existing.expires_at) : null
        let trialDaysLeft = 0

        if (expiresAt) {
          const diffTime = expiresAt.getTime() - now.getTime()
          trialDaysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        }

        return NextResponse.json({
          success: true,
          message: "Trial já existe",
          expiresAt: existing.expires_at,
          trialDaysLeft: Math.max(0, trialDaysLeft),
          data: existing,
        })
      }
    }

    // Criar trial de 7 dias
    const now = new Date()
    const trialEndDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 dias

    console.log("📅 Datas:", {
      agora: now.toISOString(),
      expira: trialEndDate.toISOString(),
    })

    const trialData = {
      user_id: userId,
      subscription_id: `auto_trial_${userId}_${Date.now()}`,
      plan_type: "trial",
      status: "trial",
      started_at: now.toISOString(),
      expires_at: trialEndDate.toISOString(),
    }

    console.log("📝 Dados do trial:", trialData)

    // Inserir trial
    const { data: insertData, error: insertError } = await supabase
      .from("user_subscriptions")
      .insert(trialData)
      .select()
      .single()

    console.log("Resultado da inserção:", { insertData, insertError })

    if (insertError) {
      console.log("❌ Erro ao inserir:", insertError)
      return NextResponse.json(
        {
          error: `Erro ao criar trial: ${insertError.message}`,
          details: insertError,
        },
        { status: 500 },
      )
    }

    console.log("✅ Trial automático criado com sucesso!")
    return NextResponse.json({
      success: true,
      message: "Trial automático ativado com sucesso!",
      expiresAt: trialEndDate.toISOString(),
      trialDaysLeft: 7,
      data: insertData,
    })
  } catch (error: any) {
    console.log("❌ Erro geral:", error)
    return NextResponse.json(
      {
        error: `Erro interno: ${error.message}`,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
