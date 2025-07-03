import { createClient } from "@supabase/supabase-js"

// Fallback para desenvolvimento local se as variáveis não estiverem definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nsvxswjgpqcxizbqdhoy.supabase.co"
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zdnhzd2pncHFjeGl6YnFkaG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDc1NzIsImV4cCI6MjA2NjcyMzU3Mn0.3H-xp0EOYtO5M4GiDWs_tenRtk3aLukpzfhyAwlu4nI"

// Verificar se as variáveis estão definidas
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variáveis de ambiente do Supabase não configuradas!")
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅ Definida" : "❌ Não definida")
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseKey ? "✅ Definida" : "❌ Não definida")
}

// INSTÂNCIA ÚNICA DO SUPABASE COM CONFIGURAÇÕES MELHORADAS
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// FUNÇÃO DE LOGOUT MELHORADA
export const logout = async () => {
  console.log("🚪 Fazendo logout...")

  try {
    // 1. Fazer logout do Supabase
    const { error } = await supabase.auth.signOut({
      scope: "local", // Remove apenas da sessão local
    })

    if (error) {
      console.error("Erro no logout:", error)
      // Mesmo com erro, continuar limpeza
    }

    // 2. Limpar storage local
    if (typeof window !== "undefined") {
      localStorage.clear()
      sessionStorage.clear()

      // Limpar cookies do Supabase especificamente
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
    }

    console.log("✅ Logout realizado com sucesso")
    return true
  } catch (error) {
    console.error("❌ Falha no logout:", error)

    // Forçar limpeza mesmo com erro
    if (typeof window !== "undefined") {
      localStorage.clear()
      sessionStorage.clear()
    }

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
      if (error.message.includes("refresh_token_not_found") || error.message.includes("Invalid Refresh Token")) {
        console.log("🔄 Token inválido, fazendo logout...")
        await logout()
        if (typeof window !== "undefined") {
          window.location.reload()
        }
        return null
      }
    }

    return session
  } catch (error) {
    console.error("Erro crítico na sessão:", error)
    await logout()
    if (typeof window !== "undefined") {
      window.location.reload()
    }
    return null
  }
}
