import { createClient } from "@supabase/supabase-js"

// SUAS NOVAS CREDENCIAIS DO SUPABASE (ATUALIZE AQUI)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://SEU_NOVO_PROJETO.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "SUA_NOVA_CHAVE_ANONIMA"

// Verificar se as variáveis estão definidas
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variáveis de ambiente do Supabase não configuradas!")
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅ Definida" : "❌ Não definida")
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseKey ? "✅ Definida" : "❌ Não definida")
}

// Verificar se as URLs são válidas
if (supabaseUrl && !supabaseUrl.includes(".supabase.co")) {
  console.error("❌ URL do Supabase parece incorreta:", supabaseUrl)
}

// INSTÂNCIA ÚNICA DO SUPABASE COM CONFIGURAÇÕES MELHORADAS
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      "X-Client-Info": "supabase-js-web",
    },
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

// FUNÇÃO PARA TESTAR CONEXÃO
export const testConnection = async () => {
  try {
    console.log("🔍 Testando conexão com Supabase...")
    console.log("URL:", supabaseUrl)
    console.log("Key (primeiros 20 chars):", supabaseKey?.substring(0, 20) + "...")

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
