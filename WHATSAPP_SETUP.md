# 📱 Integração WhatsApp - Seu Planejamento

## 🎯 Objetivo
Integrar o WhatsApp para envio de relatórios, lembretes e notificações financeiras aos usuários.

## 🔧 Configuração

### 1. WhatsApp Business API
Para usar a API oficial do WhatsApp:

1. **Criar conta Meta Business**
   - Acesse [business.facebook.com](https://business.facebook.com)
   - Crie conta empresarial
   - Adicione WhatsApp Business

2. **Configurar Webhook**
   \`\`\`
   URL: https://seu-dominio.vercel.app/api/whatsapp/webhook
   Verify Token: seu-token-secreto
   \`\`\`

3. **Obter Access Token**
   - Gere token permanente
   - Configure permissões necessárias

### 2. Alternativa: API Não-Oficial
Para desenvolvimento/testes, use bibliotecas como:
- `whatsapp-web.js`
- `baileys`
- `venom-bot`

## 📋 Funcionalidades

### 1. Relatórios Automáticos
- Envio semanal/mensal de resumo financeiro
- Gráficos em imagem
- Alertas de gastos excessivos

### 2. Lembretes
- Lembrete diário para registrar gastos
- Notificação de vencimento de contas
- Dicas de economia personalizadas

### 3. Comandos Interativos
- `/saldo` - Ver saldo atual
- `/gastos` - Gastos do mês
- `/meta` - Progresso das metas
- `/ajuda` - Lista de comandos

## 🔒 Privacidade e LGPD

### Consentimento
- ✅ Solicitar opt-in explícito
- ✅ Permitir opt-out a qualquer momento
- ✅ Explicar uso dos dados

### Dados Coletados
- Número do WhatsApp
- Preferências de notificação
- Histórico de interações

### Retenção
- Dados mantidos apenas enquanto usuário for ativo
- Exclusão automática após inatividade
- Backup seguro e criptografado

## 🚀 Implementação

### 1. Estrutura do Banco
\`\`\`sql
-- Adicionar WhatsApp ao perfil do usuário
ALTER TABLE profiles ADD COLUMN whatsapp_number TEXT;
ALTER TABLE profiles ADD COLUMN whatsapp_opt_in BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN whatsapp_preferences JSONB DEFAULT '{}';

-- Tabela de mensagens enviadas
CREATE TABLE whatsapp_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  phone_number TEXT NOT NULL,
  message_type TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### 2. API Routes
\`\`\`typescript
// /api/whatsapp/send
export async function POST(request: Request) {
  const { userId, message, type } = await request.json()
  
  // Verificar opt-in do usuário
  // Enviar mensagem via WhatsApp API
  // Registrar no banco de dados
  // Retornar status
}

// /api/whatsapp/webhook
export async function POST(request: Request) {
  // Verificar assinatura do webhook
  // Processar status de entrega
  // Atualizar banco de dados
  // Processar comandos recebidos
}
\`\`\`

### 3. Componente de Configuração
\`\`\`typescript
function WhatsAppSettings({ user }) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [optIn, setOptIn] = useState(false)
  
  const handleOptIn = async () => {
    // Salvar preferências
    // Enviar mensagem de confirmação
    // Atualizar estado
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificações WhatsApp</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Formulário de configuração */}
      </CardContent>
    </Card>
  )
}
\`\`\`

## 📊 Templates de Mensagem

### 1. Relatório Semanal
\`\`\`
🏦 *Seu Planejamento - Resumo Semanal*

📊 *Resumo da Semana:*
💰 Receitas: R$ 2.500,00
💸 Gastos: R$ 1.800,00
✅ Saldo: +R$ 700,00

📈 *Principais Categorias:*
🍔 Alimentação: R$ 650,00
🚗 Transporte: R$ 320,00
🏠 Moradia: R$ 480,00

💡 *Dica da Semana:*
Você gastou 15% menos que na semana passada! Continue assim! 🎉

Ver relatório completo: [link]
\`\`\`

### 2. Lembrete Diário
\`\`\`
⏰ *Lembrete Diário*

Olá! Não esqueça de registrar seus gastos de hoje no Seu Planejamento.

📱 Acesse: [link]
💬 Ou responda aqui com seus gastos!

Para parar os lembretes, digite: PARAR
\`\`\`

### 3. Alerta de Meta
\`\`\`
🚨 *Alerta de Meta*

Atenção! Você já gastou 80% da sua meta mensal de alimentação.

📊 *Status:*
Meta: R$ 800,00
Gasto: R$ 640,00
Restante: R$ 160,00

💡 Considere reduzir gastos nos próximos dias para não estourar a meta.

Ver detalhes: [link]
\`\`\`

## 🔧 Configuração Técnica

### 1. Variáveis de Ambiente
\`\`\`env
# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=seu-access-token
WHATSAPP_PHONE_NUMBER_ID=seu-phone-id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=seu-verify-token

# Meta Business
META_APP_ID=seu-app-id
META_APP_SECRET=seu-app-secret
\`\`\`

### 2. Webhook Verification
\`\`\`typescript
export async function GET(request: Request) {
  const url = new URL(request.url)
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')
  
  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }
  
  return new Response('Forbidden', { status: 403 })
}
\`\`\`

## 📈 Métricas e Analytics

### 1. KPIs Importantes
- Taxa de opt-in
- Taxa de entrega de mensagens
- Taxa de leitura
- Engajamento com comandos
- Taxa de opt-out

### 2. Dashboard de Monitoramento
- Mensagens enviadas por dia
- Status de entrega
- Comandos mais utilizados
- Usuários mais ativos

## 🛡️ Compliance e Segurança

### 1. LGPD
- ✅ Consentimento explícito
- ✅ Finalidade específica
- ✅ Minimização de dados
- ✅ Direito ao esquecimento

### 2. WhatsApp Policies
- ✅ Não spam
- ✅ Conteúdo relevante
- ✅ Frequência adequada
- ✅ Opt-out fácil

### 3. Segurança
- ✅ Criptografia end-to-end
- ✅ Validação de webhooks
- ✅ Rate limiting
- ✅ Logs de auditoria

## 🚀 Roadmap

### Fase 1 (MVP)
- [x] Configuração básica
- [x] Envio de mensagens simples
- [x] Webhook para status
- [x] Opt-in/opt-out

### Fase 2 (Melhorias)
- [ ] Templates de mensagem
- [ ] Comandos interativos
- [ ] Relatórios automáticos
- [ ] Analytics básico

### Fase 3 (Avançado)
- [ ] IA para respostas automáticas
- [ ] Chatbot inteligente
- [ ] Integração com calendário
- [ ] Notificações personalizadas

---

**📱 WhatsApp Integration Ready!** 

Agora seus usuários podem receber notificações e relatórios diretamente no WhatsApp! 🎉
\`\`\`
