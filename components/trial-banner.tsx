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

  if (!showUpgrade || !isVisible) return null

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Crown className="h-4 w-4" />
        <span className="text-sm font-medium">
          Trial expira em {daysLeft} dias - Assine agora e continue aproveitando!
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={onUpgrade}
          className="bg-white text-orange-600 hover:bg-gray-100 h-8"
        >
          Assinar Agora
        </Button>
        <button onClick={() => setIsVisible(false)} className="text-white hover:text-gray-200">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
