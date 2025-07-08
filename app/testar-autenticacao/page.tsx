"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, User, Mail, Lock, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function TestarAutenticacao() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    email: "teste@exemplo.com",
    password: "123456",
  })

  const addResult = (test: string, status: "success" | "error" | "info", message: string, data?: any) => {
    setTestResults((prev) => [...prev, { test, status, message, data, timestamp: new Date().toLocaleTimeString() }])
  }

  const testSupabaseConnection = async () => {
    addResult("Conexão", "info", "Testando conexão com Supabase...")

    try {
      const { data, error } = await supabase.from("user_subscriptions").select("count").limit(1)

      if (error) {
        addResult("Conexão", "error", `Erro na conexão: ${error.message}`)
        return false
      }

      addResult("Conexão", "success", "✅ Conexão com Supabase funcionando!")
      return true
    } catch (error: any) {
      addResult("Conexão", "error", `Erro crítico: ${error.message}`)
      return false
    }
  }

  const testUserRegistration = async () => {
    addResult("Cadastro", "info", "Testando cadastro de usuário...")

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        if (error.message.includes("already registered")) {
          addResult("Cadastro", "info", "✅ Email já cadastrado (isso é normal)")
          return true
        }
        addResult("Cadastro", "error", `Erro no cadastro: ${error.message}`)
        return false
      }

      addResult("Cadastro", "success", "✅ Cadastro realizado com sucesso!")
      return true
    } catch (error: any) {
      addResult("Cadastro", "error", `Erro no cadastro: ${error.message}`)
      return false
    }
  }

  const testUserLogin = async () => {
    addResult("Login", "info", "Testando login de usuário...")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        addResult("Login", "error", `Erro no login: ${error.message}`)
        return false
      }

      if (data.user) {
        setUser(data.user)
        addResult("Login", "success", `✅ Login realizado! Usuário: ${data.user.email}`)
        return true
      }

      addResult("Login", "error", "Login não retornou usuário")
      return false
    } catch (error: any) {
      addResult("Login", "error", `Erro no login: ${error.message}`)
      return false
    }
  }

  const testUserLogout = async () => {
    addResult("Logout", "info", "Testando logout...")

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        addResult("Logout", "error", `Erro no logout: ${error.message}`)
        return false
      }

      setUser(null)
      addResult("Logout", "success", "✅ Logout realizado com sucesso!")
      return true
    } catch (error: any) {
      addResult("Logout", "error", `Erro no logout: ${error.message}`)
      return false
    }
  }

  const runAllTests = async () => {
    setLoading(true)
    setTestResults([])

    const connectionOk = await testSupabaseConnection()
    if (!connectionOk) {
      setLoading(false)
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
    await testUserRegistration()

    await new Promise((resolve) => setTimeout(resolve, 1000))
    const loginOk = await testUserLogin()

    if (loginOk) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await testUserLogout()
    }

    setLoading(false)
  }

  const checkCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
  }

  useEffect(() => {
    checkCurrentUser()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-6 w-6 text-green-500" />
              Passo 3: Testar Sistema de Autenticação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertDescription>
                Este teste verificará se o Supabase está configurado corretamente e se o sistema de autenticação
                funciona.
              </AlertDescription>
            </Alert>

            {user && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Usuário logado:</strong> {user.email} (ID: {user.id})
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dados de Teste</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email de Teste</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-10"
                        placeholder="teste@exemplo.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password">Senha de Teste</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-10"
                        placeholder="123456"
                      />
                    </div>
                  </div>

                  <Button onClick={runAllTests} disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Executando Testes...
                      </>
                    ) : (
                      "🧪 Executar Todos os Testes"
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Testes Individuais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={testSupabaseConnection}
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    1. Testar Conexão
                  </Button>
                  <Button
                    onClick={testUserRegistration}
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    2. Testar Cadastro
                  </Button>
                  <Button onClick={testUserLogin} variant="outline" className="w-full justify-start bg-transparent">
                    3. Testar Login
                  </Button>
                  <Button onClick={testUserLogout} variant="outline" className="w-full justify-start bg-transparent">
                    4. Testar Logout
                  </Button>
                </CardContent>
              </Card>
            </div>

            {testResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>📊 Resultados dos Testes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {testResults.map((result, index) => (
                      <div key={index} className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.status)}
                            <span className="font-medium">{result.test}</span>
                          </div>
                          <span className="text-xs text-gray-500">{result.timestamp}</span>
                        </div>
                        <p className="text-sm">{result.message}</p>
                        {result.data && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs text-blue-600">Ver detalhes</summary>
                            <pre className="mt-1 text-xs bg-white p-2 rounded overflow-x-auto">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Button onClick={() => (window.location.href = "/testar-pagamentos")} className="flex-1">
                ➡️ Próximo: Testar Pagamentos
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/configurar-variaveis")}
                className="flex-1"
              >
                ⬅️ Voltar: Variáveis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
