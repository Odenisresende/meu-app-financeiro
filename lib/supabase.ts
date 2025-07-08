import { createClient } from "@supabase/supabase-js"

// Configuração direta para V0
const supabaseUrl = "https://iyltagcmvocbdvebrnih.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5bHRhZ2Ntdm9jYmR2ZWJybmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1ODc2MTUsImV4cCI6MjA2NzE2MzYxNX0.RP1LSlSpR4ub2BJfvKIzr0dCAi5unN9OO6UWDdJleOE"

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
