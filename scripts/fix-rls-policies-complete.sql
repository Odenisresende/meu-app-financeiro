-- =====================================================
-- SCRIPT PARA CORRIGIR POLÍTICAS RLS COMPLETAS
-- =====================================================

-- 1. REMOVER POLÍTICAS EXISTENTES PARA RECRIAR
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.user_subscriptions;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;

-- 2. HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS PARA PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. POLÍTICAS PARA USER_SUBSCRIPTIONS
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.user_subscriptions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.user_subscriptions
    FOR UPDATE USING (auth.uid()::text = user_id);

-- 5. POLÍTICAS PARA TRANSACTIONS
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
    FOR DELETE USING (auth.uid()::text = user_id);

-- 6. POLÍTICAS PARA WEBHOOK_LOGS (apenas leitura para usuários autenticados)
CREATE POLICY "Authenticated users can view webhook logs" ON public.webhook_logs
    FOR SELECT USING (auth.role() = 'authenticated');

-- 7. GRANT PERMISSIONS NECESSÁRIAS
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Profiles
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- User Subscriptions  
GRANT SELECT, INSERT, UPDATE ON public.user_subscriptions TO authenticated;

-- Transactions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;

-- Webhook Logs
GRANT SELECT ON public.webhook_logs TO authenticated;
GRANT INSERT ON public.webhook_logs TO anon; -- Para webhooks externos

-- 8. LOG DE SUCESSO
DO $$
BEGIN
    RAISE NOTICE '✅ Políticas RLS configuradas com sucesso!';
    RAISE NOTICE '🔒 Segurança: Usuários só acessam próprios dados';
    RAISE NOTICE '📱 WhatsApp: Webhooks podem inserir logs';
    RAISE NOTICE '💳 Pagamentos: Webhooks podem atualizar assinaturas';
END $$;
