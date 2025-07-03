"use client"

import type React from "react"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://nsvxswjgpqcxizbqdhoy.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zdnhzd2pncHFjeGl6YnFkaG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDc1NzIsImV4cCI6MjA2NjcyMzU3Mn0.3H-xp0EOYtO5M4GiDWs_tenRtk3aLukpzfhyAwlu4nI"
const supabase = createClient(supabaseUrl, supabaseKey)

interface PremiumGateFullProps {
  user: any
  children: React.ReactNode
  blockType: "form" | "actions" | "features"
  title?: string
  description?: string
}

export default function PremiumGateFull({ user, children, blockType, title, description }: PremiumGateFullProps) {
  // SEMPRE PERMITIR ACESSO - SEM BLOQUEIOS DURANTE DESENVOLVIMENTO
  return <>{children}</>
}
