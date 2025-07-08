"use client"

import type React from "react"

import { Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface PremiumGateProps {
  user: any
  feature: string
  children: React.ReactNode
}

export default function PremiumGate({ user, feature, children }: PremiumGateProps) {
  // Por enquanto, vamos permitir acesso a todos os recursos
  // Você pode implementar a lógica de verificação premium aqui
  const isPremium = true // Temporário

  if (!isPremium) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-6 text-center">
          <Crown className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">Recurso Premium</h3>
          <p className="text-yellow-800 mb-4">{feature}</p>
          <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade para Premium
          </Button>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}
