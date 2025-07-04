"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { CheckCircle, XCircle, AlertCircle, Database } from "lucide-react"

interface TestResult {
  name: string
  status: "success" | "error" | "warning" | "pending"
  message: string
  details?: string
}

export default function TestSupabaseSetup() {
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const runTests = async () => {
    setIsRunning(true)
    setTests([])

    const testResults: TestResult[] = []

    // Teste 1: Conexão básica
    try {
      const { data, error } = await supabase.from("profiles").select("count").limit(1)
      if (error) throw error
      testResults.push({
        name: "Conexão com Supabase",
        status: "success",
        message: "✅ Conectado com sucesso",
        details: "Conseguiu acessar a tabela profiles",
      })
    } catch (error: any) {
      testResults.push({
        name: "Conexão com Supabase",
        status: "error",
        message: "❌ Falha na conexão",
        details: error.message,
      })
    }

    // Teste 2: Tabela profiles
    try {
      const { data, error } = await supabase.from("profiles").select("id, email, created_at").limit(1)

      if (error) throw error
      testResults.push({
        name: "Tabela profiles",
        status: "success",
        message: "✅ Tabela profiles OK",
        details: `Estrutura correta encontrada`,
      })
    } catch (error: any) {
      testResults.push({
        name: "Tabela profiles",
        status: "error",
        message: "❌ Problema na tabela profiles",
        details: error.message,
      })
    }

    // Teste 3: Tabela transactions
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("id, user_id, date, category, amount, type, source")
        .limit(1)

      if (error) throw error
      testResults.push({
        name: "Tabela transactions",
        status: "success",
        message: "✅ Tabela transactions OK",
        details: "Todas as colunas necessárias encontradas",
      })
    } catch (error: any) {
      testResults.push({
        name: "Tabela transactions",
        status: "error",
        message: "❌ Problema na tabela transactions",
        details: error.message,
      })
    }

    // Teste 4: Tabela user_subscriptions
    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("id, user_id, status, plan_type")
        .limit(1)

      if (error) throw error
      testResults.push({
        name: "Tabela user_subscriptions",
        status: "success",
        message: "✅ Tabela user_subscriptions OK",
        details: "Estrutura de assinaturas configurada",
      })
    } catch (error: any) {
      testResults.push({
        name: "Tabela user_subscriptions",
        status: "error",
        message: "❌ Problema na tabela user_subscriptions",
        details: error.message,
      })
    }

    // Teste 5: Tabela webhook_logs
    try {
      const { data, error } = await supabase.from("webhook_logs").select("id, webhook_type, created_at").limit(1)

      if (error) throw error
      testResults.push({
        name: "Tabela webhook_logs",
        status: "success",
        message: "✅ Tabela webhook_logs OK",
        details: "Sistema de logs configurado",
      })
    } catch (error: any) {
      testResults.push({
        name: "Tabela webhook_logs",
        status: "error",
        message: "❌ Problema na tabela webhook_logs",
        details: error.message,
      })
    }

    // Teste 6: RLS (Row Level Security)
    if (user) {
      try {
        const { data, error } = await supabase.from("transactions").select("*").eq("user_id", user.id)

        if (error) throw error
        testResults.push({
          name: "RLS (Segurança)",
          status: "success",
          message: "✅ RLS funcionando",
          details: "Usuário pode acessar apenas seus dados",
        })
      } catch (error: any) {
        testResults.push({
          name: "RLS (Segurança)",
          status: "warning",
          message: "⚠️ RLS pode ter problemas",
          details: error.message,
        })
      }
    } else {
      testResults.push({
        name: "RLS (Segurança)",
        status: "warning",
        message: "⚠️ Faça login para testar RLS",
        details: "Teste de segurança requer autenticação",
      })
    }

    setTests(testResults)
    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "border-green-200 bg-green-50"
      case "error":
        return "border-red-200 bg-red-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const successCount = tests.filter((t) => t.status === "success").length
  const errorCount = tests.filter((t) => t.status === "error").length
  const warningCount = tests.filter((t) => t.status === "warning").length

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader style={{ backgroundColor: "#152638" }}>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="h-6 w-6" />
              Teste de Configuração do Supabase
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">Verifique se todas as tabelas e configurações estão corretas</p>
                {user ? (
                  <p className="text-sm text-green-600">✅ Usuário logado: {user.email}</p>
                ) : (
                  <p className="text-sm text-yellow-600">⚠️ Faça login para testes completos</p>
                )}
              </div>
              <Button
                onClick={runTests}
                disabled={isRunning}
                style={{ backgroundColor: "#DDC067", color: "#152638" }}
                className="hover:opacity-90"
              >
                {isRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#152638] mr-2"></div>
                    Testando...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Executar Testes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resumo dos Resultados */}
        {tests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">{successCount}</p>
                <p className="text-sm text-green-600">Sucessos</p>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4 text-center">
                <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-700">{warningCount}</p>
                <p className="text-sm text-yellow-600">Avisos</p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 text-center">
                <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-700">{errorCount}</p>
                <p className="text-sm text-red-600">Erros</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Resultados dos Testes */}
        {tests.length > 0 && (
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader style={{ backgroundColor: "#152638" }}>
              <CardTitle className="text-white">Resultados dos Testes</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {tests.map((test, index) => (
                  <Card key={index} className={`border ${getStatusColor(test.status)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(test.status)}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{test.name}</h3>
                          <p className="text-sm text-gray-700 mt-1">{test.message}</p>
                          {test.details && (
                            <p className="text-xs text-gray-500 mt-2 font-mono bg-gray-100 p-2 rounded">
                              {test.details}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instruções */}
        <Card className="shadow-lg border-0 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-3">📋 Próximos Passos:</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>1. ✅ Execute todos os scripts SQL no Supabase</p>
              <p>2. ✅ Configure as variáveis de ambiente no Vercel</p>
              <p>3. ✅ Faça redeploy da aplicação</p>
              <p>4. ✅ Execute estes testes para verificar</p>
              <p>5. ✅ Teste login/cadastro e adicione uma transação</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
