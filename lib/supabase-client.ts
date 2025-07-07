import { createClient } from "@supabase/supabase-js"

// SINGLETON PATTERN PARA EVITAR MÚLTIPLAS INSTÂNCIAS
let supabaseInstance: any = null

export const createSupabaseClient = () => {
  // VERIFICAÇÃO ROBUSTA DAS VARIÁVEIS DE AMBIENTE
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // VALIDAÇÃO COM MENSAGENS CLARAS
  if (!supabaseUrl) {
    console.error("❌ ERRO: NEXT_PUBLIC_SUPABASE_URL não está definida!")
    throw new Error("NEXT_PUBLIC_SUPABASE_URL é obrigatória")
  }

  if (!supabaseAnonKey) {
    console.error("❌ ERRO: NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida!")
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY é obrigatória")
  }

  // CRIAR CLIENTE APENAS UMA VEZ
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
    console.log("✅ Cliente Supabase criado (singleton)")
  }

  return supabaseInstance
}

// EXPORTAR INSTÂNCIA ÚNICA
export const supabase = createSupabaseClient()

// FUNÇÃO PARA RESETAR INSTÂNCIA (ÚTIL PARA TESTES)
export const resetSupabaseInstance = () => {
  supabaseInstance = null
  console.log("🔄 Instância Supabase resetada")
}
