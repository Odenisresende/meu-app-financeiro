"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Crown, X } from "lucide-react"

interface TrialBannerProps {
  daysLeft: number
  showUpgrade: boolean
  onUpgrade: () => void
}

export default function TrialBanner({ daysLeft, showUpgrade, onUpgrade }: TrialBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!showUpgrade || !isVisible || daysLeft <= 0) return null

  const getMessage = () => {
    if (daysLeft === 1) {
      return "Último dia do seu trial gratuito. Upgrade Premium para continuar"
    }
    return `Faltam ${daysLeft} dias para finalizar seu trial. Upgrade Premium`
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <Crown className="h-5 w-5 flex-shrink-0" />
        <span className="text-sm font-medium">{getMessage()}</span>
      </div>
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          onClick={onUpgrade}
          className="bg-white text-orange-600 hover:bg-gray-100 font-medium px-4 py-2 h-8"
        >
          Upgrade Premium
        </Button>
        <button onClick={() => setIsVisible(false)} className="text-white hover:text-gray-200 p-1" title="Fechar">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
