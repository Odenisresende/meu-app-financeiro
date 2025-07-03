"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import TrialExpirationBanner from "@/components/trial-expiration-banner"
import PremiumOverlay from "@/components/premium-overlay"

export default function BannerDemo() {
  const [scenario, setScenario] = useState(4) // Começar com 4 dias
  const [showPremium, setShowPremium] = useState(false)

  const mockUser = {
    id: "demo-user",
    email: "demo@example.com",
    user_metadata: { full_name: "Demo User" },
  }

  const scenarios = [
    { days: 7, label: "Início do Trial (7 dias)" },
    { days: 4, label: "Meio do Trial (4 dias)" },
    { days: 1, label: "Último Dia (1 dia)" },
    { days: 0, label: "Trial Expirado" },
  ]

  const handleUpgrade = () => {
    setShowPremium(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">🎭 Demonstração do Banner de Trial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Controles */}
            <div className="flex flex-wrap gap-2 justify-center">
              {scenarios.map((s, index) => (
                <Button
                  key={index}
                  variant={scenario === s.days ? "default" : "outline"}
                  size="sm"
                  onClick={() => setScenario(s.days)}
                >
                  {s.label}
                </Button>
              ))}
            </div>

            {/* Simulação do Header */}
            <div className="border rounded-lg bg-white">
              <div className="p-4 border-b bg-gray-100">
                <h3 className="font-medium text-center">📱 Simulação do Cabeçalho do App</h3>
              </div>
              <div className="p-4">
                <TrialExpirationBanner user={mockUser} trialDaysLeft={scenario} onUpgrade={handleUpgrade} />
                <div className="text-center text-gray-500 text-sm mt-4">
                  {scenario > 0
                    ? `Banner aparece durante todo o trial (${scenario} dias restantes)`
                    : "Banner de trial expirado"}
                </div>
              </div>
            </div>

            {/* Explicação */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">📋 Como funciona:</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>
                  • <strong>7-5 dias:</strong> Banner verde - "Trial ativo, assine Premium"
                </li>
                <li>
                  • <strong>4-3 dias:</strong> Banner amarelo - "Trial expira em X dias"
                </li>
                <li>
                  • <strong>2-1 dias:</strong> Banner laranja - Urgência moderada
                </li>
                <li>
                  • <strong>Expirado:</strong> Banner vermelho - "Trial expirou"
                </li>
                <li>
                  • <strong>Botão sempre presente:</strong> Usuário pode assinar a qualquer momento
                </li>
                <li>
                  • <strong>Responsivo:</strong> Adapta para mobile automaticamente
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Modal Premium */}
        {showPremium && <PremiumOverlay user={mockUser} onClose={() => setShowPremium(false)} />}
      </div>
    </div>
  )
}
