"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageCircle, Bell, BarChart3, Calendar, CheckCircle, AlertCircle, Phone, Settings } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface WhatsAppIntegrationProps {
  user: any
}

export default function WhatsAppIntegration({ user }: WhatsAppIntegrationProps) {
  const [whatsappData, setWhatsappData] = useState({
    number: "",
    optIn: false,
    preferences: {
      dailyReminders: false,
      weeklyReports: false,
      monthlyReports: true,
      budgetAlerts: true,
      reminderTime: "09:00",
      reportDay: "monday",
    },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [testMessage, setTestMessage] = useState("")

  useEffect(() => {
    loadWhatsAppSettings()
  }, [user])

  const loadWhatsAppSettings = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("whatsapp_number, whatsapp_opt_in, whatsapp_preferences")
        .eq("id", user.id)
        .single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (data) {
        setWhatsappData({
          number: data.whatsapp_number || "",
          optIn: data.whatsapp_opt_in || false,
          preferences: {
            ...whatsappData.preferences,
            ...(data.whatsapp_preferences || {}),
          },
        })
      }
    } catch (error) {
      console.error("Erro ao carregar configurações WhatsApp:", error)
      setMessage({
        type: "error",
        text: "Erro ao carregar configurações",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveWhatsAppSettings = async () => {
    if (!user?.id) return

    setIsSaving(true)
    setMessage(null)

    try {
      // Validar número de telefone
      const phoneRegex = /^\+55\d{10,11}$/
      if (whatsappData.number && !phoneRegex.test(whatsappData.number)) {
        throw new Error("Número deve estar no formato +5511999999999")
      }

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        whatsapp_number: whatsappData.number,
        whatsapp_opt_in: whatsappData.optIn,
        whatsapp_preferences: whatsappData.preferences,
      })

      if (error) throw error

      setMessage({
        type: "success",
        text: "Configurações salvas com sucesso!",
      })

      // Se o usuário fez opt-in, enviar mensagem de boas-vindas
      if (whatsappData.optIn && whatsappData.number) {
        await sendWelcomeMessage()
      }
    } catch (error: any) {
      console.error("Erro ao salvar configurações:", error)
      setMessage({
        type: "error",
        text: error.message || "Erro ao salvar configurações",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const sendWelcomeMessage = async () => {
    try {
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          phoneNumber: whatsappData.number,
          messageType: "welcome",
          message: `🎉 Bem-vindo ao Seu Planejamento!\n\nVocê agora receberá notificações e relatórios financeiros diretamente no WhatsApp.\n\n💡 Comandos disponíveis:\n/saldo - Ver saldo atual\n/gastos - Gastos do mês\n/ajuda - Lista completa\n\nPara parar as notificações, digite: PARAR`,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao enviar mensagem de boas-vindas")
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem de boas-vindas:", error)
    }
  }

  const sendTestMessage = async () => {
    if (!whatsappData.number || !testMessage.trim()) return

    try {
      setIsSaving(true)

      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          phoneNumber: whatsappData.number,
          messageType: "test",
          message: testMessage,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao enviar mensagem de teste")
      }

      setMessage({
        type: "success",
        text: "Mensagem de teste enviada!",
      })
      setTestMessage("")
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Erro ao enviar mensagem",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const formatPhoneNumber = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "")

    // Adiciona +55 se não tiver
    if (numbers.length > 0 && !value.startsWith("+55")) {
      return "+55" + numbers
    }

    return value
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DDC067]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status da Integração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Status da Integração WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant={whatsappData.optIn ? "default" : "secondary"}>
                {whatsappData.optIn ? "Ativo" : "Inativo"}
              </Badge>
              {whatsappData.number && <span className="text-sm text-gray-600">{whatsappData.number}</span>}
            </div>
            {whatsappData.optIn && <CheckCircle className="h-5 w-5 text-green-600" />}
          </div>
        </CardContent>
      </Card>

      {/* Mensagem de Feedback */}
      {message && (
        <Alert
          className={`${message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Configuração do Número */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Número do WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="whatsapp-number">Número (com código do país)</Label>
            <Input
              id="whatsapp-number"
              type="tel"
              placeholder="+5511999999999"
              value={whatsappData.number}
              onChange={(e) =>
                setWhatsappData({
                  ...whatsappData,
                  number: formatPhoneNumber(e.target.value),
                })
              }
            />
            <p className="text-xs text-gray-500 mt-1">Formato: +55 + DDD + número (ex: +5511999999999)</p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="whatsapp-opt-in"
              checked={whatsappData.optIn}
              onCheckedChange={(checked) =>
                setWhatsappData({
                  ...whatsappData,
                  optIn: checked,
                })
              }
            />
            <Label htmlFor="whatsapp-opt-in">Receber notificações no WhatsApp</Label>
          </div>

          <p className="text-sm text-gray-600">
            Ao ativar, você receberá relatórios financeiros, lembretes e alertas diretamente no WhatsApp.
          </p>
        </CardContent>
      </Card>

      {/* Preferências de Notificação */}
      {whatsappData.optIn && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Preferências de Notificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="daily-reminders"
                  checked={whatsappData.preferences.dailyReminders}
                  onCheckedChange={(checked) =>
                    setWhatsappData({
                      ...whatsappData,
                      preferences: {
                        ...whatsappData.preferences,
                        dailyReminders: checked,
                      },
                    })
                  }
                />
                <Label htmlFor="daily-reminders" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Lembretes diários
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="weekly-reports"
                  checked={whatsappData.preferences.weeklyReports}
                  onCheckedChange={(checked) =>
                    setWhatsappData({
                      ...whatsappData,
                      preferences: {
                        ...whatsappData.preferences,
                        weeklyReports: checked,
                      },
                    })
                  }
                />
                <Label htmlFor="weekly-reports" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Relatórios semanais
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="monthly-reports"
                  checked={whatsappData.preferences.monthlyReports}
                  onCheckedChange={(checked) =>
                    setWhatsappData({
                      ...whatsappData,
                      preferences: {
                        ...whatsappData.preferences,
                        monthlyReports: checked,
                      },
                    })
                  }
                />
                <Label htmlFor="monthly-reports" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Relatórios mensais
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="budget-alerts"
                  checked={whatsappData.preferences.budgetAlerts}
                  onCheckedChange={(checked) =>
                    setWhatsappData({
                      ...whatsappData,
                      preferences: {
                        ...whatsappData.preferences,
                        budgetAlerts: checked,
                      },
                    })
                  }
                />
                <Label htmlFor="budget-alerts" className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Alertas de orçamento
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reminder-time">Horário dos lembretes</Label>
                <Select
                  value={whatsappData.preferences.reminderTime}
                  onValueChange={(value) =>
                    setWhatsappData({
                      ...whatsappData,
                      preferences: {
                        ...whatsappData.preferences,
                        reminderTime: value,
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="08:00">08:00</SelectItem>
                    <SelectItem value="09:00">09:00</SelectItem>
                    <SelectItem value="10:00">10:00</SelectItem>
                    <SelectItem value="18:00">18:00</SelectItem>
                    <SelectItem value="19:00">19:00</SelectItem>
                    <SelectItem value="20:00">20:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="report-day">Dia dos relatórios semanais</Label>
                <Select
                  value={whatsappData.preferences.reportDay}
                  onValueChange={(value) =>
                    setWhatsappData({
                      ...whatsappData,
                      preferences: {
                        ...whatsappData.preferences,
                        reportDay: value,
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Segunda-feira</SelectItem>
                    <SelectItem value="tuesday">Terça-feira</SelectItem>
                    <SelectItem value="wednesday">Quarta-feira</SelectItem>
                    <SelectItem value="thursday">Quinta-feira</SelectItem>
                    <SelectItem value="friday">Sexta-feira</SelectItem>
                    <SelectItem value="saturday">Sábado</SelectItem>
                    <SelectItem value="sunday">Domingo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teste de Mensagem */}
      {whatsappData.optIn && whatsappData.number && (
        <Card>
          <CardHeader>
            <CardTitle>Testar Integração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="test-message">Mensagem de teste</Label>
              <Input
                id="test-message"
                placeholder="Digite uma mensagem para testar..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
              />
            </div>
            <Button onClick={sendTestMessage} disabled={!testMessage.trim() || isSaving} variant="outline">
              {isSaving ? "Enviando..." : "Enviar Teste"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button
          onClick={saveWhatsAppSettings}
          disabled={isSaving}
          style={{ backgroundColor: "#DDC067", color: "#152638" }}
        >
          {isSaving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>

      {/* Informações sobre LGPD */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">🔒 Privacidade e Proteção de Dados</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Seus dados são protegidos conforme a LGPD</li>
            <li>• Você pode cancelar as notificações a qualquer momento</li>
            <li>• Não compartilhamos seu número com terceiros</li>
            <li>• Mensagens são criptografadas end-to-end</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
