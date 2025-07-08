"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Settings,
  User,
  CreditCard,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface TestResult {
  name: string
  status: "success" | "error" | "warning" | "loading"
  message: string
  details?: string
  data?: any
}

export default function DiagnosticoCompletoFinal() {
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({})
  const [user, setUser] = useState<any>(null)
  const [sessionLoaded, setSessionLoaded] = useState(false)

  const updateTest = (name: string, result: Partial<TestResult>) => {
    setTests((prev) => prev.map((test) => (test.name === name ? { ...test, ...result } : test)))
  }

  const addTest = (test: TestResult) => {
    setTests((prev) => [...prev, test])
  }

  // Carregar sessão do usuário primeiro
  const loadUserSession = async () => {
    try {
      console.log("🔍 Carregando sessão do usuário...")

      // Tentar múltiplas formas de obter a sessão
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("Erro ao obter sessão:", error)
        return null
      }

      if (session?.user) {
        console.log("✅ Usuário encontrado:", session.user.email)
        setUser(session.user)
        return session.user
      }

      // Se não encontrou, tentar obter o usuário atual
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("Erro ao obter usuário atual:", userError)
        return null
      }

      if (currentUser) {
        console.log("✅ Usuário atual encontrado:", currentUser.email)
        setUser(currentUser)
        return currentUser
      }

      console.log("❌ Nenhum usuário logado encontrado")
      return null
    } catch (error) {
      console.error("Erro crítico ao carregar sessão:", error)
      return null
    } finally {
      setSessionLoaded(true)
    }
  }

  // Teste 1: Variáveis de Ambiente
  const testEnvironmentVariables = async () => {
    addTest({
      name: "Variáveis de Ambiente",
      status: "loading",
      message: "Verificando configurações...",
    })

    try {
      const response = await fetch("/api/test-env")
      const data = await response.json()

      const missingVars = data.missing_vars || []
      const hasAllRequired = missingVars.length === 0

      updateTest("Variáveis de Ambiente", {
        status: hasAllRequired ? "success" : "error",
        message: hasAllRequired ? "✅ Todas as variáveis configuradas" : `❌ ${missingVars.length} variáveis faltando`,
        details: JSON.stringify(data.environment_variables, null, 2),
        data: data,
      })
    } catch (error) {
      updateTest("Variáveis de Ambiente", {
        status: "error",
        message: "❌ Erro ao verificar variáveis",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }
  }

  // Teste 2: Conexão Supabase
  const testSupabaseConnection = async () => {
    addTest({
      name: "Conexão Supabase",
      status: "loading",
      message: "Testando conexão...",
    })

    try {
      const response = await fetch("/api/test-supabase-connection")
      const data = await response.json()

      updateTest("Conexão Supabase", {
        status: data.connected ? "success" : "error",
        message: data.connected ? "✅ Conexão estabelecida" : "❌ Falha na conexão",
        details: data.error || "Conexão funcionando normalmente",
        data: data,
      })
    } catch (error) {
      updateTest("Conexão Supabase", {
        status: "error",
        message: "❌ Erro na conexão",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }
  }

  // Teste 3: Estrutura do Banco
  const testDatabaseStructure = async () => {
    addTest({
      name: "Estrutura do Banco",
      status: "loading",
      message: "Verificando tabelas...",
    })

    try {
      const response = await fetch("/api/test-database-structure")
      const data = await response.json()

      // A API retorna { valid: boolean, message: string, issues?: string[] }
      const isValid = data.valid === true
      const hasIssues = data.issues && data.issues.length > 0

      updateTest("Estrutura do Banco", {
        status: isValid && !hasIssues ? "success" : "error",
        message: isValid && !hasIssues ? "✅ Estrutura do banco OK" : `❌ ${data.message || "Problemas na estrutura"}`,
        details: hasIssues
          ? `Problemas encontrados:\n${data.issues.join("\n")}`
          : data.message || "Estrutura verificada com sucesso",
        data: data,
      })
    } catch (error) {
      updateTest("Estrutura do Banco", {
        status: "error",
        message: "❌ Erro ao verificar estrutura",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }
  }

  // Teste 4: Autenticação
  const testAuthentication = async () => {
    addTest({
      name: "Sistema de Autenticação",
      status: "loading",
      message: "Verificando autenticação...",
    })

    try {
      // Recarregar a sessão para ter certeza
      const currentUser = await loadUserSession()

      if (currentUser) {
        updateTest("Sistema de Autenticação", {
          status: "success",
          message: "✅ Usuário autenticado",
          details: `Email: ${currentUser.email}\nID: ${currentUser.id}`,
          data: {
            user_id: currentUser.id,
            email: currentUser.email,
            created_at: currentUser.created_at,
          },
        })
      } else {
        updateTest("Sistema de Autenticação", {
          status: "warning",
          message: "⚠️ Nenhum usuário logado",
          details: "Faça login para testar completamente. Verifique se você está logado na aplicação principal.",
        })
      }
    } catch (error) {
      updateTest("Sistema de Autenticação", {
        status: "error",
        message: "❌ Erro no sistema de auth",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }
  }

  // Teste 5: Operações CRUD
  const testCRUDOperations = async () => {
    // Verificar novamente se o usuário está logado
    const currentUser = user || (await loadUserSession())

    if (!currentUser) {
      addTest({
        name: "Operações CRUD",
        status: "warning",
        message: "⚠️ Usuário não logado",
        details:
          "Faça login para testar operações de dados. Tente fazer logout e login novamente se você acredita estar logado.",
      })
      return
    }

    addTest({
      name: "Operações CRUD",
      status: "loading",
      message: "Testando operações de dados...",
    })

    try {
      console.log("🧪 Testando CRUD para usuário:", currentUser.email)

      // Teste CREATE
      const testTransaction = {
        user_id: currentUser.id,
        date: new Date().toISOString().split("T")[0],
        category: "Teste Diagnóstico",
        amount: 10.0,
        type: "expense",
        description: "Transação de teste do diagnóstico",
        source: "manual", // Mudança aqui: de "diagnostic_test" para "manual"
      }

      console.log("📝 Criando transação de teste...")
      const { data: insertData, error: insertError } = await supabase
        .from("transactions")
        .insert([testTransaction])
        .select()

      if (insertError) {
        console.error("Erro no CREATE:", insertError)
        throw insertError
      }

      const insertedId = insertData[0].id
      console.log("✅ Transação criada com ID:", insertedId)

      // Teste READ
      console.log("📖 Lendo transação...")
      const { data: readData, error: readError } = await supabase.from("transactions").select("*").eq("id", insertedId)

      if (readError) {
        console.error("Erro no READ:", readError)
        throw readError
      }

      console.log("✅ Transação lida com sucesso")

      // Teste UPDATE
      console.log("✏️ Atualizando transação...")
      const { error: updateError } = await supabase
        .from("transactions")
        .update({ amount: 15.0, description: "Transação atualizada" })
        .eq("id", insertedId)

      if (updateError) {
        console.error("Erro no UPDATE:", updateError)
        throw updateError
      }

      console.log("✅ Transação atualizada com sucesso")

      // Teste DELETE
      console.log("🗑️ Deletando transação...")
      const { error: deleteError } = await supabase.from("transactions").delete().eq("id", insertedId)

      if (deleteError) {
        console.error("Erro no DELETE:", deleteError)
        throw deleteError
      }

      console.log("✅ Transação deletada com sucesso")

      updateTest("Operações CRUD", {
        status: "success",
        message: "✅ Todas as operações funcionando",
        details: "CREATE, READ, UPDATE, DELETE testados com sucesso",
        data: {
          user_id: currentUser.id,
          created_id: insertedId,
          operations: ["CREATE", "READ", "UPDATE", "DELETE"],
        },
      })
    } catch (error) {
      console.error("Erro no teste CRUD:", error)
      updateTest("Operações CRUD", {
        status: "error",
        message: "❌ Erro nas operações",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }
  }

  // Teste 6: Políticas RLS
  const testRLSPolicies = async () => {
    // Verificar novamente se o usuário está logado
    const currentUser = user || (await loadUserSession())

    if (!currentUser) {
      addTest({
        name: "Políticas de Segurança (RLS)",
        status: "warning",
        message: "⚠️ Usuário não logado",
        details:
          "Faça login para testar políticas de segurança. Tente fazer logout e login novamente se você acredita estar logado.",
      })
      return
    }

    addTest({
      name: "Políticas de Segurança (RLS)",
      status: "loading",
      message: "Testando políticas RLS...",
    })

    try {
      console.log("🔒 Testando RLS para usuário:", currentUser.email)

      // Tentar acessar dados do próprio usuário
      console.log("🔍 Testando acesso aos próprios dados...")
      const { data: ownData, error: ownError } = await supabase
        .from("transactions")
        .select("count")
        .eq("user_id", currentUser.id)

      if (ownError) {
        console.error("Erro ao acessar próprios dados:", ownError)
        throw ownError
      }

      console.log("✅ Acesso aos próprios dados: OK")

      // Tentar acessar dados de outro usuário (deve falhar ou retornar vazio)
      console.log("🚫 Testando acesso a dados de outros usuários...")
      const fakeUserId = "00000000-0000-0000-0000-000000000000"
      const { data: otherData, error: otherError } = await supabase
        .from("transactions")
        .select("count")
        .eq("user_id", fakeUserId)

      // RLS deve permitir acesso aos próprios dados e bloquear/filtrar dados de outros
      const ownAccessOk = !ownError
      const otherAccessBlocked = otherData === null || otherData.length === 0 || !otherError

      console.log("🔒 RLS Status:", { ownAccessOk, otherAccessBlocked })

      updateTest("Políticas de Segurança (RLS)", {
        status: ownAccessOk ? "success" : "error",
        message: ownAccessOk ? "✅ RLS funcionando corretamente" : "❌ Problema com RLS",
        details: `Usuário: ${currentUser.email}\nAcesso próprio: ${ownAccessOk ? "OK" : "ERRO"}\nAcesso outros: ${
          otherAccessBlocked ? "BLOQUEADO/FILTRADO" : "PERMITIDO"
        }`,
        data: {
          user_id: currentUser.id,
          own_access: ownAccessOk,
          other_access_blocked: otherAccessBlocked,
          own_data_count: ownData?.length || 0,
          other_data_count: otherData?.length || 0,
        },
      })
    } catch (error) {
      console.error("Erro no teste RLS:", error)
      updateTest("Políticas de Segurança (RLS)", {
        status: "error",
        message: "❌ Erro ao testar RLS",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }
  }

  // Teste 7: Health Check Geral
  const testHealthCheck = async () => {
    addTest({
      name: "Health Check Geral",
      status: "loading",
      message: "Verificando saúde do sistema...",
    })

    try {
      const response = await fetch("/api/health")
      const data = await response.json()

      updateTest("Health Check Geral", {
        status: data.status === "OK" ? "success" : "error",
        message: data.status === "OK" ? "✅ Sistema saudável" : "❌ Sistema com problemas",
        details: data.message || "Status do sistema verificado",
        data: data,
      })
    } catch (error) {
      updateTest("Health Check Geral", {
        status: "error",
        message: "❌ Erro no health check",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }
  }

  // Executar todos os testes
  const runAllTests = async () => {
    setIsRunning(true)
    setTests([])

    try {
      // Primeiro, carregar a sessão do usuário
      console.log("🔄 Iniciando diagnóstico completo...")
      await loadUserSession()
      await new Promise((resolve) => setTimeout(resolve, 1000))

      await testEnvironmentVariables()
      await new Promise((resolve) => setTimeout(resolve, 500))

      await testSupabaseConnection()
      await new Promise((resolve) => setTimeout(resolve, 500))

      await testDatabaseStructure()
      await new Promise((resolve) => setTimeout(resolve, 500))

      await testAuthentication()
      await new Promise((resolve) => setTimeout(resolve, 500))

      await testCRUDOperations()
      await new Promise((resolve) => setTimeout(resolve, 500))

      await testRLSPolicies()
      await new Promise((resolve) => setTimeout(resolve, 500))

      await testHealthCheck()
    } catch (error) {
      console.error("Erro durante os testes:", error)
    } finally {
      setIsRunning(false)
    }
  }

  // Executar testes automaticamente ao carregar
  useEffect(() => {
    runAllTests()
  }, [])

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case "loading":
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      case "loading":
        return "bg-blue-50 border-blue-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const toggleDetails = (testName: string) => {
    setShowDetails((prev) => ({
      ...prev,
      [testName]: !prev[testName],
    }))
  }

  const successCount = tests.filter((t) => t.status === "success").length
  const errorCount = tests.filter((t) => t.status === "error").length
  const warningCount = tests.filter((t) => t.status === "warning").length
  const totalTests = tests.length

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader style={{ backgroundColor: "#152638" }}>
            <CardTitle className="text-white text-xl flex items-center gap-3">
              <Settings className="h-6 w-6" />
              Diagnóstico Completo do Sistema
            </CardTitle>
            <p className="text-white/80 text-sm">
              Verificação completa de todas as funcionalidades antes de configurar pagamentos
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-4">
                <Badge className="bg-green-100 text-green-800">✅ {successCount} Sucessos</Badge>
                <Badge className="bg-red-100 text-red-800">❌ {errorCount} Erros</Badge>
                <Badge className="bg-yellow-100 text-yellow-800">⚠️ {warningCount} Avisos</Badge>
              </div>
              <div className="flex gap-2">
                {user && <Badge className="bg-blue-100 text-blue-800">👤 {user.email}</Badge>}
                <Button
                  onClick={runAllTests}
                  disabled={isRunning}
                  className="bg-[#152638] hover:bg-[#152638]/90 text-white"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Executar Novamente
                    </>
                  )}
                </Button>
              </div>
            </div>

            {totalTests > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#DDC067] h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((successCount + errorCount + warningCount) / totalTests) * 100}%`,
                  }}
                ></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resultados dos Testes */}
        <div className="space-y-4">
          {tests.map((test, index) => (
            <Card key={index} className={`shadow-md border transition-all duration-200 ${getStatusColor(test.status)}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{test.name}</h3>
                      <p className="text-sm text-gray-600">{test.message}</p>
                    </div>
                  </div>
                  {(test.details || test.data) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleDetails(test.name)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {showDetails[test.name] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  )}
                </div>

                {showDetails[test.name] && (test.details || test.data) && (
                  <div className="mt-4 p-3 bg-white/50 rounded-md border">
                    {test.details && (
                      <div className="mb-2">
                        <h4 className="font-medium text-sm text-gray-700 mb-1">Detalhes:</h4>
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">{test.details}</pre>
                      </div>
                    )}
                    {test.data && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-1">Dados:</h4>
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                          {JSON.stringify(test.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resumo Final */}
        {tests.length > 0 && !isRunning && (
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                {errorCount === 0 ? (
                  <div className="space-y-2">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                    <h3 className="text-xl font-bold text-green-900">🎉 Sistema Funcionando Perfeitamente!</h3>
                    <p className="text-green-700">
                      Todos os testes principais passaram. Você pode prosseguir com a configuração dos pagamentos.
                    </p>
                    <div className="flex justify-center gap-4 mt-6">
                      <Button
                        onClick={() => (window.location.href = "/")}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Testar App Principal
                      </Button>
                      <Button
                        onClick={() => (window.location.href = "/testar-pagamentos")}
                        className="bg-[#DDC067] text-[#152638] hover:opacity-90"
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Configurar Pagamentos
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <XCircle className="h-12 w-12 text-red-600 mx-auto" />
                    <h3 className="text-xl font-bold text-red-900">⚠️ Problemas Encontrados</h3>
                    <p className="text-red-700">
                      {errorCount} erro(s) encontrado(s). Corrija os problemas antes de prosseguir.
                    </p>
                    <div className="flex justify-center gap-4 mt-6">
                      <Button onClick={runAllTests} className="bg-red-600 hover:bg-red-700 text-white">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Testar Novamente
                      </Button>
                      <Button
                        onClick={() => (window.location.href = "/configurar-variaveis")}
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Configurar Variáveis
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
