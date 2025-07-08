"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef } from "react"
import { Loader2, Mail, Lock, UserIcon, Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    let isMounted = true

    const setupAuth = async () => {
      try {
        // Verificar sessão inicial
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Erro ao obter sessão:", error)
        }

        if (isMounted) {
          setUser(session?.user ?? null)
          setLoading(false)
        }

        // Configurar listener apenas uma vez
        if (!subscriptionRef.current) {
          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
            if (!isMounted) return

            console.log("🔐 Auth state changed:", event)

            switch (event) {
              case "SIGNED_IN":
              case "TOKEN_REFRESHED":
              case "USER_UPDATED":
                if (session) {
                  setUser(session.user)
                }
                break
              case "SIGNED_OUT":
                setUser(null)
                break
            }

            setLoading(false)
          })

          subscriptionRef.current = subscription
        }
      } catch (error) {
        console.error("Erro na configuração da auth:", error)
        if (isMounted) {
          setUser(null)
          setLoading(false)
        }
      }
    }

    setupAuth()

    return () => {
      isMounted = false
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      return result
    } catch (error) {
      console.error("Erro no login:", error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
      })

      return result
    } catch (error) {
      console.error("Erro no cadastro:", error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { logout } = await import("@/lib/supabase")
      await logout()
      setUser(null)
    } catch (error) {
      console.error("Erro no logout:", error)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function SimpleLoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  })
  const [error, setError] = useState("")
  const [authLoading, setAuthLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setError("")

    try {
      if (isSignUp) {
        const { error } = await signUp(formData.email, formData.password)
        if (error) {
          setError(error.message)
        } else {
          setError("✅ Verifique seu email para confirmar a conta!")
        }
      } else {
        const { error } = await signIn(formData.email, formData.password)
        if (error) {
          setError(error.message)
        }
      }
    } catch (err) {
      setError("Erro inesperado. Tente novamente.")
    }

    setAuthLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <div className="text-center space-y-4 mb-6">
          <div className="flex justify-center">
            <Image
              src="/logo-seu-planejamento.png"
              alt="Seu Planejamento"
              width={120}
              height={60}
              className="h-12 w-auto sm:h-16 md:h-20 object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bem-vindo</h1>
            <p className="text-gray-600">Faça login ou crie sua conta para continuar</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex border-b">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 px-4 text-center ${
                !isSignUp ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 px-4 text-center ${
                isSignUp ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Criar Conta
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={isSignUp ? "Mínimo 6 caracteres" : "Sua senha"}
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                minLength={isSignUp ? 6 : undefined}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div
              className={`text-sm p-3 rounded-md ${
                error.includes("✅") ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
              }`}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isSignUp ? "Criando conta..." : "Entrando..."}
              </>
            ) : (
              <>{isSignUp ? "Criar Conta" : "Entrar"}</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <AuthProvider>{children}</AuthProvider>
}
