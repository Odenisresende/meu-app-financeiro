"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Shield, Download, Trash2, FileText, Mail, AlertTriangle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface PrivacyComplianceProps {
  user: any
}

export default function PrivacyCompliance({ user }: PrivacyComplianceProps) {
  const [showDataExport, setShowDataExport] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Exportar todos os dados do usuário (LGPD Art. 15)
  const exportUserData = async () => {
    if (!user) return

    setIsExporting(true)

    try {
      // Buscar perfil
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      // Buscar transações
      const { data: transactions } = await supabase.from("transactions").select("*").eq("user_id", user.id)

      // Buscar assinaturas
      const { data: subscriptions } = await supabase.from("user_subscriptions").select("*").eq("user_id", user.id)

      const userData = {
        exportInfo: {
          exportDate: new Date().toISOString(),
          userId: user.id,
          email: user.email,
        },
        profile: profile || {},
        transactions: transactions || [],
        subscriptions: subscriptions || [],
        metadata: {
          totalTransactions: transactions?.length || 0,
          accountCreated: user.created_at,
          lastLogin: user.last_sign_in_at,
        },
      }

      // Criar arquivo para download
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `meus-dados-financeiros-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      alert("✅ Dados exportados com sucesso!")
    } catch (error) {
      console.error("Erro ao exportar dados:", error)
      alert("❌ Erro ao exportar dados. Tente novamente.")
    } finally {
      setIsExporting(false)
      setShowDataExport(false)
    }
  }

  // Excluir conta completamente (LGPD Art. 16)
  const deleteUserAccount = async () => {
    if (!user) return

    const confirmText = "EXCLUIR MINHA CONTA"
    const userConfirmation = prompt(
      `⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\nTodos os seus dados serão permanentemente excluídos:\n• Perfil e informações pessoais\n• Todas as transações financeiras\n• Histórico de assinaturas\n• Dados de backup\n\nPara confirmar, digite: ${confirmText}`,
    )

    if (userConfirmation !== confirmText) {
      alert("❌ Confirmação incorreta. Exclusão cancelada.")
      return
    }

    setIsDeleting(true)

    try {
      // 1. Deletar transações
      await supabase.from("transactions").delete().eq("user_id", user.id)

      // 2. Deletar assinaturas
      await supabase.from("user_subscriptions").delete().eq("user_id", user.id)

      // 3. Deletar perfil
      await supabase.from("profiles").delete().eq("id", user.id)

      // 4. Fazer logout
      await supabase.auth.signOut()

      // 5. Limpar storage local
      localStorage.clear()
      sessionStorage.clear()

      alert("✅ Conta excluída com sucesso. Você será redirecionado.")

      // Recarregar página para voltar ao login
      window.location.reload()
    } catch (error) {
      console.error("Erro ao excluir conta:", error)
      alert("❌ Erro ao excluir conta. Entre em contato com o suporte.")
    } finally {
      setIsDeleting(false)
      setShowDeleteAccount(false)
    }
  }

  return (
    <>
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader style={{ backgroundColor: "#152638" }}>
          <CardTitle className="flex items-center gap-2 text-white text-sm sm:text-xl">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
            Privacidade e Dados (LGPD)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-4">
            {/* Informações sobre dados */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-bold text-blue-800 mb-2">📋 Seus Direitos (LGPD):</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• ✅ **Acesso**: Ver todos os seus dados</li>
                <li>• 📥 **Portabilidade**: Baixar seus dados</li>
                <li>• ✏️ **Correção**: Editar informações incorretas</li>
                <li>• 🗑️ **Exclusão**: Apagar sua conta permanentemente</li>
                <li>• 📞 **Contato**: Falar com nosso responsável</li>
              </ul>
            </div>

            {/* Dados coletados */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-800 mb-2">🔍 Dados que coletamos:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• **Nome e email** (para sua conta)</li>
                <li>• **Transações financeiras** (que você adiciona)</li>
                <li>• **Preferências** (categorias personalizadas)</li>
                <li>• ❌ **NÃO coletamos**: CPF, dados bancários, senhas</li>
              </ul>
            </div>

            {/* Ações disponíveis */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Exportar dados */}
              <Button
                onClick={() => setShowDataExport(true)}
                variant="outline"
                className="flex items-center gap-2 h-auto p-4 border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <Download className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Baixar meus dados</div>
                  <div className="text-xs opacity-75">Exportar tudo em JSON</div>
                </div>
              </Button>

              {/* Excluir conta */}
              <Button
                onClick={() => setShowDeleteAccount(true)}
                variant="outline"
                className="flex items-center gap-2 h-auto p-4 border-red-300 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Excluir minha conta</div>
                  <div className="text-xs opacity-75">Ação irreversível</div>
                </div>
              </Button>
            </div>

            {/* Contato LGPD */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 text-yellow-800 mb-2">
                <Mail className="h-4 w-4" />
                <span className="font-bold">Dúvidas sobre privacidade?</span>
              </div>
              <p className="text-sm text-yellow-700">
                Entre em contato: <strong>lgpd@seuplanejamento.com</strong>
                <br />
                Respondemos em até 15 dias úteis.
              </p>
            </div>

            {/* Links importantes */}
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Política de Privacidade
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Termos de Uso
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de exportação */}
      <Dialog open={showDataExport} onOpenChange={setShowDataExport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exportar Meus Dados
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Você receberá um arquivo JSON com todos os seus dados:</p>
            <ul className="text-sm space-y-1">
              <li>• ✅ Informações do perfil</li>
              <li>• ✅ Todas as transações</li>
              <li>• ✅ Histórico de assinaturas</li>
              <li>• ✅ Metadados da conta</li>
            </ul>
            <div className="flex gap-2">
              <Button onClick={() => setShowDataExport(false)} variant="outline" className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={exportUserData}
                disabled={isExporting}
                className="flex-1"
                style={{ backgroundColor: "#152638", color: "white" }}
              >
                {isExporting ? "Exportando..." : "Baixar Dados"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de exclusão */}
      <Dialog open={showDeleteAccount} onOpenChange={setShowDeleteAccount}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Excluir Conta Permanentemente
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-red-800 font-medium mb-2">⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!</p>
              <p className="text-sm text-red-700">
                Todos os seus dados serão permanentemente excluídos e não poderão ser recuperados.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Será excluído:</p>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• 🗑️ Perfil e informações pessoais</li>
                <li>• 🗑️ Todas as transações financeiras</li>
                <li>• 🗑️ Histórico de assinaturas</li>
                <li>• 🗑️ Dados de backup na nuvem</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setShowDeleteAccount(false)} variant="outline" className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={deleteUserAccount}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
