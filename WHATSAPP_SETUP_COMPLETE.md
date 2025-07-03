# 🚀 CONFIGURAÇÃO COMPLETA WHATSAPP

## 📋 PASSO A PASSO OBRIGATÓRIO

### 1. 🏢 CRIAR META BUSINESS ACCOUNT
- Acesse: https://business.facebook.com/
- Criar conta comercial
- Verificar empresa (pode ser pessoa física)

### 2. 📱 CONFIGURAR WHATSAPP BUSINESS API
- Acesse: https://developers.facebook.com/
- Criar novo app > Business
- Adicionar produto "WhatsApp"
- **IMPORTANTE:** Você ganha um número de teste GRATUITO

### 3. 🔧 CONFIGURAR WEBHOOK
\`\`\`
URL: https://seu-app.vercel.app/api/whatsapp/webhook
Verify Token: seu_token_secreto_123
Eventos: messages
\`\`\`

### 4. 🔑 PEGAR TOKENS
\`\`\`env
WHATSAPP_ACCESS_TOKEN=EAAxxxxx (do Meta)
WHATSAPP_PHONE_NUMBER_ID=123456789 (do Meta)
WHATSAPP_VERIFY_TOKEN=seu_token_secreto_123
\`\`\`

### 5. ✅ TESTAR
- Enviar mensagem DO SEU CELULAR
- PARA O NÚMERO DO BOT (que o Meta vai dar)
- Exemplo: "Comprei lanche por 25 reais"

## 💰 CUSTOS
- **Gratuito:** 1000 mensagens/mês
- **Número de teste:** Gratuito por 90 dias
- **Número oficial:** ~R$ 50/mês
