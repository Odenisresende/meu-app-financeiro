"use client"

import { useEffect } from "react"

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
  useEffect(() => {
    if (!user?.id) return

    // LÓGICA SUPER SIMPLES:
    // - Sempre 7 dias de trial
    // - Todas as funcionalidades liberadas
    // - Mostrar upgrade a partir do dia 4

    const trialDaysLeft = 7 // Fixo por enquanto
    const showUpgrade = trialDaysLeft <= 4 // Mostrar upgrade nos últimos 4 dias

    console.log(`🚀 Trial ativo: ${trialDaysLeft} dias restantes`)

    onTrialStatusChange({
      isInTrial: true,
      daysLeft: trialDaysLeft,
      isPremium: true, // ✅ TODAS as funcionalidades liberadas durante trial
      showUpgrade: showUpgrade,
    })
  }, [user?.id, onTrialStatusChange])

  return null
}
