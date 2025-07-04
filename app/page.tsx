"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Calendar,
  Banknote,
  Tag,
  TrendingDown,
  TrendingUp,
  Wallet,
  Trash2,
  PiggyBank,
  Cloud,
  CloudOff,
  Eye,
  MessageCircle,
  FileText,
  Crown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import HeaderMenu from "@/components/header-menu"
import AutoTrialManager from "@/components/auto-trial-manager"
import TrialBanner from "@/components/trial-banner"
import PWAInstallPrompt from "@/components/pwa-install-prompt"
import AuthWrapper from "@/components/auth-wrapper"
import PremiumOverlay from "@/components/premium-overlay"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import Image from "next/image"

interface Transaction {
  id: string
  date: string
  category: string
  amount: number
  type: "income" | "expense" | "investment"
  description?: string
  created_at?: string
  user_id?: string
  source?: string // 'manual', 'whatsapp', 'csv'
}

const defaultCategories = {
  expense: ["Alimentação", "Transporte", "Moradia", "Saúde", "Educação", "Lazer", "Roupas", "Outros"],
  income: ["Salário", "Freelance", "Vendas", "Outros"],
  investment: ["Banco", "Assessoria", "Corretora", "Fintech", "Outros"],
}

const categoryColors: { [key: string]: string } = {
  // Gastos
  Alimentação: "#6F4031",
  Transporte: "#A4793E",
  Moradia: "#DDC067",
  Saúde: "#152638",
  Educação: "#6F4031",
  Lazer: "#A4793E",
  Roupas: "#DDC067",
  // Receitas
  Salário: "#152638",
  Freelance: "#6F4031",
  Vendas: "#A4793E",
  // Investimentos
  Banco: "#152638",
  Assessoria: "#6F4031",
  Corretora: "#A4793E",
  Fintech: "#DDC067",
  Outros: "#A4793E",
}

