import { createClient } from "@supabase/supabase-js"

// VERIFICAÇÃO ROBUSTA DAS VARIÁVEIS DE AMBIENTE
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// LOG PARA DEBUG
console.log("🔍 Verificando variáveis de ambiente:")
console.log("SUPABASE_URL:", supabaseUrl ? "✅ Definida" : "❌ Não definida")
console.log("SUPABASE_ANON_KEY:", supabaseAnonKey ? "✅ Definida" : "❌ Não definida")

// VALIDAÇÃO COM MENSAGENS CLARAS
if (!supabaseUrl) {
  console.error("❌ ERRO: NEXT_PUBLIC_SUPABASE_URL não está definida!")
  console.error("Verifique se a variável está no arquivo .env.local")
  throw new Error("NEXT_PUBLIC_SUPABASE_URL é obrigatória")
}

if (!supabaseAnonKey) {
  console.error("❌ ERRO: NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida!")
  console.error("Verifique se a variável está no arquivo .env.local")
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY é obrigatória")
}

// CRIAR CLIENTE SUPABASE
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

console.log("✅ Cliente Supabase criado com sucesso!")

// FUNÇÃO DE LOGOUT MELHORADA
export const logout = async () => {
  console.log("🚪 Fazendo logout...")

  try {
    // 1. Fazer logout do Supabase
    const { error } = await supabase.auth.signOut({
      scope: "local",
    })

    if (error) {
      console.error("Erro no logout:", error)
    }

    // 2. Limpar storage local de forma segura
    if (typeof window !== "undefined") {
      // Limpar apenas chaves relacionadas ao auth
      const keysToRemove: string[] = []

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes("sb-") || key.includes("supabase") || key.includes("auth"))) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach((key) => {
        try {
          localStorage.removeItem(key)
        } catch (e) {
          console.warn("Erro ao remover chave:", key)
        }
      })

      // Limpar session storage
      try {
        sessionStorage.clear()
      } catch (e) {
        console.warn("Erro ao limpar sessionStorage")
      }
    }

    console.log("✅ Logout realizado com sucesso")
    return true
  } catch (error) {
    console.error("❌ Falha no logout:", error)
    return false
  }
}

// FUNÇÃO PARA VERIFICAR E RENOVAR SESSÃO
export const checkAndRefreshSession = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Erro ao verificar sessão:", error)

      // Se erro de refresh token, fazer logout
      if (
        error.message.includes("refresh_token_not_found") ||
        error.message.includes("Invalid Refresh Token") ||
        error.message.includes("Already Used")
      ) {
        console.log("🔄 Token inválido, fazendo logout...")
        await logout()
        return null
      }
    }

    return session
  } catch (error) {
    console.error("Erro crítico na sessão:", error)
    await logout()
    return null
  }
}

// FUNÇÃO PARA TESTAR CONEXÃO
export const testConnection = async () => {
  try {
    console.log("🔍 Testando conexão com Supabase...")

    const { data, error } = await supabase.from("user_subscriptions").select("count").limit(1)

    if (error) {
      console.error("❌ Erro na conexão:", error)
      return false
    }

    console.log("✅ Conexão com Supabase funcionando!")
    return true
  } catch (error) {
    console.error("❌ Falha crítica na conexão:", error)
    return false
  }
}
