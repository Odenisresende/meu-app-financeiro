"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface AutoTrialManagerProps {
  user: any
  onTrialStatusChange: (status: {
    isInTrial: boolean
    daysLeft: number
    isPremium: boolean
    showUpgrade: boolean
  }) => void
}

export default function AutoTrialManager({ user, onTrialStatusChange }: AutoTrialManagerProps) {
  const [trialStatus, setTrialStatus] = useState<any>(null)

  useEffect(() => {
    if (!user?.id) return

    const checkTrialStatus = async () => {
      try {
        // Buscar dados do usuário e assinatura
        const { data: profile } = await supabase.from("profiles").select("created_at").eq("id", user.id).single()

        const { data: subscription } = await supabase
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single()

        // Se tem assinatura ativa, é premium
        if (subscription && subscription.status === "active") {
          const status = {
            isInTrial: false,
            daysLeft: 0,
            isPremium: true,
            showUpgrade: false,
          }
          setTrialStatus(status)
          onTrialStatusChange(status)
          return
        }

        // Calcular dias desde o cadastro
        const createdAt = profile?.created_at || user.created_at
        const signupDate = new Date(createdAt)
        const now = new Date()
        const daysSinceSignup = Math.floor((now.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24))

        const trialDaysLeft = Math.max(0, 7 - daysSinceSignup)
        const isInTrial = trialDaysLeft > 0
        const showUpgrade = isInTrial && trialDaysLeft <= 4 // Dias 4, 3, 2, 1

        console.log(`📊 Trial Status:
        - Cadastro: ${signupDate.toLocaleDateString("pt-BR")}
        - Dias desde cadastro: ${daysSinceSignup}
        - Dias restantes: ${trialDaysLeft}
        - Em trial: ${isInTrial}
        - Mostrar upgrade: ${showUpgrade}`)

        const status = {
          isInTrial,
          daysLeft: trialDaysLeft,
          isPremium: isInTrial, // Durante trial tem acesso premium
          showUpgrade,
        }

        setTrialStatus(status)
        onTrialStatusChange(status)
      } catch (error) {
        console.error("Erro ao verificar trial:", error)
        // Em caso de erro, liberar acesso (modo desenvolvimento)
        const fallbackStatus = {
          isInTrial: true,
          daysLeft: 7,
          isPremium: true,
          showUpgrade: false,
        }
        setTrialStatus(fallbackStatus)
        onTrialStatusChange(fallbackStatus)
      }
    }

    checkTrialStatus()

    // Verificar status a cada hora
    const interval = setInterval(checkTrialStatus, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [user?.id, onTrialStatusChange])

  return null
}
