"use client"

import { useEffect, useState } from "react"

interface AutoTrialManagerProps {
  user: any
  onTrialStatusChange: (status: any) => void
}

export default function AutoTrialManager({ user, onTrialStatusChange }: AutoTrialManagerProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!user?.id) return

    const checkAndCreateTrial = async () => {
      if (isProcessing) return

      setIsProcessing(true)

      try {
        console.log("🔍 Verificando status do trial para usuário:", user.id)

        // Verificar se já tem assinatura
        const checkResponse = await fetch(`/api/check-subscription?userId=${user.id}`)
        const checkData = await checkResponse.json()

        console.log("📊 Status atual:", checkData)

        if (checkData.success && !checkData.isActive) {
          console.log("🎯 Usuário sem trial ativo, criando trial automático...")

          // Criar trial automático
          const trialResponse = await fetch("/api/start-trial", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.id,
              forceNew: false,
            }),
          })

          const trialData = await trialResponse.json()
          console.log("🎉 Resultado do trial:", trialData)

          if (trialData.success) {
            onTrialStatusChange({
              isPremium: false,
              isInTrial: true,
              daysLeft: trialData.trialDaysLeft || 7,
              showUpgrade: false,
            })
          }
        } else if (checkData.success && checkData.isActive) {
          // Usuário já tem assinatura ativa
          const subscription = checkData.subscription
          const now = new Date()
          const expiresAt = subscription?.expires_at ? new Date(subscription.expires_at) : null

          let daysLeft = 0
          if (expiresAt) {
            const diffTime = expiresAt.getTime() - now.getTime()
            daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          }

          const isPremium = subscription?.plan_type === "premium"
          const isInTrial = subscription?.plan_type === "trial" || subscription?.status === "trial"

          onTrialStatusChange({
            isPremium,
            isInTrial,
            daysLeft: Math.max(0, daysLeft),
            showUpgrade: daysLeft <= 3 && !isPremium,
          })
        }
      } catch (error) {
        console.error("❌ Erro no AutoTrialManager:", error)

        // Em caso de erro, assumir que não tem trial
        onTrialStatusChange({
          isPremium: false,
          isInTrial: false,
          daysLeft: 0,
          showUpgrade: true,
        })
      } finally {
        setIsProcessing(false)
      }
    }

    // Executar verificação inicial
    checkAndCreateTrial()

    // Verificar a cada 5 minutos
    const interval = setInterval(checkAndCreateTrial, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [user?.id, onTrialStatusChange, isProcessing])

  return null // Componente invisível
}
