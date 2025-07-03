"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageCircle, Send, Bot, User, CheckCircle, Mic, Type } from "lucide-react"

interface WhatsAppSimulatorProps {
  user: any
  onAddTransaction: (transaction: any) => void
}

interface SimulatedMessage {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
  processed?: boolean
}

export default function WhatsAppSimulator({ user, onAddTransaction }: WhatsAppSimulatorProps) {
  const [messages, setMessages] = useState<SimulatedMessage[]>([
    {
      id: "1",
      text: "🤖 Olá! Sou seu assistente financeiro. Envie suas transações que eu adiciono automaticamente!",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Função para processar texto e extrair transação (mesma lógica do webhook)
  const processTransactionText = (text: string) => {
    console.log("🔍 Processando mensagem:", text)

    const normalizedText = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()

    // Extrair valor
    const valueMatches = text.match(/(\d+[.,]?\d*)/g)
    let amount = 0

    if (valueMatches) {
      const lastValue = valueMatches[valueMatches.length - 1]
      amount = Number.parseFloat(lastValue.replace(",", "."))
    }

    // Categorização inteligente
    const categories = {
      expense: {
        Alimentação: [
          "mercado",
          "supermercado",
          "comida",
          "lanche",
          "restaurante",
          "ifood",
          "delivery",
          "pizza",
          "hamburguer",
          "cafe",
          "padaria",
          "almoco",
          "jantar",
          "pao",
          "leite",
          "carne",
          "fruta",
          "verdura",
        ],
        Transporte: [
          "uber",
          "taxi",
          "gasolina",
          "combustivel",
          "onibus",
          "metro",
          "passagem",
          "estacionamento",
          "posto",
          "alcool",
          "etanol",
        ],
        Roupas: [
          "roupa",
          "tenis",
          "sapato",
          "camisa",
          "calca",
          "vestido",
          "blusa",
          "shorts",
          "calcado",
          "bermuda",
          "camiseta",
        ],
        Saúde: ["farmacia", "remedio", "medico", "consulta", "exame", "dentista", "hospital", "medicamento"],
        Lazer: ["cinema", "show", "festa", "viagem", "hotel", "diversao", "jogo", "parque", "teatro"],
        Moradia: ["aluguel", "condominio", "luz", "agua", "gas", "internet", "telefone", "energia", "conta"],
        Outros: [],
      },
      income: {
        Salário: ["salario", "vencimento", "pagamento", "folha"],
        Freelance: ["freelance", "freela", "trabalho", "servico", "consultoria"],
        Vendas: ["venda", "vendeu", "vendi"],
        Outros: [],
      },
      investment: {
        Banco: ["poupanca", "aplicacao", "investimento", "banco"],
        Corretora: ["acao", "acoes", "bolsa", "fundo"],
        Outros: [],
      },
    }

    // Detectar tipo
    let detectedType: "income" | "expense" | "investment" = "expense"
    let detectedCategory = "Outros"
    let confidence = 0.5

    // Verificar receitas
    if (
      normalizedText.includes("recebi") ||
      normalizedText.includes("ganhei") ||
      normalizedText.includes("salario") ||
      normalizedText.includes("freelance") ||
      normalizedText.includes("pagamento")
    ) {
      detectedType = "income"
      confidence = 0.8
    }

    // Verificar investimentos
    if (
      normalizedText.includes("investi") ||
      normalizedText.includes("aplicacao") ||
      normalizedText.includes("poupanca")
    ) {
      detectedType = "investment"
      confidence = 0.8
    }

    // Encontrar categoria
    for (const [category, keywords] of Object.entries(categories[detectedType])) {
      for (const keyword of keywords) {
        if (normalizedText.includes(keyword)) {
          detectedCategory = category
          confidence = Math.max(confidence, 0.9)
          break
        }
      }
      if (confidence >= 0.9) break
    }

    return {
      amount,
      category: detectedCategory,
      type: detectedType,
      description: text.substring(0, 100),
      confidence,
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: SimulatedMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsProcessing(true)

    // Simular processamento
    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      const transactionData = processTransactionText(inputMessage)

      if (transactionData.amount <= 0) {
        // Resposta de erro
        const errorMessage: SimulatedMessage = {
          id: (Date.now() + 1).toString(),
          text: "❌ Não consegui identificar o valor. Tente algo como: 'Comprei tênis por 450 reais'",
          sender: "bot",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      } else {
        // Criar transação
        const newTransaction = {
          id: Date.now().toString(),
          date: new Date().toISOString().split("T")[0],
          category: transactionData.category,
          amount: transactionData.amount,
          type: transactionData.type,
          user_id: user?.id,
          source: "whatsapp_simulator",
          description: transactionData.description,
        }

        // Adicionar transação
        onAddTransaction(newTransaction)

        // Resposta de sucesso
        const typeEmoji = transactionData.type === "income" ? "💰" : transactionData.type === "investment" ? "📈" : "💸"

        const typeText =
          transactionData.type === "income"
            ? "Receita"
            : transactionData.type === "investment"
              ? "Investimento"
              : "Gasto"

        const successMessage: SimulatedMessage = {
          id: (Date.now() + 1).toString(),
          text: `✅ ${typeEmoji} *Adicionado com sucesso!*

${typeText}: R$ ${transactionData.amount.toFixed(2).replace(".", ",")}
Categoria: ${transactionData.category}
Data: Hoje
${transactionData.confidence < 0.7 ? "\n⚠️ Verifique a categoria no app" : ""}`,
          sender: "bot",
          timestamp: new Date(),
          processed: true,
        }

        setMessages((prev) => [...prev, successMessage])
      }
    } catch (error) {
      const errorMessage: SimulatedMessage = {
        id: (Date.now() + 1).toString(),
        text: "❌ Erro ao processar. Tente novamente em alguns instantes.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    }

    setIsProcessing(false)
  }

  const sendQuickMessage = (message: string) => {
    setInputMessage(message)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader style={{ backgroundColor: "#25D366" }}>
        <CardTitle className="flex items-center gap-2 text-white text-sm sm:text-xl">
          <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          Simulador WhatsApp - Teste
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Chat Area */}
        <div className="h-80 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === "user"
                      ? "bg-blue-500 text-white"
                      : message.processed
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-white text-gray-800 border border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.sender === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                    <span className="text-xs opacity-75">{message.sender === "user" ? "Você" : "Bot Financeiro"}</span>
                  </div>
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p className="text-xs opacity-75 mt-1">{formatTime(message.timestamp)}</p>
                  {message.processed && (
                    <div className="flex items-center gap-1 mt-2">
                      <CheckCircle className="h-3 w-3" />
                      <span className="text-xs">Transação adicionada!</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                    <span className="text-sm">Processando...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Messages */}
        <div className="p-3 bg-white border-t">
          <Label className="text-xs text-gray-600 mb-2 block">💡 Mensagens rápidas:</Label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Button
              onClick={() => sendQuickMessage("Comprei pão por 8 reais")}
              variant="outline"
              size="sm"
              className="text-xs h-8 bg-transparent"
            >
              🍞 Pão R$ 8
            </Button>
            <Button
              onClick={() => sendQuickMessage("Almocei no restaurante 45 reais")}
              variant="outline"
              size="sm"
              className="text-xs h-8 bg-transparent"
            >
              🍽️ Almoço R$ 45
            </Button>
            <Button
              onClick={() => sendQuickMessage("Recebi freelance 800 reais")}
              variant="outline"
              size="sm"
              className="text-xs h-8 bg-transparent"
            >
              💰 Freelance R$ 800
            </Button>
            <Button
              onClick={() => sendQuickMessage("Investi 200 na poupança")}
              variant="outline"
              size="sm"
              className="text-xs h-8 bg-transparent"
            >
              📈 Poupança R$ 200
            </Button>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Digite sua transação..."
                className="border-gray-300 focus:border-[#25D366] focus:ring-[#25D366]"
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                disabled={isProcessing}
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isProcessing}
              style={{ backgroundColor: "#25D366", color: "white" }}
              className="hover:opacity-90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Type className="h-3 w-3" />
              <span>Texto</span>
            </div>
            <div className="flex items-center gap-1">
              <Mic className="h-3 w-3" />
              <span>Áudio (em breve)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
