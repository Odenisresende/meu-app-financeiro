"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Check, Crown, X } from "lucide-react"
import { useAuth } from "@/components/auth-wrapper"

export function SubscriptionModal() {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()

  const handleSubscribe = async () => {
    if (!user) {
      alert("Você precisa estar logado para assinar")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (data.success && data.checkout_url) {
        // Redirecionar para o checkout do Mercado Pago
        window.location.href = data.checkout_url
      } else {
        alert("Erro ao criar pagamento: " + (data.error || "Erro desconhecido"))
      }
    } catch (error) {
      console.error("Erro:", error)
      alert("Erro ao processar pagamento")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
          <Crown className="w-4 h-4 mr-2" />
          Assinar Premium
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Plano Premium
          </DialogTitle>
          <DialogDescription>Desbloqueie todos os recursos do seu controle financeiro</DialogDescription>
        </DialogHeader>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">R$ 29,90</CardTitle>
            <CardDescription>por mês</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">Transações ilimitadas</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">Relatórios avançados</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">Categorização automática</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">Backup automático</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">Suporte prioritário</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isLoading ? "Processando..." : "Assinar Agora"}
              </Button>
              <Button variant="outline" onClick={() => setIsOpen(false)} className="px-3">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
