# 🚀 Guia de Deploy - Seu Planejamento

## 📋 Pré-requisitos

### 1. Contas Necessárias
- ✅ **Vercel** (para hospedagem)
- ✅ **Supabase** (para banco de dados)
- ✅ **Mercado Pago** (para pagamentos)
- ✅ **GitHub** (para versionamento)

### 2. Variáveis de Ambiente
\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=seu-access-token
MERCADO_PAGO_PUBLIC_KEY=sua-public-key

# App
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
\`\`\`

## 🔧 Configuração do Supabase

### 1. Criar Projeto
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Escolha organização e nome
4. Aguarde criação (2-3 minutos)

### 2. Executar Scripts SQL
Execute os scripts na seguinte ordem no SQL Editor:

\`\`\`sql
-- 1. Configurar autenticação
-- Execute: scripts/setup-auth-and-user-data.sql

-- 2. Criar tabela de transações
-- Execute: scripts/create-transactions-table-fixed.sql

-- 3. Criar tabela de assinaturas
-- Execute: scripts/create-subscriptions-table-v2.sql
\`\`\`

### 3. Configurar Autenticação
1. Vá em **Authentication > Settings**
2. Configure **Site URL**: `https://seu-dominio.vercel.app`
3. Adicione **Redirect URLs**:
   - `https://seu-dominio.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (desenvolvimento)

### 4. Configurar RLS (Row Level Security)
- Todas as tabelas já vêm com RLS habilitado
- Políticas garantem que usuários vejam apenas seus dados

## 💳 Configuração do Mercado Pago

### 1. Criar Conta
1. Acesse [mercadopago.com.br](https://mercadopago.com.br)
2. Crie conta empresarial
3. Complete verificação

### 2. Obter Credenciais
1. Vá em **Desenvolvedores > Suas integrações**
2. Crie nova aplicação
3. Copie **Access Token** e **Public Key**
4. Use credenciais de **PRODUÇÃO** para deploy

### 3. Configurar Webhook
1. Em **Desenvolvedores > Webhooks**
2. URL: `https://seu-dominio.vercel.app/api/webhooks/mercadopago`
3. Eventos: `payment`, `subscription`

## 🌐 Deploy na Vercel

### 1. Conectar Repositório
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Conecte seu repositório GitHub
4. Configure build settings:
   - **Framework**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 2. Configurar Variáveis de Ambiente
1. Vá em **Settings > Environment Variables**
2. Adicione todas as variáveis listadas acima
3. Marque para todos os ambientes (Production, Preview, Development)

### 3. Deploy
1. Clique em "Deploy"
2. Aguarde build (3-5 minutos)
3. Teste a aplicação

## 📱 Build para Mobile (Opcional)

### 1. Instalar Capacitor
\`\`\`bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
\`\`\`

### 2. Configurar
\`\`\`bash
npx cap init "Seu Planejamento" "com.seuplanejamento.app"
npx cap add android
npx cap add ios
\`\`\`

### 3. Build
\`\`\`bash
npm run build
npx cap copy
npx cap open android  # Para Android Studio
npx cap open ios      # Para Xcode
\`\`\`

## 🔍 Verificações Pós-Deploy

### ✅ Checklist de Testes
- [ ] **Login/Registro** funcionando
- [ ] **Criação de transações** funcionando
- [ ] **Importação CSV** funcionando
- [ ] **Gráficos** carregando
- [ ] **Pagamento** redirecionando para Mercado Pago
- [ ] **Webhook** recebendo notificações
- [ ] **Trial** sendo criado automaticamente
- [ ] **PWA** instalável no mobile

### 🐛 Problemas Comuns

#### 1. Erro de CORS
\`\`\`javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
        ],
      },
    ]
  },
}
\`\`\`

#### 2. Erro de Supabase
- Verificar URLs e chaves
- Confirmar RLS configurado
- Testar conexão no SQL Editor

#### 3. Erro de Mercado Pago
- Verificar credenciais de produção
- Confirmar webhook configurado
- Testar com valores reais (mínimo R$ 0,50)

## 📊 Monitoramento

### 1. Logs da Vercel
- Acesse **Functions > View Function Logs**
- Monitore erros em tempo real

### 2. Analytics do Supabase
- Vá em **Reports** para ver uso
- Monitore performance das queries

### 3. Dashboard do Mercado Pago
- Acompanhe transações em tempo real
- Verifique taxa de conversão

## 🔒 Segurança

### 1. Variáveis de Ambiente
- ❌ Nunca commite credenciais
- ✅ Use apenas variáveis de ambiente
- ✅ Rotacione chaves regularmente

### 2. HTTPS
- ✅ Sempre use HTTPS em produção
- ✅ Configure redirects HTTP → HTTPS

### 3. Rate Limiting
\`\`\`javascript
// Implementar rate limiting nas APIs
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP
}
\`\`\`

## 📈 Otimizações

### 1. Performance
- ✅ Imagens otimizadas (WebP)
- ✅ Lazy loading
- ✅ Cache de API routes

### 2. SEO
- ✅ Meta tags configuradas
- ✅ Sitemap.xml
- ✅ robots.txt

### 3. PWA
- ✅ Service Worker
- ✅ Manifest.json
- ✅ Ícones para todas as plataformas

## 🆘 Suporte

### Documentação
- [Next.js](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [Mercado Pago](https://www.mercadopago.com.br/developers)
- [Vercel](https://vercel.com/docs)

### Contato
- 📧 Email: suporte@seuplanejamento.app
- 💬 Discord: [Link do servidor]
- 📱 WhatsApp: [Número de suporte]

---

**🎉 Parabéns! Seu app está no ar!** 

Agora é só divulgar e começar a receber usuários! 🚀
\`\`\`
