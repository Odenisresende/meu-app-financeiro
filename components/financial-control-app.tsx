"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CalendarIcon,
  BarChart3,
  PieChart,
  FileText,
  Crown,
  X,
  Trash2,
  Edit,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import FileImport from "./file-import"
import PremiumOverlay from "./premium-overlay"
import TrialExpirationBanner from "./trial-expiration-banner"
import AutoTrialManager from "./auto-trial-manager"

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  category: string
  type: "income" | "expense"
  created_at: string
}

interface FinancialControlAppProps {
  user: any
}

export default function FinancialControlApp({ user }: FinancialControlAppProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedDate, setSelectedDate] = useState<Date>()

  // Form states
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    type: "expense" as "income" | "expense",
    date: new Date(),
  })

  const supabase = createClientComponentClient()

  const categories = [
    "Alimentação",
    "Transporte",
    "Moradia",
    "Saúde",
    "Educação",
    "Entretenimento",
    "Roupas",
    "Tecnologia",
    "Viagem",
    "Outros",
  ]

  useEffect(() => {
    if (user) {
      loadTransactions()
    }
  }, [user])

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error("Erro ao carregar transações:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const transactionData = {
        user_id: user.id,
        description: formData.description,
        amount: Number.parseFloat(formData.amount) * (formData.type === "expense" ? -1 : 1),
        category: formData.category,
        type: formData.type,
        date: format(formData.date, "yyyy-MM-dd"),
      }

      if (editingTransaction) {
        const { error } = await supabase.from("transactions").update(transactionData).eq("id", editingTransaction.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("transactions").insert([transactionData])

        if (error) throw error
      }

      await loadTransactions()
      resetForm()
    } catch (error) {
      console.error("Erro ao salvar transação:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      description: "",
      amount: "",
      category: "",
      type: "expense",
      date: new Date(),
    })
    setShowAddForm(false)
    setEditingTransaction(null)
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      description: transaction.description,
      amount: Math.abs(transaction.amount).toString(),
      category: transaction.category,
      type: transaction.type,
      date: new Date(transaction.date),
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta transação?")) {
      try {
        const { error } = await supabase.from("transactions").delete().eq("id", id)

        if (error) throw error
        await loadTransactions()
      } catch (error) {
        console.error("Erro ao excluir transação:", error)
      }
    }
  }

  // Filtros e ordenação
  const filteredTransactions = transactions
    .filter((t) => {
      const matchesSearch =
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === "all" || t.category === filterCategory
      const matchesType = filterType === "all" || t.type === filterType
      return matchesSearch && matchesCategory && matchesType
    })
    .sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case "amount":
          aValue = Math.abs(a.amount)
          bValue = Math.abs(b.amount)
          break
        case "description":
          aValue = a.description.toLowerCase()
          bValue = b.description.toLowerCase()
          break
        case "category":
          aValue = a.category.toLowerCase()
          bValue = b.category.toLowerCase()
          break
        default:
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  // Cálculos
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const balance = totalIncome - totalExpenses

  // Dados para gráficos
  const categoryData = categories
    .map((category) => {
      const categoryTransactions = transactions.filter((t) => t.category === category && t.type === "expense")
      const total = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
      return { category, total, count: categoryTransactions.length }
    })
    .filter((item) => item.total > 0)

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const monthTransactions = transactions.filter((t) => {
      const transactionMonth = new Date(t.date).getMonth() + 1
      return transactionMonth === month
    })

    const income = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const expenses = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return {
      month: format(new Date(2024, i, 1), "MMM", { locale: ptBR }),
      income,
      expenses,
      balance: income - expenses,
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AutoTrialManager user={user} />

      <TrialExpirationBanner user={user} onOpenPremium={() => setShowPremiumModal(true)} />

      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Controle Financeiro</h1>
            <p className="text-gray-600">Gerencie suas finanças de forma inteligente</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Transação
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowPremiumModal(true)}
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
            >
              <Crown className="h-4 w-4 mr-2" />
              Premium
            </Button>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R$ {totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="import">Importar</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar transações..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="income">Receitas</SelectItem>
                      <SelectItem value="expense">Despesas</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Data</SelectItem>
                        <SelectItem value="amount">Valor</SelectItem>
                        <SelectItem value="description">Descrição</SelectItem>
                        <SelectItem value="category">Categoria</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    >
                      {sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Transações */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transações ({filteredTransactions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma transação encontrada</p>
                    </div>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <h3 className="font-medium">{transaction.description}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Badge variant="outline">{transaction.category}</Badge>
                                <span>{format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className={`text-lg font-semibold ${
                                  transaction.type === "income" ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {transaction.type === "income" ? "+" : "-"}R${" "}
                                {Math.abs(transaction.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(transaction)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(transaction.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Gastos por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryData.map((item, index) => (
                      <div key={item.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: `hsl(${index * 45}, 70%, 50%)` }}
                          />
                          <span className="text-sm">{item.category}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            R$ {item.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.count} transação{item.count !== 1 ? "ões" : ""}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Evolução Mensal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyData
                      .filter((item) => item.income > 0 || item.expenses > 0)
                      .map((item) => (
                        <div key={item.month} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{item.month}</span>
                            <span
                              className={`text-sm font-medium ${item.balance >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              R$ {item.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-green-600">
                                Receitas: R$ {item.income.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </span>
                              <span className="text-red-600">
                                Despesas: R$ {item.expenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Relatórios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Crown className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
                  <h3 className="text-lg font-semibold mb-2">Recurso Premium</h3>
                  <p className="text-gray-600 mb-4">Gere relatórios detalhados em PDF e Excel com análises avançadas</p>
                  <Button onClick={() => setShowPremiumModal(true)}>
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade para Premium
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import">
            <FileImport user={user} onImportComplete={loadTransactions} />
          </TabsContent>
        </Tabs>

        {/* Modal de Adicionar/Editar Transação */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{editingTransaction ? "Editar Transação" : "Nova Transação"}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={resetForm}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="amount">Valor</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: "income" | "expense") => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="expense">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Data</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.date && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.date ? format(formData.date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.date}
                          onSelect={(date) => date && setFormData({ ...formData, date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingTransaction ? "Atualizar" : "Adicionar"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal Premium */}
        {showPremiumModal && <PremiumOverlay user={user} onClose={() => setShowPremiumModal(false)} />}
      </div>
    </div>
  )
}
