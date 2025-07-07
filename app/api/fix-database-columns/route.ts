import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: "Variáveis de ambiente do Supabase não configuradas" },
        { status: 500 },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Adicionar colunas WhatsApp na tabela profiles
    const { error: profilesError } = await supabase.rpc("exec_sql", {
      sql: `
        ALTER TABLE profiles 
        ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS whatsapp_preferences JSONB DEFAULT '{}';
      `,
    })

    // 2. Adicionar coluna billing_cycle na tabela user_subscriptions
    const { error: subscriptionsError } = await supabase.rpc("exec_sql", {
      sql: `
        ALTER TABLE user_subscriptions
        ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly';
      `,
    })

    // 3. Verificar se as colunas foram criadas
    const { data: profilesColumns } = await supabase.rpc("exec_sql", {
      sql: `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name IN ('whatsapp_opt_in', 'whatsapp_preferences');
      `,
    })

    const { data: subscriptionsColumns } = await supabase.rpc("exec_sql", {
      sql: `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'user_subscriptions' 
        AND column_name = 'billing_cycle';
      `,
    })

    return NextResponse.json({
      success: true,
      message: "Colunas adicionadas com sucesso!",
      data: {
        profiles_columns: profilesColumns,
        subscriptions_columns: subscriptionsColumns,
        errors: {
          profiles: profilesError?.message || null,
          subscriptions: subscriptionsError?.message || null,
        },
      },
    })
  } catch (error: any) {
    console.error("Erro ao adicionar colunas:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao adicionar colunas no banco",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
