import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const supabaseUrl = "https://nsvxswjgpqcxizbqdhoy.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zdnhzd2pncHFjeGl6YnFkaG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDc1NzIsImV4cCI6MjA2NjcyMzU3Mn0.3H-xp0EOYtO5M4GiDWs_tenRtk3aLukpzfhyAwlu4nI"
const supabase = createClient(supabaseUrl, supabaseKey)

// Token de verificação do WhatsApp
const VERIFY_TOKEN = "seu_token_secreto_123"
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN

interface WhatsAppMessage {
  from: string
  id: string
  timestamp: string
  text?: {
    body: string
  }
  audio?: {
    id: string
    mime_type: string
  }
  type: "text" | "audio"
}

// Função para processar texto com IA
async function processTransactionText(text: string): Promise<{
  amount: number
  category: string
  type: "income" | "expense" | "investment"
  description: string
  confidence: number
}> {
  console.log("🔍 Processando texto:", text)

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

  // Palavras-chave para categorização
  const categories = {
    // GASTOS
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
      ],
      Transporte: ["uber", "taxi", "gasolina", "combustivel", "onibus", "metro", "passagem", "estacionamento"],
      Roupas: ["roupa", "tenis", "sapato", "camisa", "calca", "vestido", "blusa", "shorts", "calcado"],
      Saúde: ["farmacia", "remedio", "medico", "consulta", "exame", "dentista", "hospital"],
      Lazer: ["cinema", "show", "festa", "viagem", "hotel", "diversao", "jogo"],
      Moradia: ["aluguel", "condominio", "luz", "agua", "gas", "internet", "telefone"],
      Educação: ["curso", "livro", "escola", "faculdade", "aula"],
      Outros: [],
    },
    // RECEITAS
    income: {
      Salário: ["salario", "vencimento", "pagamento", "folha"],
      Freelance: ["freelance", "freela", "trabalho", "servico", "consultoria"],
      Vendas: ["venda", "vendeu", "vendi"],
      Outros: [],
    },
    // INVESTIMENTOS
    investment: {
      Banco: ["poupanca", "aplicacao", "investimento", "banco"],
      Corretora: ["acao", "acoes", "bolsa", "fundo"],
      Outros: [],
    },
  }

  // Detectar tipo e categoria
  let detectedType: "income" | "expense" | "investment" = "expense"
  let detectedCategory = "Outros"
  let confidence = 0.5

  // Verificar palavras de receita
  if (
    normalizedText.includes("recebi") ||
    normalizedText.includes("ganhei") ||
    normalizedText.includes("salario") ||
    normalizedText.includes("freelance")
  ) {
    detectedType = "income"
    confidence = 0.8
  }

  // Verificar palavras de investimento
  if (
    normalizedText.includes("investi") ||
    normalizedText.includes("aplicacao") ||
    normalizedText.includes("poupanca")
  ) {
    detectedType = "investment"
    confidence = 0.8
  }

  // Encontrar categoria mais provável
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

// Função para buscar usuário pelo WhatsApp
async function findUserByWhatsApp(whatsappNumber: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("whatsapp_number", whatsappNumber)
    .single()

  if (error) {
    console.log("Usuário não encontrado pelo WhatsApp:", whatsappNumber)
    return null
  }

  return data
}

// Função para salvar transação
async function saveTransaction(userId: string, transactionData: any) {
  const transaction = {
    id: Date.now().toString(),
    user_id: userId,
    date: new Date().toISOString().split("T")[0],
    category: transactionData.category,
    amount: transactionData.amount,
    type: transactionData.type,
    description: transactionData.description,
    source: "whatsapp",
  }

  const { error } = await supabase.from("transactions").insert([transaction])

  return !error
}

// Função para enviar mensagem no WhatsApp
async function sendWhatsAppMessage(to: string, message: string) {
  if (!WHATSAPP_TOKEN) {
    console.log("Token do WhatsApp não configurado")
    return
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: message },
      }),
    })

    const result = await response.json()
    console.log("Mensagem enviada:", result)
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error)
  }
}