// Componente do Gráfico de Pizza
const PieChart = ({ data, total }: { data: { [key: string]: number }; total: number }) => {
  const entries = Object.entries(data).sort(([, a], [, b]) => b - a)
  let cumulativePercentage = 0

  const createPath = (percentage: number, startAngle: number) => {
    const angle = (percentage / 100) * 360
    const endAngle = startAngle + angle
    const largeArcFlag = angle > 180 ? 1 : 0

    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180)
    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180)
    const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180)
    const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180)

    return `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <svg width="180" height="180" viewBox="0 0 100 100" className="transform -rotate-90">
        {entries.map(([category, amount], index) => {
          const percentage = (amount / total) * 100
          const startAngle = (cumulativePercentage / 100) * 360
          const path = createPath(percentage, startAngle)
          cumulativePercentage += percentage

          return (
            <path
              key={category}
              d={path}
              fill={categoryColors[category] || "#152638"}
              stroke="white"
              strokeWidth="0.5"
            />
          )
        })}
      </svg>

      <div className="grid grid-cols-1 gap-2 w-full">
        {entries.map(([category, amount]) => {
          const percentage = (amount / total) * 100
          return (
            <div key={category} className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: categoryColors[category] || "#152638" }}
              />
              <span style={{ color: "#152638" }} className="font-medium truncate flex-1">
                {category}
              </span>
              <span style={{ color: "#DDC067" }} className="font-bold">
                {percentage.toFixed(1)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Função para formatar data corretamente (sem problemas de timezone)
const formatDateForDisplay = (dateString: string): string => {
  const [year, month, day] = dateString.split("-")
  return `${day}/${month}/${year}`
}

function FinancialControlApp() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [date, setDate] = useState("")
  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("0,00")
  const [type, setType] = useState<"income" | "expense" | "investment">("expense")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [mounted, setMounted] = useState(false)
  const [categories, setCategories] = useState(defaultCategories)
  const [newCategory, setNewCategory] = useState("")
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [showPremiumOverlay, setShowPremiumOverlay] = useState(false)

  // Estado do trial - agora baseado em data real
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    isPremium: false,
    isInTrial: false,
    trialDaysLeft: 0,
    isExpired: false,
    showUpgrade: false,
  })

  // Função para atualizar status do trial
  const handleTrialStatusChange = (status: any) => {
    console.log("📊 Status do trial atualizado:", status)
    setSubscriptionStatus({
      isPremium: status.isPremium,
      isInTrial: status.isInTrial,
      trialDaysLeft: status.daysLeft,
      isExpired: !status.isInTrial && !status.isPremium,
      showUpgrade: status.showUpgrade,
    })
  }

  // Função para abrir modal de upgrade
  const handleUpgrade = () => {
    setShowPremiumOverlay(true)
  }

  // Detectar status de conexão
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [])

  // Função para carregar transações do usuário atual (INCLUINDO WHATSAPP)
  const loadUserTransactions = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erro ao carregar transações:", error)
        setIsOnline(false)
        return
      }

      setIsOnline(true)
      setTransactions(data || [])

      // Log para debug - mostrar transações do WhatsApp
      const whatsappTransactions = data?.filter((t) => t.source === "whatsapp") || []
      console.log(`📱 ${whatsappTransactions.length} transações do WhatsApp carregadas`)
    } catch (error) {
      console.error("Erro de conexão:", error)
      setIsOnline(false)
    } finally {
      setIsLoading(false)
    }
  }

  // useEffect para autenticação
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // useEffect para inicialização do app
  useEffect(() => {
    const initializeApp = async () => {
      setMounted(true)

      // Set today's date
      const today = new Date().toISOString().split("T")[0]
      setDate(today)

      // Set current month
      const currentMonth = new Date().toISOString().slice(0, 7)
      setSelectedMonth(currentMonth)

      // Load saved categories
      const savedCategories = localStorage.getItem("categories")
      if (savedCategories) {
        try {
          const parsed = JSON.parse(savedCategories)
          const updatedCategories = {
            ...parsed,
            investment: ["Banco", "Assessoria", "Corretora", "Fintech", "Outros"],
          }
          setCategories(updatedCategories)
          localStorage.setItem("categories", JSON.stringify(updatedCategories))
        } catch (e) {
          console.log("Error loading categories")
          setCategories(defaultCategories)
        }
      } else {
        setCategories(defaultCategories)
      }

      // Set default category
      setCategory(defaultCategories.expense[0])

      // Carregar transações se usuário estiver logado
      if (user) {
        await loadUserTransactions()
      }
    }

    initializeApp()
  }, [user])

  // useEffect para sincronização em tempo real (INCLUINDO WHATSAPP)
  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel("transactions_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("🔄 Mudança detectada:", payload)

          // Se for transação do WhatsApp, mostrar notificação
          if (payload.new?.source === "whatsapp") {
            console.log("📱 Nova transação do WhatsApp recebida!")
          }

          loadUserTransactions()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("categories", JSON.stringify(categories))
    }
  }, [categories, mounted])

  // Update category when type changes
  useEffect(() => {
    const availableCategories = categories[type].sort()
    if (availableCategories.length > 0) {
      setCategory(availableCategories[0])
    }
  }, [type, categories])

  // Função para salvar transação do usuário
  const saveUserTransaction = async (transaction: Transaction) => {
    if (!user) return false

    try {
      const { error } = await supabase.from("transactions").insert([
        {
          ...transaction,
          user_id: user.id,
          source: transaction.source || "manual", // Marcar origem
        },
      ])

      if (error) {
        console.error("Erro ao salvar transação:", error)
        setIsOnline(false)
        return false
      }

      setIsOnline(true)
      return true
    } catch (error) {
      console.error("Erro de conexão:", error)
      setIsOnline(false)
      return false
    }
  }

  // Função para deletar transação do usuário
  const deleteUserTransaction = async (id: string) => {
    if (!user) return false

    try {
      const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id)

      if (error) {
        console.error("Erro ao deletar transação:", error)
        setIsOnline(false)
        return false
      }

      setIsOnline(true)
      return true
    } catch (error) {
      console.error("Erro de conexão:", error)
      setIsOnline(false)
      return false
    }
  }

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (!numbers) return "0,00"

    const cents = Number.parseInt(numbers)
    const reais = cents / 100

    return reais.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const parseAmount = (formattedAmount: string): number => {
    const cleanValue = formattedAmount.replace(/\./g, "").replace(",", ".")
    return Number.parseFloat(cleanValue)
  }

  const formatDisplayValue = (value: number): string => {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const handleAmountChange = (value: string) => {
    setAmount(formatCurrency(value))
  }

  const handleAddTransaction = async () => {
    if (!date || !category || !amount || amount === "0,00") {
      alert("Por favor, preencha todos os campos")
      return
    }

    const numericAmount = parseAmount(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert("Por favor, insira um valor válido")
      return
    }

    const newTransaction: Transaction = {
      date: date,
      category: category,
      amount: numericAmount,
      type: type,
      user_id: user?.id,
      source: "manual", // Transação manual do app
    }

    setIsLoading(true)

    const success = await saveUserTransaction(newTransaction)

    if (success) {
      await loadUserTransactions()
      setAmount("0,00")
    } else {
      setTransactions((prev) => [newTransaction, ...prev])
      setAmount("0,00")
    }

    setIsLoading(false)
  }

  const handleDeleteTransaction = async (id: string) => {
    if (confirm("Deseja excluir esta transação?")) {
      setTransactions((prev) => prev.filter((t) => t.id !== id))
      await deleteUserTransaction(id)
    }
  }

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      alert(type === "investment" ? "Digite o nome do local" : "Digite o nome da categoria")
      return
    }

    const trimmedCategory = newCategory.trim()

    if (categories[type].includes(trimmedCategory)) {
      alert(type === "investment" ? "Este local já existe" : "Esta categoria já existe")
      return
    }

    setCategories((prev) => ({
      ...prev,
      [type]: [...prev[type], trimmedCategory].sort(),
    }))

    setCategory(trimmedCategory)
    setNewCategory("")
    setShowAddCategory(false)

    if (!categoryColors[trimmedCategory]) {
      const colors = ["#152638", "#6F4031", "#A4793E", "#DDC067"]
      categoryColors[trimmedCategory] = colors[Math.floor(Math.random() * colors.length)]
    }
  }

  const handleImportTransactions = async (importedTransactions: any[]) => {
    setIsLoading(true)

    for (const transaction of importedTransactions) {
      const newTransaction = {
        date: transaction.date,
        category: transaction.category,
        amount: transaction.amount,
        type: transaction.type,
        user_id: user?.id,
        source: "csv", // Marcar como importação CSV
      }

      await saveUserTransaction(newTransaction)
    }

    await loadUserTransactions()
    setIsLoading(false)

    alert(`${importedTransactions.length} transações importadas com sucesso!`)
  }

  // Filter transactions by selected month
  const filteredTransactions = transactions.filter((transaction) => {
    if (!selectedMonth) return true
    return transaction.date.startsWith(selectedMonth)
  })

  // Calculate totals (INCLUINDO TODAS AS FONTES: manual, WhatsApp, CSV)
  const monthlyIncome = filteredTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const monthlyExpenses = filteredTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  const monthlyInvestments = filteredTransactions
    .filter((t) => t.type === "investment")
    .reduce((sum, t) => sum + t.amount, 0)
  const monthlyBalance = monthlyIncome - monthlyExpenses - monthlyInvestments

  // Estatísticas por fonte
  const whatsappTransactions = filteredTransactions.filter((t) => t.source === "whatsapp")
  const manualTransactions = filteredTransactions.filter((t) => t.source === "manual")
  const csvTransactions = filteredTransactions.filter((t) => t.source === "csv")

  console.log(`📊 Relatório de fontes:
  📱 WhatsApp: ${whatsappTransactions.length} transações
  ✋ Manual: ${manualTransactions.length} transações  
  📄 CSV: ${csvTransactions.length} transações`)

  // Calculate category totals for expenses
  const expenseTotals: { [key: string]: number } = {}
  filteredTransactions
    .filter((t) => t.type === "expense")
    .forEach((transaction) => {
      expenseTotals[transaction.category] = (expenseTotals[transaction.category] || 0) + transaction.amount
    })

  // Get available months from transactions
  const availableMonths = [...new Set(transactions.map((t) => t.date.slice(0, 7)))].sort().reverse()

  const formatMonthName = (monthString: string) => {
    const [year, month] = monthString.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1)
    return date.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
    })
  }

  // Função para selecionar/deselecionar transação individual
  const handleSelectTransaction = (id: string) => {
    setSelectedTransactions((prev) => {
      if (prev.includes(id)) {
        return prev.filter((t) => t !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  // Função para selecionar/deselecionar todas
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTransactions([])
    } else {
      setSelectedTransactions(filteredTransactions.map((t) => t.id))
    }
    setSelectAll(!selectAll)
  }

  // Função para excluir transações selecionadas
  const handleDeleteSelected = async () => {
    if (selectedTransactions.length === 0) {
      alert("Selecione pelo menos uma transação para excluir")
      return
    }

    if (confirm(`Deseja excluir ${selectedTransactions.length} transação(ões) selecionada(s)?`)) {
      setIsLoading(true)

      setTransactions((prev) => prev.filter((t) => !selectedTransactions.includes(t.id)))

      for (const id of selectedTransactions) {
        await deleteUserTransaction(id)
      }

      setSelectedTransactions([])
      setSelectAll(false)
      setIsLoading(false)
    }
  }

  // Função para gerar PDF com o visual do app
  const generatePDFReport = async () => {
    if (filteredTransactions.length === 0) {
      alert("Não há dados para gerar o relatório")
      return
    }

    setIsGeneratingPDF(true)

    try {
      // Criar um elemento temporário com o conteúdo do relatório
      const reportElement = document.createElement("div")
      reportElement.style.position = "absolute"
      reportElement.style.left = "-9999px"
      reportElement.style.top = "0"
      reportElement.style.width = "800px"
      reportElement.style.backgroundColor = "#f9fafb"
      reportElement.style.padding = "20px"
      reportElement.style.fontFamily = "system-ui, -apple-system, sans-serif"

      const periodText = selectedMonth ? formatMonthName(selectedMonth) : "Todos os períodos"
      const now = new Date()

      reportElement.innerHTML = `
  <div style="background: white; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-bottom: 20px; overflow: hidden;">
  <div style="background: #152638; color: white; padding: 20px; position: relative;">
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-Seu-Planejamento-Branco-egZSajY7VUIpuGLYyhqs06b6LbF8ug.png" alt="Seu Planejamento" style="height: 50px; width: auto;" crossorigin="anonymous" />
      <div style="text-align: center; flex: 1;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Relatório Financeiro</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.8; font-size: 14px;">${periodText}</p>
      </div>
      <div style="width: 50px;"></div>
    </div>
  </div>
