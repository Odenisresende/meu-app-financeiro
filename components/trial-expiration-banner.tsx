"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Clock, AlertTriangle } from "lucide-react"

interface TrialExpirationBannerProps {
  user: any
  onOpenPremium: () => void
}

export default function TrialExpirationBanner({ user, onOpenPremium }: TrialExpirationBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isVisible || !user) {
    return null
  }

  // Calcular dias restantes do trial (7 dias a partir da criação da conta)
  const trialStartDate = new Date(user.created_at)
  const trialEndDate = new Date(trialStartDate.getTime() + 7 * 24 * 60 * 60 * 1000)
  const now = new Date()
  const timeLeft = trialEndDate.getTime() - now.getTime()
  const trialDaysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24))

  // Só mostrar quando restam 4 dias ou menos
  if (trialDaysLeft > 4 || trialDaysLeft < 0) {
    return null
  }

  // Determinar cor e ícone baseado nos dias restantes
  let bgColor = "bg-yellow-500"
  let textColor = "text-yellow-900"
  let icon = <Clock className="h-4 w-4" />
  let message = `Trial expira em ${trialDaysLeft} dias`

  if (trialDaysLeft <= 2) {
    bgColor = "bg-orange-500"
    textColor = "text-orange-900"
    icon = <AlertTriangle className="h-4 w-4" />
  }

  if (trialDaysLeft <= 0) {
    bgColor = "bg-red-500"
    textColor = "text-red-900"
    icon = <AlertTriangle className="h-4 w-4" />
    message = "Seu trial expirou!"
  }

  return (
    <div className={`${bgColor} ${textColor} px-4 py-3 relative`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3 flex-1">
          {icon}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="font-medium text-sm sm:text-base">{message}</span>
            <span className="text-xs sm:text-sm opacity-90">
              Assine Premium para continuar usando todas as funcionalidades
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onOpenPremium}
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-current border-0 font-medium"
          >
            Assinar Premium
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-current hover:bg-white/20 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