// Função para processar áudio (transcrição)
async function transcribeAudio(audioId: string): Promise<string> {
  // Aqui você integraria com um serviço de transcrição como:
  // - OpenAI Whisper API
  // - Google Speech-to-Text
  // - Azure Speech Services

  // Por enquanto, simulação
  console.log("🎤 Transcrevendo áudio:", audioId)

  // Exemplo de integração com OpenAI Whisper
  try {
    // Baixar áudio do WhatsApp
    const audioResponse = await fetch(`https://graph.facebook.com/v18.0/${audioId}`, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      },
    })

    // Enviar para transcrição (implementar conforme serviço escolhido)
    return "Comprei um tênis hoje por 450 reais" // Simulação
  } catch (error) {
    console.error("Erro na transcrição:", error)
    return ""
  }
}

// Webhook do WhatsApp
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("📱 Webhook WhatsApp recebido:", JSON.stringify(body, null, 2))

    // Verificar se é uma mensagem
    if (body.entry?.[0]?.changes?.[0]?.value?.messages) {
      const message: WhatsAppMessage = body.entry[0].changes[0].value.messages[0]
      const senderNumber = message.from

      console.log("📨 Mensagem de:", senderNumber)

      // Buscar usuário
      const user = await findUserByWhatsApp(senderNumber)
      if (!user) {
        await sendWhatsAppMessage(
          senderNumber,
          "❌ Número não cadastrado. Acesse o app e vincule seu WhatsApp nas configurações.",
        )
        return NextResponse.json({ status: "user_not_found" })
      }

      let messageText = ""

      // Processar texto ou áudio
      if (message.type === "text" && message.text) {
        messageText = message.text.body
      } else if (message.type === "audio" && message.audio) {
        messageText = await transcribeAudio(message.audio.id)
        if (!messageText) {
          await sendWhatsAppMessage(
            senderNumber,
            "❌ Não consegui entender o áudio. Tente enviar novamente ou digite a informação.",
          )
          return NextResponse.json({ status: "transcription_failed" })
        }
      }

      if (!messageText) {
        await sendWhatsAppMessage(senderNumber, "❌ Tipo de mensagem não suportado. Envie texto ou áudio.")
        return NextResponse.json({ status: "unsupported_message" })
      }

      // Processar transação
      const transactionData = await processTransactionText(messageText)

      if (transactionData.amount <= 0) {
        await sendWhatsAppMessage(
          senderNumber,
          "❌ Não consegui identificar o valor. Exemplo: 'Comprei tênis por 450 reais'",
        )
        return NextResponse.json({ status: "no_amount_found" })
      }

      // Salvar transação
      const saved = await saveTransaction(user.id, transactionData)

      if (saved) {
        const typeEmoji = transactionData.type === "income" ? "💰" : transactionData.type === "investment" ? "📈" : "💸"

        const typeText =
          transactionData.type === "income"
            ? "Receita"
            : transactionData.type === "investment"
              ? "Investimento"
              : "Gasto"

        const responseMessage = `✅ ${typeEmoji} *Adicionado com sucesso!*

${typeText}: R$ ${transactionData.amount.toFixed(2).replace(".", ",")}
Categoria: ${transactionData.category}
Data: Hoje
${transactionData.confidence < 0.7 ? "\n⚠️ Verifique a categoria no app" : ""}`

        await sendWhatsAppMessage(senderNumber, responseMessage)
      } else {
        await sendWhatsAppMessage(senderNumber, "❌ Erro ao salvar. Tente novamente em alguns instantes.")
      }
    }

    return NextResponse.json({ status: "success" })
  } catch (error) {
    console.error("Erro no webhook:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

// Verificação do webhook (GET)
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const mode = url.searchParams.get("hub.mode")
  const token = url.searchParams.get("hub.verify_token")
  const challenge = url.searchParams.get("hub.challenge")

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verificado com sucesso!")
    return new NextResponse(challenge)
  }

  return new NextResponse("Forbidden", { status: 403 })
}
