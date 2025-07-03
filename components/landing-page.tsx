"use client"

import { useState, useEffect } from "react"
import {
  ArrowRight,
  CheckCircle,
  X,
  Smartphone,
  DollarSign,
  BarChart3,
  MessageCircle,
  FileText,
  Shield,
  Star,
  ChevronDown,
  ChevronUp,
  Mic,
  Bot,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function LandingPage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 23,
    seconds: 45,
  })

  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* WhatsApp Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          className="rounded-full w-14 h-14 bg-green-500 hover:bg-green-600 shadow-lg"
          onClick={() => window.open("https://wa.me/5511999999999", "_blank")}
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1E3A5F] via-[#2D5016] to-[#1E3A5F] text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center bg-[#DAA520] text-black px-4 py-2 rounded-full text-sm font-bold mb-6">
                🎤 PRIMEIRO NO BRASIL
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6">
                Pare de Perder Dinheiro Sem Saber Para Onde Vai!
                <span className="text-[#DAA520]"> Controle Total em 5 Segundos Pelo WhatsApp</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-200 mb-8 leading-relaxed">
                Transforme qualquer áudio em um relatório financeiro profissional. Análise completa por categorias,
                gráficos visuais e controle total - tudo automático.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  size="lg"
                  className="bg-[#DAA520] hover:bg-[#B8860B] text-black font-bold text-lg px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  TESTAR GRÁTIS POR 7 DIAS
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-[#1E3A5F] font-bold text-lg px-8 py-4 rounded-lg bg-transparent"
                >
                  Ver Demonstração
                </Button>
              </div>

              <p className="text-sm text-gray-300">
                ✅ Já ajudamos +2.000 brasileiros a descobrirem para onde vai cada centavo
              </p>
            </div>

            {/* Right Column - App Mockups */}
            <div className="relative">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dashboard Mockup */}
                <div className="transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <img
                    src="/app-dashboard.png"
                    alt="Dashboard do App"
                    className="rounded-2xl shadow-2xl w-full max-w-sm mx-auto"
                  />
                </div>

                {/* Analytics Mockup */}
                <div className="transform -rotate-3 hover:rotate-0 transition-transform duration-300 mt-8">
                  <img
                    src="/app-analytics.png"
                    alt="Análise por Categorias"
                    className="rounded-2xl shadow-2xl w-full max-w-sm mx-auto"
                  />
                </div>
              </div>

              {/* Floating Icons */}
              <div className="absolute -top-4 -left-4 bg-green-500 rounded-full p-3 animate-bounce">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div className="absolute top-1/2 -right-4 bg-[#DAA520] rounded-full p-3 animate-pulse">
                <Mic className="h-6 w-6 text-black" />
              </div>
              <div className="absolute -bottom-4 left-1/2 bg-[#8B2635] rounded-full p-3 animate-bounce delay-300">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Por que 87% dos Brasileiros Não Conseguem Controlar o Dinheiro?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[
              "Planilhas são chatas e complicadas",
              "Apps tradicionais são confusos e demorados",
              "Esquecem de anotar os gastos na hora",
              "Perdem tempo digitando tudo manualmente",
              "Desistem na primeira semana",
            ].map((problem, index) => (
              <div key={index} className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-sm">
                <div className="flex-shrink-0">
                  <X className="h-6 w-6 text-red-500" />
                </div>
                <p className="text-gray-700 font-medium">{problem}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-[#8B2635] to-[#B91C1C] text-white p-8 rounded-2xl text-center shadow-xl">
            <h3 className="text-2xl font-bold mb-2">Resultado:</h3>
            <p className="text-xl">70% dos brasileiros vivem no vermelho</p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              E Se Controlar o Dinheiro Fosse Tão Fácil Quanto Mandar um Áudio?
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Before */}
            <div className="bg-gray-100 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-600 mb-6 text-center">MÉTODO TRADICIONAL</h3>
              <div className="space-y-4">
                {[
                  "Abrir planilha no computador",
                  "Lembrar quanto gastou",
                  "Digitar categoria",
                  "Formatação manual",
                  "⏱️ 15 minutos por transação",
                ].map((step, index) => (
                  <div key={index} className="flex items-center gap-3 text-gray-600">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* After */}
            <div className="bg-gradient-to-br from-[#2D5016] to-[#1E3A5F] text-white p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-6 text-center">COM NOSSO APP</h3>
              <div className="space-y-4">
                {[
                  '🎤 "Gastei 250 num tênis hoje"',
                  '🤖 "Fechado, adicionado" (resposta automática)',
                  '✅ Categorizado automaticamente em "Roupas"',
                  "📊 Dashboard atualizado instantaneamente",
                  "📄 Relatório profissional com análise de 5 categorias",
                ].map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#DAA520] text-black rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-[#DAA520] text-black rounded-lg text-center font-bold text-lg">
                ⚡ 5 segundos vs 15 minutos
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Differentials Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              O Único App Que Realmente Entende o Brasileiro
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mic className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-4">🎤 Controle por Voz no WhatsApp</h3>
                <p className="text-gray-600 mb-4">"Fale naturalmente e pronto!"</p>
                <p className="text-sm text-gray-500">
                  Exemplo: "Gastei 50 reais no mercado" → Categorizado automaticamente
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bot className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-4">🤖 Inteligência Artificial Brasileira</h3>
                <p className="text-gray-600 mb-4">"Entende gírias e jeito brasileiro de falar"</p>
                <p className="text-sm text-gray-500">"Aprende seus hábitos e melhora com o tempo"</p>
              </CardContent>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Smartphone className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-4">📱 100% Feito para Celular</h3>
                <p className="text-gray-600 mb-4">"Funciona offline e sincroniza depois"</p>
                <p className="text-sm text-gray-500">"Interface mais simples que Instagram"</p>
              </CardContent>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold mb-4">💰 Preço Honesto</h3>
                <p className="text-gray-600 mb-4">"10x mais barato que consultoria financeira"</p>
                <p className="text-sm text-gray-500">"Menos que um cafezinho por dia"</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Mesmo Sendo Só um Áudio, o Relatório é de Dar Inveja nos Bancos
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* WhatsApp Conversation */}
            <div className="bg-green-50 p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-6 text-center">💬 Exemplo Real de Uso:</h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-medium">Você: "Gastei 250 num tênis hoje"</p>
                </div>
                <div className="bg-green-500 text-white p-4 rounded-lg ml-8">
                  <p>Bot: "Fechado, adicionado ✅ Categoria: Roupas"</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-medium">Você: "Recebi 700 de freelance"</p>
                </div>
                <div className="bg-green-500 text-white p-4 rounded-lg ml-8">
                  <p>Bot: "Show! Receita adicionada ✅ Categoria: Freelance"</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-medium">Você: "Relatório do mês"</p>
                </div>
                <div className="bg-green-500 text-white p-4 rounded-lg ml-8">
                  <p>Bot: "Pronto! PDF gerado 📄"</p>
                </div>
              </div>
            </div>

            {/* Results */}
            <div>
              <h3 className="text-xl font-bold mb-6">Resultado Instantâneo:</h3>
              <div className="space-y-4 mb-8">
                {[
                  "📊 5 categorias analisadas automaticamente",
                  "💰 Saldo positivo: R$ 820,00",
                  "📈 56.7% dos gastos em moradia (maior categoria)",
                  "📋 Histórico completo com 9 transações",
                  "🎯 Relatório profissional pronto para impressão",
                ].map((result, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{result}</span>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-[#DAA520] to-[#B8860B] text-black p-6 rounded-lg text-center">
                <p className="font-bold text-lg">
                  ⚡ Relatório de R$ 5.500 de receitas e R$ 3.880 de gastos em 5 segundos
                </p>
              </div>

              {/* App Screenshot */}
              <div className="mt-8">
                <img
                  src="/app-history.png"
                  alt="Histórico de Transações"
                  className="rounded-lg shadow-lg w-full max-w-sm mx-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Tudo Que Você Precisa em Um Só Lugar</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8">
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <BarChart3 className="h-8 w-8 text-[#1E3A5F]" />
                  <h3 className="text-xl font-bold">📊 Dashboard de Dar Inveja no Banco</h3>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li>• Cards coloridos: R$ 5.500 receitas, R$ 3.880 gastos, R$ 800 investimentos</li>
                  <li>• Gráfico de pizza com 5 categorias principais e percentuais exatos</li>
                  <li>• Análise automática: 56.7% Moradia, 15.5% Lazer, 11.6% Transporte</li>
                  <li>• Histórico detalhado com tags coloridas por tipo de transação</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <MessageCircle className="h-8 w-8 text-green-600" />
                  <h3 className="text-xl font-bold">💬 WhatsApp que Resolve Tudo</h3>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li>• "Gastei X" = Gasto automático</li>
                  <li>• "Recebi Y" = Receita automática</li>
                  <li>• "Relatório" = PDF na hora</li>
                  <li>• Confirmação: "Fechado, adicionado ✅"</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <h3 className="text-xl font-bold">📋 Importação Automática</h3>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li>• Upload de extratos bancários</li>
                  <li>• Categorização em lote</li>
                  <li>• Suporte a todos os bancos</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <Shield className="h-8 w-8 text-red-600" />
                  <h3 className="text-xl font-bold">🔒 Segurança Total</h3>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li>• Dados criptografados</li>
                  <li>• Conformidade com LGPD</li>
                  <li>• Backup automático na nuvem</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">O Que Nossos Usuários Dizem</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Marina Silva",
                role: "Enfermeira, SP",
                text: "Descobri que gastava 60% da minha renda só em moradia e lazer. Agora consigo economizar R$ 400 por mês!",
                avatar: "MS",
              },
              {
                name: "Carlos Oliveira",
                role: "Motorista, RJ",
                text: "Só mando áudio: 'gastei 50 no uber' e pronto. Em 3 meses organizei toda minha vida financeira.",
                avatar: "CO",
              },
              {
                name: "Ana Costa",
                role: "Professora, MG",
                text: "O relatório que gera é melhor que do meu banco! Agora sei exatamente para onde vai cada centavo.",
                avatar: "AC",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#1E3A5F] text-white rounded-full flex items-center justify-center font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Comece Grátis Hoje e Transforme Sua Vida Financeira
            </h2>
          </div>

          <Card className="p-8 lg:p-12 shadow-2xl border-2 border-[#DAA520]">
            <CardContent className="text-center">
              <div className="bg-[#DAA520] text-black px-6 py-2 rounded-full inline-block mb-6">
                <span className="font-bold text-lg">PLANO PREMIUM</span>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-bold text-gray-900">R$ 19,90</span>
                <span className="text-xl text-gray-600">/mês</span>
              </div>

              <div className="space-y-4 mb-8 text-left max-w-md mx-auto">
                {[
                  "7 dias grátis (sem cartão)",
                  "WhatsApp ilimitado",
                  "Importação de extratos",
                  "Relatórios PDF profissionais",
                  "Suporte prioritário",
                  "Todos os recursos",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">🛡️ Garantia de 30 dias ou seu dinheiro de volta</p>
                <p className="text-sm text-gray-500">
                  R$ 19,90 = Preço de 1 pizza para descobrir onde vão seus R$ 3.880 mensais
                </p>
              </div>

              <Button
                size="lg"
                className="w-full bg-[#DAA520] hover:bg-[#B8860B] text-black font-bold text-xl py-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                COMEÇAR TESTE GRÁTIS AGORA
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Urgency Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Por Tempo Limitado: Trial Estendido</h2>
          </div>

          <Card className="p-8 bg-gradient-to-r from-[#8B2635] to-[#B91C1C] text-white shadow-2xl">
            <CardContent className="text-center">
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-lg opacity-80">Trial normal:</p>
                  <p className="text-2xl font-bold line-through">3 dias</p>
                </div>
                <div>
                  <p className="text-lg opacity-80">Esta semana:</p>
                  <p className="text-2xl font-bold text-[#DAA520]">7 dias grátis</p>
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <p className="text-lg">✅ Sem cartão de crédito</p>
                <p className="text-lg">✅ Cancele quando quiser</p>
              </div>

              <div className="bg-black/20 p-6 rounded-lg mb-6">
                <p className="text-lg mb-4">Esta oferta expira em:</p>
                <div className="flex justify-center gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-[#DAA520]">{timeLeft.days}</div>
                    <div className="text-sm">dias</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#DAA520]">{timeLeft.hours}</div>
                    <div className="text-sm">horas</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#DAA520]">{timeLeft.minutes}</div>
                    <div className="text-sm">min</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#DAA520]">{timeLeft.seconds}</div>
                    <div className="text-sm">seg</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Perguntas Frequentes</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "Preciso saber de tecnologia?",
                answer: "Não! É mais fácil que mandar mensagem no WhatsApp. Se você sabe falar, você sabe usar.",
              },
              {
                question: "Meus dados ficam seguros?",
                answer: "Totalmente! Usamos a mesma segurança dos bancos e somos 100% conformes com a LGPD.",
              },
              {
                question: "Funciona com qualquer banco?",
                answer: "Sim! Importamos extratos de todos os bancos brasileiros: Nubank, C6, Itaú, Bradesco, etc.",
              },
              {
                question: "E se eu não gostar?",
                answer: "30 dias de garantia total. Não gostou? Devolvemos seu dinheiro, sem perguntas.",
              },
            ].map((faq, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <button
                    className="w-full p-6 text-left hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => toggleFaq(index)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-gray-900">{faq.question}</h3>
                      {openFaq === index ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-[#1E3A5F] to-[#2D5016] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Sua Vida Financeira Pode Mudar Hoje</h2>
          <p className="text-xl text-gray-200 mb-12 leading-relaxed">
            Pare de adiar seu controle financeiro. Milhares de brasileiros já transformaram suas vidas com nosso app.
            Você será o próximo?
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              className="bg-[#DAA520] hover:bg-[#B8860B] text-black font-bold text-xl px-12 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              TESTAR GRÁTIS POR 7 DIAS
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-[#1E3A5F] font-bold text-xl px-12 py-6 rounded-lg bg-transparent"
            >
              FALAR COM ESPECIALISTA
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-[#DAA520] mb-2">+2.000</div>
              <div className="text-sm text-gray-300">Usuários Ativos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#DAA520] mb-2">R$ 1.2M</div>
              <div className="text-sm text-gray-300">Controlados por Mês</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#DAA520] mb-2">4.9★</div>
              <div className="text-sm text-gray-300">Avaliação Média</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img src="/logo-seu-planejamento-branco.png" alt="Seu Planejamento" className="h-12 mb-4" />
              <p className="text-gray-400 text-sm">
                Controle financeiro inteligente via WhatsApp. Transforme sua vida financeira em 5 segundos.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Funcionalidades</li>
                <li>Preços</li>
                <li>Demonstração</li>
                <li>Suporte</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Sobre Nós</li>
                <li>Blog</li>
                <li>Carreiras</li>
                <li>Contato</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Privacidade</li>
                <li>Termos</li>
                <li>LGPD</li>
                <li>Cookies</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Seu Planejamento. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
