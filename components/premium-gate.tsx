"use client"

import type React from "react"

interface PremiumGateProps {
  user: any
  children: React.ReactNode
  feature: string
}

export default function PremiumGate({ user, children, feature }: PremiumGateProps) {
  // ✅ SEMPRE LIBERAR TUDO DURANTE O TRIAL
  // Sem bloqueios, sem verificações complexas
  return <>{children}</>
}