</div>

  <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
    <div style="background: #2D5016; color: white; border-radius: 8px; padding: 20px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; justify-content: center; align-items: center;">
      <p style="margin: 0; opacity: 0.8; font-size: 12px; font-weight: 500;">Receitas</p>
      <p style="margin: 8px 0 0 0; font-size: 18px; font-weight: bold;">R$ ${formatDisplayValue(monthlyIncome)}</p>
    </div>
    <div style="background: #8B2635; color: white; border-radius: 8px; padding: 20px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; justify-content: center; align-items: center;">
      <p style="margin: 0; opacity: 0.8; font-size: 12px; font-weight: 500;">Gastos</p>
      <p style="margin: 8px 0 0 0; font-size: 18px; font-weight: bold;">R$ ${formatDisplayValue(monthlyExpenses)}</p>
    </div>
    <div style="background: #152638; color: white; border-radius: 8px; padding: 20px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; justify-content: center; align-items: center;">
      <p style="margin: 0; opacity: 0.8; font-size: 12px; font-weight: 500;">Investimentos</p>
      <p style="margin: 8px 0 0 0; font-size: 18px; font-weight: bold;">R$ ${formatDisplayValue(monthlyInvestments)}</p>
    </div>
    <div style="background: ${monthlyBalance >= 0 ? "#DDC067" : "#6F4031"}; color: white; border-radius: 8px; padding: 20px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; justify-content: center; align-items: center;">
      <p style="margin: 0; opacity: 0.8; font-size: 12px; font-weight: 500;">Saldo</p>
      <p style="margin: 8px 0 0 0; font-size: 18px; font-weight: bold;">R$ ${formatDisplayValue(monthlyBalance)}</p>
    </div>
  </div>

  ${
    Object.keys(expenseTotals).length > 0
      ? `
  <div style="background: white; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-bottom: 20px; overflow: hidden;">
    <div style="background: #152638; color: white; padding: 15px;">
      <h2 style="margin: 0; font-size: 18px; font-weight: bold;">Gastos por Categoria</h2>
    </div>
    <div style="padding: 20px;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid #e5e7eb;">
            <th style="text-align: left; padding: 12px 8px; color: #152638; font-size: 13px; font-weight: 600;">Categoria</th>
            <th style="text-align: right; padding: 12px 8px; color: #152638; font-size: 13px; font-weight: 600;">Valor</th>
            <th style="text-align: right; padding: 12px 8px; color: #152638; font-size: 13px; font-weight: 600;">%</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(expenseTotals)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, amount]) => {
              const percentage = ((amount / monthlyExpenses) * 100).toFixed(1)
              return `
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 10px 8px; vertical-align: middle;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: ${categoryColors[cat] || "#152638"}; flex-shrink: 0;"></div>
                    <span style="color: #152638; font-size: 13px; font-weight: 500;">${cat}</span>
                  </div>
                </td>
                <td style="text-align: right; padding: 10px 8px; color: #DDC067; font-weight: bold; font-size: 13px; vertical-align: middle;">R$ ${formatDisplayValue(amount)}</td>
                <td style="text-align: right; padding: 10px 8px; color: #152638; font-weight: 500; font-size: 13px; vertical-align: middle;">${percentage}%</td>
              </tr>
            `
            })
            .join("")}
        </tbody>
      </table>
    </div>
  </div>
  `
      : ""
  }

  <div style="background: white; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
    <div style="background: #152638; color: white; padding: 15px;">
      <h2 style="margin: 0; font-size: 18px; font-weight: bold;">Histórico de Transações</h2>
      <p style="margin: 5px 0 0 0; opacity: 0.8; font-size: 12px;">${filteredTransactions.length} transaç${filteredTransactions.length !== 1 ? "ões" : "ão"}</p>
    </div>
    <div style="padding: 20px;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid #e5e7eb;">
            <th style="text-align: left; padding: 12px 8px; color: #152638; font-size: 13px; font-weight: 600;">Data</th>
            <th style="text-align: left; padding: 12px 8px; color: #152638; font-size: 13px; font-weight: 600;">Tipo</th>
            <th style="text-align: left; padding: 12px 8px; color: #152638; font-size: 13px; font-weight: 600;">Categoria</th>
            <th style="text-align: right; padding: 12px 8px; color: #152638; font-size: 13px; font-weight: 600;">Valor</th>
          </tr>
        </thead>
        <tbody>
          ${filteredTransactions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 50) // Limitar a 50 transações para não ficar muito grande
            .map((transaction) => {
              const typeText =
                transaction.type === "income" ? "Receita" : transaction.type === "investment" ? "Invest." : "Gasto"
              const typeColor =
                transaction.type === "income" ? "#2D5016" : transaction.type === "investment" ? "#152638" : "#8B2635"
              const amountColor =
                transaction.type === "income" ? "#2D5016" : transaction.type === "investment" ? "#152638" : "#8B2635"

              return `
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 10px 8px; color: #152638; font-weight: 500; font-size: 13px; vertical-align: middle;">${formatDateForDisplay(transaction.date)}</td>
                <td style="padding: 10px 8px; vertical-align: middle;">
                  <span style="background: ${typeColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; display: inline-block;">${typeText}</span>
                </td>
                <td style="padding: 10px 8px; vertical-align: middle;">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <div style="width: 8px; height: 8px; border-radius: 50%; background: ${categoryColors[transaction.category] || "#152638"}; flex-shrink: 0;"></div>
                    <span style="color: #152638; font-weight: 500; font-size: 13px;">${transaction.category}</span>
                  </div>
                </td>
                <td style="text-align: right; padding: 10px 8px; color: ${amountColor}; font-weight: bold; font-size: 13px; vertical-align: middle;">
                  ${transaction.type === "income" ? "+" : "-"}R$ ${formatDisplayValue(transaction.amount)}
                </td>
              </tr>
            `
            })
            .join("")}
        </tbody>
      </table>
    </div>
  </div>
`

      document.body.appendChild(reportElement)

      // Capturar o elemento como imagem
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#f9fafb",
        width: 800,
        height: reportElement.scrollHeight,
      })

      // Remover o elemento temporário
      document.body.removeChild(reportElement)

      // Criar PDF
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pdfWidth - 20 // margem de 10mm de cada lado
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 10 // margem superior

      // Adicionar primeira página
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight - 20

      // Adicionar páginas adicionais se necessário
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight - 20
      }

      // Salvar o PDF
      const fileName = `relatorio-financeiro-${selectedMonth || "completo"}-${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}.pdf`
      pdf.save(fileName)

      alert("✅ Relatório PDF gerado com sucesso!")
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      alert("❌ Erro ao gerar PDF. Tente novamente.")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // Atualizar selectAll quando filteredTransactions mudar
  useEffect(() => {
    if (filteredTransactions.length > 0) {
      const allSelected = filteredTransactions.every((t) => selectedTransactions.includes(t.id))
      setSelectAll(allSelected)
    } else {
      setSelectAll(false)
    }
  }, [filteredTransactions, selectedTransactions])

  if (!mounted) {
    return (
      <div className="p-8 text-center bg-gray-50" style={{ color: "#152638" }}>
        Carregando...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-1 sm:p-4">
      {/* Gerenciador de Trial Automático */}
      <AutoTrialManager user={user} onTrialStatusChange={handleTrialStatusChange} />

      {/* Banner de Trial */}
      <TrialBanner
        daysLeft={subscriptionStatus.trialDaysLeft}
        showUpgrade={subscriptionStatus.showUpgrade}
        onUpgrade={handleUpgrade}
      />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      <div className="max-w-6xl mx-auto space-y-3 sm:space-y-6">
        {/* Header com Logo */}
        <Card className="shadow-lg border-0 bg-white">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <Image
                src="/logo-seu-planejamento.png"
                alt="Seu Planejamento"
                width={200}
                height={100}
                className="h-16 w-auto object-contain"
                priority
              />
              <h1
                className="text-sm sm:text-2xl font-bold absolute left-1/2 transform -translate-x-1/2"
                style={{ color: "#152638" }}
              >
                Controle Financeiro
              </h1>
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-[#152638]"></div>
                ) : isOnline ? (
                  <Cloud className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" title="Conectado à nuvem" />
                ) : (
                  <CloudOff className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" title="Modo offline" />
                )}

                <HeaderMenu
                  user={user}
                  onLogout={() => {
                    console.log("Logout chamado do page.tsx")
                  }}
                  onImportTransactions={handleImportTransactions}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status de Conexão */}
        {!isOnline && (
          <Card className="shadow-lg border-0 bg-yellow-50 border-yellow-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <CloudOff className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium">
                  📱 Modo offline - Seus dados serão sincronizados quando a conexão for restabelecida.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status do Trial */}
        {subscriptionStatus.isExpired && (
          <Card className="shadow-lg border-0 bg-red-50 border-red-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 text-red-800">
                <Crown className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium">
                  Trial expirado. Faça upgrade para continuar usando todas as funcionalidades.
                </span>
                <Button size="sm" onClick={handleUpgrade} className="ml-auto bg-red-600 hover:bg-red-700 text-white">
                  Upgrade Agora
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estatísticas de Fontes (Debug) */}
        {whatsappTransactions.length > 0 && (
          <Card className="shadow-lg border-0 bg-green-50 border-green-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 text-green-800">
                <MessageCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium">
                  📱 {whatsappTransactions.length} transações adicionadas via WhatsApp este mês!
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Transaction Form - Controle de acesso baseado no trial */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader style={{ backgroundColor: "#152638" }}>
            <CardTitle className="flex items-center gap-2 text-white text-sm sm:text-xl">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              Nova Transação
              {subscriptionStatus.isExpired && <Badge className="bg-red-500 text-white ml-2">Premium</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            {subscriptionStatus.isExpired ? (
              <div className="text-center py-8">
                <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Trial expirado. Faça upgrade para adicionar transações.</p>
                <Button onClick={handleUpgrade} className="bg-[#DDC067] text-[#152638] hover:opacity-90">
                  Upgrade Premium
                </Button>
              </div>
            ) : (
              <>
                {/* Type Selector */}
                <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-4 sm:mb-6">
                  <Button
                    variant={type === "expense" ? "default" : "outline"}
                    onClick={() => setType("expense")}
                    style={{
                      backgroundColor: type === "expense" ? "#8B2635" : "transparent",
                      borderColor: "#8B2635",
                      color: type === "expense" ? "white" : "#8B2635",
                    }}
                    className="hover:opacity-90 text-xs sm:text-base py-2 sm:py-3"
                  >
                    <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Gasto</span>
                    <span className="sm:hidden">Gasto</span>
                  </Button>
                  <Button
                    variant={type === "income" ? "default" : "outline"}
                    onClick={() => setType("income")}
                    style={{
                      backgroundColor: type === "income" ? "#2D5016" : "transparent",
                      borderColor: "#2D5016",
                      color: type === "income" ? "white" : "#2D5016",
                    }}
                    className="hover:opacity-90 text-xs sm:text-base py-2 sm:py-3"
                  >
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Receita</span>
                    <span className="sm:hidden">Receita</span>
                  </Button>
                  <Button
                    variant={type === "investment" ? "default" : "outline"}
                    onClick={() => setType("investment")}
                    style={{
                      backgroundColor: type === "investment" ? "#152638" : "transparent",
                      borderColor: "#152638",
                      color: type === "investment" ? "white" : "#152638",
                    }}
                    className="hover:opacity-90 text-xs sm:text-base py-2 sm:py-3"
                  >
                    <PiggyBank className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Investimento</span>
                    <span className="sm:hidden">Invest.</span>
                  </Button>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {/* Data */}
                  <div className="space-y-1 sm:space-y-2">
                    <Label
                      className="flex items-center gap-2 font-medium text-xs sm:text-sm"
                      style={{ color: "#152638" }}
                    >
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      Data
                    </Label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="border-gray-300 focus:border-[#DDC067] focus:ring-[#DDC067] text-xs sm:text-sm h-10 sm:h-auto"
                      style={{ color: "#152638" }}
                    />
                  </div>

                  {/* Categoria/Local */}
                  <div className="space-y-1 sm:space-y-2">
                    <Label
                      className="flex items-center gap-2 font-medium text-xs sm:text-sm"
                      style={{ color: "#152638" }}
                    >
                      <Tag className="h-3 w-3 sm:h-4 sm:w-4" />
                      {type === "investment" ? "Local" : "Categoria"}
                    </Label>
                    <div className="flex gap-2">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="flex-1 p-2 sm:p-3 border border-gray-300 rounded-md focus:border-[#DDC067] focus:outline-none focus:ring-1 focus:ring-[#DDC067] text-xs sm:text-sm h-10 sm:h-auto"
                        style={{ color: "#152638" }}
                      >
                        {categories[type].sort().map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddCategory(!showAddCategory)}
                        className="px-2 sm:px-3 border-[#DDC067] text-[#DDC067] hover:bg-[#DDC067] hover:text-[#152638] h-10 sm:h-auto"
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>

                    {showAddCategory && (
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder={type === "investment" ? "Novo local" : "Nova categoria"}
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="text-xs sm:text-sm border-gray-300 focus:border-[#DDC067] focus:ring-[#DDC067] h-9 sm:h-auto"
                          style={{ color: "#152638" }}
                        />
                        <Button
                          size="sm"
                          onClick={handleAddCategory}
                          style={{ backgroundColor: "#DDC067", color: "#152638" }}
                          className="hover:opacity-90 font-medium text-xs sm:text-sm h-9 sm:h-auto px-3"
                        >
                          Add
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Valor */}
                  <div className="space-y-1 sm:space-y-2">
                    <Label
                      className="flex items-center gap-2 font-medium text-xs sm:text-sm"
                      style={{ color: "#152638" }}
                    >
                      <Banknote className="h-3 w-3 sm:h-4 sm:w-4" />
                      Valor (R$)
                    </Label>
                    <Input
                      type="text"
                      placeholder="0,00"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="border-gray-300 focus:border-[#DDC067] focus:ring-[#DDC067] text-xs sm:text-sm h-10 sm:h-auto text-lg sm:text-base font-bold"
                      style={{ color: "#152638" }}
                    />
                  </div>

                  {/* Botão Adicionar */}
                  <Button
                    onClick={handleAddTransaction}
                    className="w-full font-medium hover:opacity-90 text-sm sm:text-base h-12 sm:h-auto"
                    style={{ backgroundColor: "#DDC067", color: "#152638" }}
                    disabled={!date || !category || !amount || amount === "0,00" || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#152638] mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Month Filter */}
        {availableMonths.length > 0 && (
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-3 sm:p-6">
              <div className="space-y-2">
                <Label style={{ color: "#152638" }} className="font-medium text-xs sm:text-sm">
                  Filtrar por mês:
                </Label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:border-[#DDC067] focus:outline-none focus:ring-1 focus:ring-[#DDC067] text-xs sm:text-sm h-10 sm:h-auto"
                  style={{ color: "#152638" }}
                >
                  <option value="">Todos os meses</option>
                  {availableMonths.map((month) => (
                    <option key={month} value={month}>
                      {formatMonthName(month)}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard - Controle de acesso baseado no trial */}
        {filteredTransactions.length > 0 && Object.keys(expenseTotals).length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            {subscriptionStatus.isExpired ? (
              <Card className="shadow-lg border-0 bg-white">
                <CardContent className="p-8 text-center">
                  <Crown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Relatórios Premium</h3>
                  <p className="text-gray-600 mb-4">
                    Acesse gráficos detalhados e análises avançadas com o plano Premium
                  </p>
                  <Button onClick={handleUpgrade} className="bg-[#DDC067] text-[#152638] hover:opacity-90">
                    Upgrade Premium
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Summary Cards - INCLUINDO DADOS DO WHATSAPP */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                  <Card className="text-white border-0 shadow-lg" style={{ backgroundColor: "#2D5016" }}>
                    <CardContent className="p-3 sm:p-6">
                      <div className="text-center sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-white/80 text-xs font-medium">Receitas</p>
                          <p className="text-sm sm:text-2xl font-bold">R$ {formatDisplayValue(monthlyIncome)}</p>
                        </div>
                        <TrendingUp className="h-4 w-4 sm:h-8 sm:w-8 text-white/80 mx-auto mt-1 sm:mx-0 sm:mt-0" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="text-white border-0 shadow-lg" style={{ backgroundColor: "#8B2635" }}>
                    <CardContent className="p-3 sm:p-6">
                      <div className="text-center sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-white/80 text-xs font-medium">Gastos</p>
                          <p className="text-sm sm:text-2xl font-bold">R$ {formatDisplayValue(monthlyExpenses)}</p>
                        </div>
                        <TrendingDown className="h-4 w-4 sm:h-8 sm:w-8 text-white/80 mx-auto mt-1 sm:mx-0 sm:mt-0" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="text-white border-0 shadow-lg" style={{ backgroundColor: "#152638" }}>
                    <CardContent className="p-3 sm:p-6">
                      <div className="text-center sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-white/80 text-xs font-medium">Investimentos</p>
                          <p className="text-sm sm:text-2xl font-bold">R$ {formatDisplayValue(monthlyInvestments)}</p>
                        </div>
                        <PiggyBank className="h-4 w-4 sm:h-8 sm:w-8 text-white/80 mx-auto mt-1 sm:mx-0 sm:mt-0" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="text-white border-0 shadow-lg"
                    style={{ backgroundColor: monthlyBalance >= 0 ? "#DDC067" : "#6F4031" }}
                  >
                    <CardContent className="p-3 sm:p-6">
                      <div className="text-center sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-white/80 text-xs font-medium">Saldo</p>
                          <p className="text-sm sm:text-2xl font-bold">R$ {formatDisplayValue(monthlyBalance)}</p>
                        </div>
                        <Wallet className="h-4 w-4 sm:h-8 sm:w-8 text-white/80 mx-auto mt-1 sm:mx-0 sm:mt-0" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Gráficos - Stack no mobile */}
                <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
                  {/* Expense Summary Table */}
                  <Card className="shadow-lg border-0 bg-white">
                    <CardHeader style={{ backgroundColor: "#152638" }}>
                      <CardTitle className="flex items-center gap-2 text-white text-sm sm:text-lg">
                        <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
                        Gastos por Categoria
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead style={{ color: "#152638" }} className="font-medium text-xs">
                                Categoria
                              </TableHead>
                              <TableHead className="text-right font-medium text-xs" style={{ color: "#152638" }}>
                                Valor
                              </TableHead>
                              <TableHead className="text-right font-medium text-xs" style={{ color: "#152638" }}>
                                %
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(expenseTotals)
                              .sort(([, a], [, b]) => b - a)
                              .map(([cat, amount]) => (
                                <TableRow key={cat}>
                                  <TableCell className="flex items-center gap-2 py-2">
                                    <div
                                      className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: categoryColors[cat] || "#152638" }}
                                    />
                                    <span style={{ color: "#152638" }} className="font-medium text-xs truncate">
                                      {cat}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right font-bold text-xs" style={{ color: "#DDC067" }}>
                                    R$ {formatDisplayValue(amount)}
                                  </TableCell>
                                  <TableCell className="text-right font-medium text-xs" style={{ color: "#152638" }}>
                                    {((amount / monthlyExpenses) * 100).toFixed(1)}%
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pie Chart */}
                  <Card className="shadow-lg border-0 bg-white">
                    <CardHeader style={{ backgroundColor: "#152638" }}>
                      <CardTitle className="text-white text-sm sm:text-lg">Distribuição dos Gastos</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6">
                      <PieChart data={expenseTotals} total={monthlyExpenses} />
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        )}

        {/* Transactions List - INCLUINDO INDICADOR DE FONTE */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader style={{ backgroundColor: "#152638" }}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-sm sm:text-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                    Histórico de Transações
                  </div>
                </CardTitle>
                <p className="text-xs text-white/80">
                  {filteredTransactions.length} transaç{filteredTransactions.length !== 1 ? "ões" : "ão"}
                  {selectedTransactions.length > 0 && (
                    <span className="ml-2">• {selectedTransactions.length} selecionada(s)</span>
                  )}
                  {selectedMonth && <span className="ml-2">em {formatMonthName(selectedMonth)}</span>}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Botão de gerar PDF - Controle de acesso */}
                {filteredTransactions.length > 0 && !subscriptionStatus.isExpired && (
                  <Button
                    onClick={generatePDFReport}
                    disabled={isGeneratingPDF}
                    size="sm"
                    style={{ backgroundColor: "#152638" }}
                    className="hover:opacity-90 text-white"
                  >
                    {isGeneratingPDF ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Gerando...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        PDF
                      </>
                    )}
                  </Button>
                )}

                {/* Botão de exclusão - Controle de acesso */}
                {selectedTransactions.length > 0 && !subscriptionStatus.isExpired && (
                  <Button
                    onClick={handleDeleteSelected}
                    disabled={isLoading}
                    size="sm"
                    style={{ backgroundColor: "#8B2635" }}
                    className="hover:opacity-90 text-white"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Excluindo...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir ({selectedTransactions.length})
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            {filteredTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {!subscriptionStatus.isExpired && (
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            disabled={filteredTransactions.length === 0}
                            className="rounded border-gray-300 text-[#DDC067] focus:ring-[#DDC067]"
                            title="Selecionar tudo"
                          />
                        </TableHead>
                      )}
                      <TableHead style={{ color: "#152638" }} className="font-medium text-xs">
                        Data
                      </TableHead>
                      <TableHead style={{ color: "#152638" }} className="font-medium text-xs">
                        Tipo
                      </TableHead>
                      <TableHead style={{ color: "#152638" }} className="font-medium text-xs">
                        Categoria
                      </TableHead>
                      <TableHead className="text-right font-medium text-xs" style={{ color: "#152638" }}>
                        Valor
                      </TableHead>
                      {!subscriptionStatus.isExpired && <TableHead className="w-12"></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((transaction) => (
                        <TableRow
                          key={transaction.id}
                          className={selectedTransactions.includes(transaction.id) ? "bg-blue-50" : ""}
                        >
                          {!subscriptionStatus.isExpired && (
                            <TableCell className="py-2">
                              <input
                                type="checkbox"
                                checked={selectedTransactions.includes(transaction.id)}
                                onChange={() => handleSelectTransaction(transaction.id)}
                                className="rounded border-gray-300 text-[#DDC067] focus:ring-[#DDC067]"
                              />
                            </TableCell>
                          )}
                          <TableCell style={{ color: "#152638" }} className="font-medium text-xs py-2">
                            {formatDateForDisplay(transaction.date)}
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge
                              style={{
                                backgroundColor:
                                  transaction.type === "income"
                                    ? "#2D5016"
                                    : transaction.type === "investment"
                                      ? "#152638"
                                      : "#8B2635",
                                color: "white",
                              }}
                              className="font-medium text-xs px-1 py-0"
                            >
                              {transaction.type === "income"
                                ? "Receita"
                                : transaction.type === "investment"
                                  ? "Invest."
                                  : "Gasto"}
                            </Badge>
                          </TableCell>
                          <TableCell className="flex items-center gap-1 py-2">
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: categoryColors[transaction.category] || "#152638" }}
                            />
                            <span style={{ color: "#152638" }} className="font-medium text-xs truncate">
                              {transaction.category}
                            </span>
                          </TableCell>
                          <TableCell
                            className="text-right font-bold text-xs py-2"
                            style={{
                              color:
                                transaction.type === "income"
                                  ? "#2D5016"
                                  : transaction.type === "investment"
                                    ? "#152638"
                                    : "#8B2635",
                            }}
                          >
                            {transaction.type === "income" ? "+" : "-"}R$ {formatDisplayValue(transaction.amount)}
                          </TableCell>
                          {!subscriptionStatus.isExpired && (
                            <TableCell className="py-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTransaction(transaction.id)}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Nenhuma transação encontrada</p>
                <p className="text-xs mt-1">
                  {selectedMonth
                    ? `Adicione transações para ${formatMonthName(selectedMonth)} ou selecione outro período`
                    : "Adicione sua primeira transação usando o formulário acima"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Premium Overlay */}
      {showPremiumOverlay && <PremiumOverlay user={user} onClose={() => setShowPremiumOverlay(false)} />}
    </div>
  )
}

export default function Page() {
  return (
    <AuthWrapper>
      <FinancialControlApp />
    </AuthWrapper>
  )
}
