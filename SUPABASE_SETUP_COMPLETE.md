# 🗄️ CONFIGURAÇÃO COMPLETA DO SUPABASE

## 📋 PASSO A PASSO COMPLETO

### 1️⃣ **CRIAR NOVO PROJETO SUPABASE**

1. Acesse: https://supabase.com
2. Clique em **"New Project"**
3. Escolha sua organização
4. Configure:
   - **Name**: `financial-control-app` (ou nome de sua escolha)
   - **Database Password**: Crie uma senha forte (ANOTE!)
   - **Region**: `South America (São Paulo)` (mais próximo do Brasil)
5. Clique em **"Create new project"**
6. ⏳ Aguarde 2-3 minutos para o projeto ser criado

---

### 2️⃣ **OBTER CREDENCIAIS**

Após o projeto ser criado:

1. Vá em **Settings** → **API**
2. Copie as seguintes informações:

\`\`\`bash
# URL do projeto
NEXT_PUBLIC_SUPABASE_URL=https://[SEU-PROJETO].supabase.co

# Chave pública (anon key)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
\`\`\`

---

### 3️⃣ **CONFIGURAR VARIÁVEIS NO VERCEL**

1. Acesse seu projeto no Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione as variáveis:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://[SEU-PROJETO].supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9... |

4. Clique em **"Save"**

---

### 4️⃣ **EXECUTAR SCRIPTS SQL**

No Supabase, vá em **SQL Editor** e execute os scripts na ordem:

1. `setup-auth-and-user-data.sql` ✅
2. `create-transactions-table-final.sql` ✅  
3. `create-user-subscriptions-final.sql` ✅
4. `create-webhook-logs-final.sql` ✅
5. `setup-security-policies-final.sql` ✅

---

### 5️⃣ **TESTAR CONEXÃO**

1. Faça **redeploy** no Vercel
2. Acesse seu app
3. Teste login/cadastro
4. Adicione uma transação

---

## ✅ **CHECKLIST FINAL**

- [ ] Projeto Supabase criado
- [ ] Credenciais copiadas
- [ ] Variáveis configuradas no Vercel
- [ ] Scripts SQL executados
- [ ] App testado e funcionando

---

## 🆘 **PROBLEMAS COMUNS**

### **Erro de conexão:**
- Verifique se as URLs estão corretas
- Confirme se as variáveis foram salvas no Vercel

### **Erro de autenticação:**
- Verifique se a chave anon está correta
- Confirme se RLS está configurado

### **Tabelas não encontradas:**
- Execute todos os scripts SQL na ordem
- Verifique se não há erros nos scripts
\`\`\`

Agora vou criar os scripts SQL finais e limpos:
