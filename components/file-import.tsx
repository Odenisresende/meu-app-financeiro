"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, Camera, Brain, CheckCircle, AlertCircle } from "lucide-react"

interface ImportedTransaction {
  date: string
  description: string
  amount: number
  type: "income" | "expense" | "investment"
  category: string
  confidence?: number
}

interface FileImportProps {
  onImportTransactions: (transactions: any[]) => void
}

export default function FileImport({ onImportTransactions }: FileImportProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // Função para normalizar texto (remover acentos, converter para minúsculo)
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^\w\s]/g, " ") // Remove pontuação
      .replace(/\s+/g, " ") // Remove espaços extras
      .trim()
  }

  // Categorização MUITO melhorada baseada em padrões brasileiros
  const categorizeTransaction = (
    description: string,
    amount: number,
  ): { category: string; type: "income" | "expense" | "investment"; confidence: number } => {
    const originalDesc = description
    const desc = normalizeText(description)

    console.log("🔍 Categorizando:", originalDesc)
    console.log("📝 Texto normalizado:", desc)
    console.log("💰 Valor:", amount)

    // Padrões MUITO específicos para RECEITAS
    const incomePatterns = [
      {
        keywords: [
          "salario",
          "salário",
          "vencimento",
          "remuneracao",
          "pagamento recebido",
          "credito salario",
          "folha pagamento",
          "13 salario",
          "decimo terceiro",
        ],
        category: "Salário",
        confidence: 0.95,
      },
      {
        keywords: [
          "pix recebido",
          "transferencia recebida",
          "ted recebido",
          "doc recebido",
          "deposito",
          "credito conta",
          "entrada pix",
        ],
        category: "Transferência Recebida",
        confidence: 0.9,
      },
      {
        keywords: ["freelance", "freela", "consultoria", "servico prestado", "honorarios", "trabalho autonomo"],
        category: "Freelance",
        confidence: 0.9,
      },
      {
        keywords: ["venda", "vendas", "comissao", "comissão", "receita vendas", "faturamento"],
        category: "Vendas",
        confidence: 0.85,
      },
      {
        keywords: ["restituicao", "reembolso", "devolucao", "estorno", "cashback"],
        category: "Reembolso",
        confidence: 0.8,
      },
    ]

    // Padrões MUITO específicos para GASTOS
    const expensePatterns = [
      {
        keywords: [
          // Alimentação - muito específico
          "mercado",
          "supermercado",
          "padaria",
          "acougue",
          "hortifruti",
          "restaurante",
          "lanchonete",
          "pizzaria",
          "hamburgueria",
          "ifood",
          "uber eats",
          "rappi",
          "delivery",
          "food",
          "lanches",
          "cafe",
          "bar",
          "pub",
          "sorveteria",
          "doceria",
          "confeitaria",
          "pao de acucar",
          "carrefour",
          "extra",
          "walmart",
          "big",
          "atacadao",
          "makro",
          "sam s club",
          "costco",
        ],
        category: "Alimentação",
        confidence: 0.95,
      },
      {
        keywords: [
          // Transporte - muito específico
          "uber",
          "99",
          "taxi",
          "cabify",
          "combustivel",
          "gasolina",
          "etanol",
          "diesel",
          "posto",
          "shell",
          "petrobras",
          "ipiranga",
          "ale",
          "br",
          "esso",
          "transporte",
          "onibus",
          "metro",
          "trem",
          "passagem",
          "bilhete unico",
          "cartao transporte",
          "estacionamento",
          "zona azul",
          "pedagio",
          "vinheta",
          "multa transito",
          "detran",
          "renavam",
          "ipva",
          "seguro veiculo",
          "manutencao carro",
          "oficina",
          "mecanico",
          "pneu",
          "oleo",
        ],
        category: "Transporte",
        confidence: 0.95,
      },
      {
        keywords: [
          // Moradia - muito específico
          "aluguel",
          "condominio",
          "energia",
          "luz",
          "eletricidade",
          "cemig",
          "copel",
          "celpe",
          "coelba",
          "enel",
          "agua",
          "saneamento",
          "sabesp",
          "cedae",
          "copasa",
          "gas",
          "comgas",
          "liquigas",
          "ultragaz",
          "internet",
          "wifi",
          "banda larga",
          "vivo",
          "tim",
          "claro",
          "oi",
          "net",
          "sky",
          "telefone",
          "celular",
          "mobile",
          "iptu",
          "condominio",
          "administradora",
          "zelador",
          "porteiro",
          "limpeza",
          "seguranca",
          "reforma",
          "construcao",
          "material construcao",
          "tinta",
          "cimento",
          "tijolo",
        ],
        category: "Moradia",
        confidence: 0.95,
      },
      {
        keywords: [
          // Saúde - muito específico
          "farmacia",
          "drogaria",
          "droga raia",
          "drogasil",
          "pacheco",
          "extrafarma",
          "hospital",
          "clinica",
          "medico",
          "doutor",
          "dr",
          "dra",
          "consulta",
          "exame",
          "laboratorio",
          "raio x",
          "ultrassom",
          "ressonancia",
          "tomografia",
          "dentista",
          "odontologia",
          "ortodontia",
          "fisioterapia",
          "psicologia",
          "terapia",
          "remedio",
          "medicamento",
          "vitamina",
          "suplemento",
          "plano saude",
          "unimed",
          "bradesco saude",
          "amil",
          "sulamerica",
          "golden cross",
          "hapvida",
        ],
        category: "Saúde",
        confidence: 0.95,
      },
      {
        keywords: [
          // Educação
          "escola",
          "colegio",
          "faculdade",
          "universidade",
          "curso",
          "aula",
          "professor",
          "mensalidade",
          "anuidade",
          "material escolar",
          "livro",
          "apostila",
          "caderno",
          "educacao",
          "ensino",
          "graduacao",
          "pos graduacao",
          "mestrado",
          "doutorado",
          "idioma",
          "ingles",
          "espanhol",
          "frances",
          "wizard",
          "ccaa",
          "cultura inglesa",
          "fisk",
        ],
        category: "Educação",
        confidence: 0.9,
      },
      {
        keywords: [
          // Lazer
          "cinema",
          "teatro",
          "show",
          "concerto",
          "festival",
          "evento",
          "ingresso",
          "ticket",
          "viagem",
          "hotel",
          "pousada",
          "resort",
          "booking",
          "airbnb",
          "decolar",
          "latam",
          "gol",
          "azul",
          "tam",
          "passagem aerea",
          "turismo",
          "lazer",
          "diversao",
          "festa",
          "balada",
          "clube",
          "academia",
          "ginastica",
          "musculacao",
          "personal",
          "smart fit",
          "bio ritmo",
          "netflix",
          "spotify",
          "amazon prime",
          "disney plus",
          "globoplay",
          "youtube premium",
          "streaming",
        ],
        category: "Lazer",
        confidence: 0.9,
      },
      {
        keywords: [
          // Roupas e Beleza
          "roupa",
          "vestuario",
          "camisa",
          "calca",
          "vestido",
          "sapato",
          "tenis",
          "sandalia",
          "calcado",
          "loja",
          "shopping",
          "magazine",
          "lojas americanas",
          "casas bahia",
          "ponto frio",
          "renner",
          "c a",
          "zara",
          "h m",
          "riachuelo",
          "marisa",
          "beleza",
          "cabelo",
          "salao",
          "barbearia",
          "manicure",
          "pedicure",
          "estetica",
          "cosmetico",
          "perfume",
          "maquiagem",
          "shampoo",
          "condicionador",
          "creme",
        ],
        category: "Roupas",
        confidence: 0.9,
      },
      {
        keywords: [
          // Cartão e Pagamentos
          "cartao credito",
          "cartao debito",
          "anuidade",
          "tarifa",
          "juros",
          "financiamento",
          "emprestimo",
          "crediario",
          "parcelamento",
          "prestacao",
          "fatura",
          "pagamento cartao",
          "visa",
          "mastercard",
          "elo",
          "american express",
          "hipercard",
        ],
        category: "Cartão",
        confidence: 0.85,
      },
      {
        keywords: [
          "pix enviado",
          "transferencia enviada",
          "ted enviado",
          "doc enviado",
          "saque",
          "retirada",
          "debito conta",
          "pagamento",
          "quitacao",
        ],
        category: "Transferência",
        confidence: 0.8,
      },
    ]

    // Padrões para INVESTIMENTOS
    const investmentPatterns = [
      {
        keywords: [
          "aplicacao",
          "investimento",
          "poupanca",
          "cdb",
          "lci",
          "lca",
          "tesouro direto",
          "tesouro",
          "selic",
          "prefixado",
          "ipca",
          "renda fixa",
          "fundo investimento",
          "previdencia",
          "vgbl",
          "pgbl",
        ],
        category: "Banco",
        confidence: 0.9,
      },
      {
        keywords: [
          "corretora",
          "acao",
          "acoes",
          "bolsa",
          "bovespa",
          "b3",
          "clear",
          "rico",
          "xp",
          "btg",
          "inter",
          "nubank",
          "easynvest",
          "avenue",
          "passfolio",
        ],
        category: "Corretora",
        confidence: 0.9,
      },
      {
        keywords: [
          "bitcoin",
          "btc",
          "ethereum",
          "eth",
          "crypto",
          "criptomoeda",
          "binance",
          "coinbase",
          "mercado bitcoin",
        ],
        category: "Criptomoedas",
        confidence: 0.85,
      },
    ]

    // 1. VERIFICAR RECEITAS PRIMEIRO
    for (const pattern of incomePatterns) {
      for (const keyword of pattern.keywords) {
        if (desc.includes(keyword)) {
          console.log("✅ RECEITA detectada:", pattern.category, "- palavra:", keyword)
          return { category: pattern.category, type: "income", confidence: pattern.confidence }
        }
      }
    }

    // 2. VERIFICAR INVESTIMENTOS
    for (const pattern of investmentPatterns) {
      for (const keyword of pattern.keywords) {
        if (desc.includes(keyword)) {
          console.log("💰 INVESTIMENTO detectado:", pattern.category, "- palavra:", keyword)
          return { category: pattern.category, type: "investment", confidence: pattern.confidence }
        }
      }
    }

    // 3. VERIFICAR GASTOS (mais detalhado)
    for (const pattern of expensePatterns) {
      for (const keyword of pattern.keywords) {
        if (desc.includes(keyword)) {
          console.log("💸 GASTO detectado:", pattern.category, "- palavra:", keyword)
          return { category: pattern.category, type: "expense", confidence: pattern.confidence }
        }
      }
    }

    // 4. LÓGICA BASEADA NO VALOR E CONTEXTO
    console.log("🤔 Nenhuma palavra-chave encontrada, usando lógica de valor...")

    // Se tem palavras como "credito", "entrada", "recebido" - provavelmente receita
    if (
      desc.includes("credito") ||
      desc.includes("entrada") ||
      desc.includes("recebido") ||
      desc.includes("deposito")
    ) {
      console.log("💚 Classificado como RECEITA por contexto")
      return { category: "Outros", type: "income", confidence: 0.6 }
    }

    // Se tem palavras como "debito", "pagamento", "compra" - provavelmente gasto
    if (desc.includes("debito") || desc.includes("pagamento") || desc.includes("compra") || desc.includes("saque")) {
      console.log("💸 Classificado como GASTO por contexto")
      return { category: "Outros", type: "expense", confidence: 0.6 }
    }

    // Lógica baseada no valor
    if (amount < 0) {
      console.log("💸 Valor negativo - classificando como GASTO")
      return { category: "Outros", type: "expense", confidence: 0.7 }
    } else if (amount > 1000) {
      console.log("💚 Valor alto positivo - pode ser RECEITA")
      return { category: "Outros", type: "income", confidence: 0.5 }
    } else {
      console.log("💸 Valor baixo positivo - provavelmente GASTO")
      return { category: "Outros", type: "expense", confidence: 0.4 }
    }
  }

  // Parser melhorado para CSV - Suporte ao formato C6 Bank
  const parseCSV = (content: string): ImportedTransaction[] => {
    const lines = content.split("\n").filter((line) => line.trim())
    const transactions: ImportedTransaction[] = []

    console.log("=== ANÁLISE DO CSV ===")
    console.log("Conteúdo:", content.substring(0, 500))

    // Detectar separador (vírgula ou ponto e vírgula)
    const separator = content.includes(";") ? ";" : ","
    console.log("Separador detectado:", separator)

    // Pular cabeçalho se existir
    let startIndex = 0
    if (lines.length > 0) {
      const firstLine = lines[0].toLowerCase()
      if (
        firstLine.includes("data") ||
        firstLine.includes("date") ||
        firstLine.includes("valor") ||
        firstLine.includes("descri") ||
        firstLine.includes("entrada") ||
        firstLine.includes("saida")
      ) {
        startIndex = 1
        console.log("Cabeçalho detectado, pulando primeira linha")
      }
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      console.log(`\n🔍 Processando linha ${i}: "${line}"`)

      // Dividir por separador e limpar aspas
      const columns = line.split(separator).map((col) => col.replace(/"/g, "").trim())
      console.log("📊 Colunas:", columns)

      if (columns.length >= 3) {
        try {
          let dateStr = ""
          let description = ""
          let amountStr = ""
          let isExpense = true

          // Detectar formato C6 Bank (7 colunas)
          if (columns.length >= 7) {
            console.log("🏦 Formato C6 Bank detectado!")
            dateStr = columns[0] // Data Lançamento
            const title = columns[2] // Título
            const desc = columns[3] // Descrição
            const entrada = columns[4] // Entrada (R$)
            const saida = columns[5] // Saída (R$)

            description = `${title} - ${desc}`.trim().replace(" - ", " ")

            // Se tem valor na entrada, é receita
            if (entrada && entrada !== "0" && entrada !== "0.00" && entrada !== "0,00") {
              amountStr = entrada
              isExpense = false
              console.log("💚 Receita detectada - Entrada:", entrada)
            }
            // Se tem valor na saída, é gasto
            else if (saida && saida !== "0" && saida !== "0.00" && saida !== "0,00") {
              amountStr = saida
              isExpense = true
              console.log("💸 Gasto detectado - Saída:", saida)
            }
            // Se não tem nem entrada nem saída, pular
            else {
              console.log("⚠️ Linha sem valor válido, pulando")
              continue
            }
          }
          // Formato genérico (3 colunas: Data, Descrição, Valor)
          else if (columns.length >= 3) {
            console.log("📄 Formato genérico detectado")
            dateStr = columns[0]
            description = columns[1] || "Transação importada"
            amountStr = columns[2]

            // Se a primeira coluna não parece data, tentar outros formatos
            if (!dateStr.match(/\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/)) {
              if (columns[1] && columns[1].match(/\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/)) {
                description = columns[0]
                dateStr = columns[1]
                amountStr = columns[2]
              }
            }
          }

          console.log("📝 Extraído - Data:", dateStr, "Descrição:", description, "Valor:", amountStr)

          // Limpar e converter valor - FORMATO BRASILEIRO
          let cleanAmount = amountStr.trim()
          console.log("💰 Valor original:", amountStr)

          // Remover símbolos de moeda e espaços
          cleanAmount = cleanAmount.replace(/[R$\s]/g, "")

          // Detectar formato brasileiro vs americano
          if (cleanAmount.includes(",") && cleanAmount.includes(".")) {
            // Formato: 1.234.567,89 (brasileiro) - ponto para milhares, vírgula para decimais
            if (cleanAmount.lastIndexOf(",") > cleanAmount.lastIndexOf(".")) {
              cleanAmount = cleanAmount.replace(/\./g, "").replace(",", ".")
            } else {
              // Formato: 1,234,567.89 (americano) - vírgula para milhares, ponto para decimais
              cleanAmount = cleanAmount.replace(/,/g, "")
            }
          } else if (cleanAmount.includes(",")) {
            // Só tem vírgula - decimal brasileiro (123,45)
            const parts = cleanAmount.split(",")
            if (parts.length === 2 && parts[1].length <= 2) {
              cleanAmount = cleanAmount.replace(",", ".")
            } else {
              cleanAmount = cleanAmount.replace(/,/g, "")
            }
          } else if (cleanAmount.includes(".")) {
            // Só tem ponto - pode ser decimal americano (123.45) ou milhares brasileiro (1.234)
            const parts = cleanAmount.split(".")
            if (parts.length === 2 && parts[1].length <= 2) {
              // Decimal americano: manter
            } else {
              // Milhares brasileiro: remover pontos
              cleanAmount = cleanAmount.replace(/\./g, "")
            }
          }

          // Remover qualquer caractere que não seja número, ponto ou sinal
          cleanAmount = cleanAmount.replace(/[^\d.-]/g, "")

          const amount = Number.parseFloat(cleanAmount)
          console.log("💲 Valor limpo:", cleanAmount, "Valor convertido:", amount)

          if (!isNaN(amount) && dateStr && Math.abs(amount) > 0) {
            // Converter data para formato YYYY-MM-DD
            let date = ""
            if (dateStr.includes("/")) {
              const parts = dateStr.split("/")
              if (parts.length === 3) {
                const day = parts[0].padStart(2, "0")
                const month = parts[1].padStart(2, "0")
                let year = parts[2]
                if (year.length === 2) {
                  year = "20" + year
                }
                date = `${year}-${month}-${day}`
              }
            } else if (dateStr.includes("-")) {
              const parts = dateStr.split("-")
              if (parts.length === 3) {
                if (parts[0].length === 4) {
                  date = dateStr
                } else {
                  date = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`
                }
              }
            }

            console.log("📅 Data convertida:", date)

            if (date) {
              // Categorização MELHORADA baseada na descrição e tipo (entrada/saída)
              const categorization = categorizeTransaction(description, isExpense ? -amount : amount)

              // Para formato C6 Bank, usar a informação de entrada/saída com mais confiança
              if (columns.length >= 7) {
                if (isExpense) {
                  categorization.type = "expense"
                } else {
                  categorization.type = "income"
                }
                categorization.confidence = Math.max(0.8, categorization.confidence)
                console.log("🏦 C6 Bank - Tipo ajustado:", categorization.type)
              }

              transactions.push({
                date,
                description: description || "Transação importada",
                amount: Math.abs(amount),
                type: categorization.type,
                category: categorization.category,
                confidence: categorization.confidence,
              })

              console.log("✅ Transação adicionada:", {
                date,
                description,
                amount: Math.abs(amount),
                type: categorization.type,
                category: categorization.category,
                confidence: categorization.confidence,
              })
            }
          }
        } catch (error) {
          console.error("❌ Erro ao processar linha:", line, error)
        }
      }
    }

    console.log(`\n🎉 === RESULTADO ===`)
    console.log(`${transactions.length} transações processadas`)
    return transactions
  }

  // Simulação de OCR (em produção, usaria Google Vision API ou similar)
  const simulateOCR = (file: File): Promise<ImportedTransaction[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simular extração de dados de um comprovante
        const mockTransactions: ImportedTransaction[] = [
          {
            date: new Date().toISOString().split("T")[0],
            description: `Comprovante ${file.name}`,
            amount: Math.random() * 200 + 10,
            type: "expense",
            category: "Outros",
            confidence: 0.7,
          },
        ]
        resolve(mockTransactions)
      }, 2000)
    })
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setResult(null)

    try {
      let transactions: ImportedTransaction[] = []

      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        // Processar CSV
        const content = await file.text()
        transactions = parseCSV(content)
      } else if (file.type.startsWith("image/")) {
        // Processar imagem com OCR
        transactions = await simulateOCR(file)
      } else {
        alert("Formato não suportado. Use CSV ou imagens (JPG, PNG)")
        setIsProcessing(false)
        return
      }

      onImportTransactions(transactions)
      setResult({
        success: true,
        message: "Arquivo importado com sucesso!",
        count: transactions.length,
      })
    } catch (error) {
      console.error("Erro ao processar arquivo:", error)
      alert("Erro ao processar arquivo. Verifique o formato.")
    } finally {
      setIsProcessing(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setResult(null)

    try {
      // Simular OCR de comprovante
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Dados de exemplo extraídos do comprovante
      const extractedTransaction = {
        description: "Posto de Gasolina Shell",
        amount: -89.9,
        category: "Transporte",
        type: "expense",
        date: new Date().toISOString().split("T")[0],
      }

      onImportTransactions([extractedTransaction])
      setResult({
        success: true,
        message: "Comprovante processado com IA!",
        count: 1,
      })
    } catch (error) {
      setResult({
        success: false,
        message: "Erro ao processar imagem. Tente com uma foto mais nítida.",
      })
    } finally {
      setIsProcessing(false)
      if (imageInputRef.current) {
        imageInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Resultado */}
      {result && (
        <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          {result.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
            {result.message}
            {result.success && result.count && (
              <span className="block mt-1 font-medium">{result.count} transação(ões) adicionada(s)</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Importação CSV */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: "#152638" }}>
              <FileText className="h-5 w-5" />
              Importar CSV/OFX
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Importe extratos bancários em formato CSV ou OFX diretamente do seu banco.
            </p>

            <div className="space-y-2">
              <h4 className="font-medium text-sm" style={{ color: "#152638" }}>
                Formatos suportados:
              </h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• CSV (Comma Separated Values)</li>
                <li>• OFX (Open Financial Exchange)</li>
                <li>• Extratos do Banco do Brasil, Itaú, Bradesco</li>
                <li>• Nubank, Inter, C6 Bank</li>
              </ul>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.ofx,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full"
              style={{ backgroundColor: "#DDC067", color: "#152638" }}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#152638] mr-2"></div>
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar Arquivo
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* OCR de Comprovantes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: "#152638" }}>
              <Camera className="h-5 w-5" />
              OCR de Comprovantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Fotografe recibos e comprovantes para extrair dados automaticamente com IA.
            </p>

            <div className="space-y-2">
              <h4 className="font-medium text-sm" style={{ color: "#152638" }}>
                Tipos aceitos:
              </h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Recibos de compras</li>
                <li>• Comprovantes de pagamento</li>
                <li>• Notas fiscais</li>
                <li>• Faturas de cartão</li>
              </ul>
            </div>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              className="hidden"
            />

            <Button
              onClick={() => imageInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full"
              style={{ backgroundColor: "#DDC067", color: "#152638" }}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#152638] mr-2"></div>
                  <Brain className="h-4 w-4 mr-2" />
                  Processando com IA...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Fotografar Comprovante
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Dicas */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2" style={{ color: "#152638" }}>
            💡 Dicas para melhor resultado:
          </h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>
              • <strong>CSV:</strong> Certifique-se que o arquivo tem colunas: Data, Descrição, Valor
            </li>
            <li>
              • <strong>OCR:</strong> Fotografe com boa iluminação e texto legível
            </li>
            <li>
              • <strong>Categorização:</strong> A IA aprende com seus padrões de gastos
            </li>
            <li>
              • <strong>Revisão:</strong> Sempre revise os dados importados antes de salvar
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
