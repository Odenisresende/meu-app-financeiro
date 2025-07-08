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

    console.log("🔧 Iniciando correção da estrutura do banco...")

    // Executar o script SQL completo
    const sqlScript = `
      -- 1. CRIAR TABELA PROFILES SE NÃO EXISTIR
      CREATE TABLE IF NOT EXISTS public.profiles (
          id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          full_name text,
          avatar_url text,
          whatsapp_number text,
          whatsapp_opt_in boolean DEFAULT false,
          whatsapp_preferences jsonb DEFAULT '{"notifications": true, "auto_categorize": true}'::jsonb,
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- 2. ADICIONAR COLUNAS FALTANTES EM USER_SUBSCRIPTIONS
      ALTER TABLE public.user_subscriptions 
      ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly'));

      -- 3. ADICIONAR COLUNAS FALTANTES EM PROFILES
      ALTER TABLE public.profiles 
      ADD COLUMN IF NOT EXISTS whatsapp_opt_in boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS whatsapp_preferences jsonb DEFAULT '{"notifications": true, "auto_categorize": true}'::jsonb;

      -- 4. CRIAR ÍNDICES SE NÃO EXISTIREM
      CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp_opt_in ON public.profiles(whatsapp_opt_in) WHERE whatsapp_opt_in = true;
      CREATE INDEX IF NOT EXISTS idx_user_subscriptions_billing_cycle ON public.user_subscriptions(billing_cycle);
      CREATE INDEX IF NOT EXISTS idx_transactions_source ON public.transactions(source);
    `

    // Executar o script em partes para evitar erros
    const commands = sqlScript.split(";").filter((cmd) => cmd.trim())

    const results = []
    for (const command of commands) {
      if (command.trim()) {
        try {
          const { data, error } = await supabase.rpc("exec_sql", { sql: command.trim() + ";" })
          results.push({
            command: command.trim().substring(0, 50) + "...",
            success: !error,
            error: error?.message || null,
          })
        } catch (err: any) {
          results.push({
            command: command.trim().substring(0, 50) + "...",
            success: false,
            error: err.message,
          })
        }
      }
    }

    // Verificar estrutura final
    const { data: tablesData } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .in("table_name", ["profiles", "user_subscriptions", "transactions", "webhook_logs"])

    console.log("✅ Correção da estrutura concluída!")

    return NextResponse.json({
      success: true,
      message: "Estrutura do banco corrigida com sucesso!",
      data: {
        commands_executed: results.length,
        tables_found: tablesData?.length || 0,
        results: results,
        tables: tablesData?.map((t) => t.table_name) || [],
      },
    })
  } catch (error: any) {
    console.error("❌ Erro ao corrigir estrutura:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao corrigir estrutura do banco",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
