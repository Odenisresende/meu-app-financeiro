"use client"

import { Crown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"

interface TrialBannerProps {
  daysLeft: number
  showUpgrade: boolean
  onUpgrade: () => void
}

export default function TrialBanner({ daysLeft, showUpgrade, onUpgrade }: TrialBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!showUpgrade || !isVisible || daysLeft <= 0) {
    return null
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="h-6 w-6 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-900">
                {daysLeft > 1 ? `${daysLeft} dias restantes` : "Último dia"} do seu trial!
              </h3>
              <p className="text-sm text-yellow-700">
                Faça upgrade para Premium e continue aproveitando todos os recursos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={onUpgrade}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold"
              size="sm"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Premium
            </Button>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="text-yellow-600 hover:text-yellow-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
