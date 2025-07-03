# 🔗 GUIA COMPLETO - CONFIGURAÇÃO DO WEBHOOK MERCADO PAGO

## 📋 PASSO A PASSO PARA CONFIGURAR O WEBHOOK

### 1. 🚀 **Primeiro: Deploy no Vercel**
- Faça o deploy do projeto no Vercel
- Anote a URL do seu projeto (ex: `https://seu-app.vercel.app`)

### 2. 🔑 **Configurar Variáveis de Ambiente no Vercel**

Acesse: **Vercel Dashboard > Seu Projeto > Settings > Environment Variables**

Adicione estas variáveis:

\`\`\`
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MERCADO_PAGO_PUBLIC_KEY=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=https://seu-app.vercel.app
\`\`\`

### 3. 🔔 **Configurar Webhook no Mercado Pago**

#### Acesse o Painel do Mercado Pago:
1. Entre em: https://www.mercadopago.com.br/developers
2. Vá em **"Suas integrações"**
3. Selecione sua aplicação
4. Clique em **"Webhooks"**

#### Configure o Webhook:
- **URL do Webhook:** `https://seu-app.vercel.app/api/webhooks/mercadopago`
- **Eventos para escutar:**
  - ✅ `payment` (Pagamentos)
  - ✅ `subscription` (Assinaturas)
  - ✅ `preapproval` (Pré-aprovações)

#### Exemplo de configuração:
\`\`\`
URL: https://meu-app-financeiro.vercel.app/api/webhooks/mercadopago
Eventos: payment, subscription, preapproval
\`\`\`

### 4. 🧪 **Testar o Webhook**

#### No Painel do Mercado Pago:
1. Vá em **"Webhooks"**
2. Clique em **"Simular"**
3. Escolha evento **"payment"**
4. Clique em **"Enviar"**

#### Verificar se funcionou:
- Status deve aparecer como **"Entregue"** ✅
- Se aparecer erro ❌, verifique a URL

### 5. 🔍 **Verificar Logs**

#### No Vercel:
1. Vá em **Functions**
2. Clique na função do webhook
3. Veja os logs em tempo real

#### Logs esperados:
\`\`\`
✅ Webhook recebido: { type: "payment", data: { id: "123456" } }
✅ Processando pagamento: 123456
✅ Assinatura ativada para usuário: abc123
\`\`\`

### 6. 🎯 **URLs Importantes**

- **Webhook URL:** `/api/webhooks/mercadopago`
- **Teste de Pagamento:** `/payment-test`
- **Criar Assinatura:** `/api/create-subscription`

### 7. 🚨 **Troubleshooting**

#### Webhook não funciona:
- ✅ Verifique se a URL está correta
- ✅ Confirme que o deploy foi feito
- ✅ Verifique as variáveis de ambiente
- ✅ Teste a URL manualmente: `https://seu-app.vercel.app/api/webhooks/mercadopago`

#### Pagamento não ativa premium:
- ✅ Verifique os logs do webhook
- ✅ Confirme que o `external_reference` está correto
- ✅ Verifique se o banco Supabase está conectado

### 8. 📱 **Fluxo Completo de Teste**

1. **Usuário clica em "Assinar Premium"**
2. **Redirecionado para Mercado Pago**
3. **Faz o pagamento (use cartão de teste)**
4. **Mercado Pago envia webhook**
5. **Sistema ativa premium automaticamente**
6. **Usuário volta ao app com premium ativo**

### 9. 💳 **Cartões de Teste**

Para testar pagamentos:

\`\`\`
Cartão: 4235 6477 2802 5682
CVV: 123
Vencimento: 11/25
Nome: APRO (aprovado)
CPF: 12345678909
\`\`\`

### 10. ✅ **Checklist Final**

- [ ] Deploy feito no Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Webhook configurado no Mercado Pago
- [ ] URL do webhook testada
- [ ] Pagamento de teste realizado
- [ ] Premium ativado automaticamente

## 🎉 **PRONTO! Seu sistema de pagamento está funcionando!**
