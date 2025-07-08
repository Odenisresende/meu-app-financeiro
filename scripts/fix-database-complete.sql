-- =====================================================
-- SCRIPT COMPLETO PARA CORRIGIR O BANCO DE DADOS
-- =====================================================

-- 1. CRIAR TABELA PROFILES SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name text,
    avatar_url text,
    whatsapp_number text,
    whatsapp_opt_in boolean DEFAULT false,
    whatsapp_preferences jsonb DEFAULT '{"notifications": true, "auto_categorize": true}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CRIAR TABELA USER_SUBSCRIPTIONS SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subscription_id text UNIQUE,
    plan_type text DEFAULT 'trial' CHECK (plan_type IN ('trial', 'premium', 'basic')),
    status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
    amount decimal(10,2) DEFAULT 17.00,
    currency text DEFAULT 'BRL',
    billing_cycle text DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    started_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    expires_at timestamp with time zone,
    subscription_start_date timestamp with time zone,
    subscription_end_date timestamp with time zone,
    cancelled_at timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CRIAR TABELA TRANSACTIONS SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS public.transactions (
    id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date date NOT NULL,
    category text NOT NULL,
    amount decimal(10,2) NOT NULL,
    type text NOT NULL CHECK (type IN ('income', 'expense', 'investment')),
    description text,
    source text DEFAULT 'manual' CHECK (source IN ('manual', 'whatsapp', 'csv', 'ocr')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CRIAR TABELA WEBHOOK_LOGS SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS public.webhook_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type text NOT NULL,
    payload jsonb,
    data jsonb,
    processed boolean DEFAULT false,
    error_message text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp_opt_in ON public.profiles(whatsapp_opt_in) WHERE whatsapp_opt_in = true;
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_is_active ON public.user_subscriptions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_source ON public.transactions(source);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed ON public.webhook_logs(processed) WHERE processed = false;

-- 6. HABILITAR RLS (ROW LEVEL SECURITY)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- 7. CRIAR POLÍTICAS DE SEGURANÇA

-- Políticas para PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para USER_SUBSCRIPTIONS
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.user_subscriptions;

CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para TRANSACTIONS
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;

CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para WEBHOOK_LOGS (apenas leitura para usuários autenticados)
DROP POLICY IF EXISTS "Authenticated users can view webhook logs" ON public.webhook_logs;

CREATE POLICY "Authenticated users can view webhook logs" ON public.webhook_logs
    FOR SELECT USING (auth.role() = 'authenticated');

-- 8. CRIAR FUNÇÃO PARA ATUALIZAR UPDATED_AT
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. CRIAR TRIGGERS PARA UPDATED_AT
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS handle_updated_at ON public.user_subscriptions;
DROP TRIGGER IF EXISTS handle_updated_at ON public.transactions;

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 10. CRIAR FUNÇÃO PARA AUTO-CRIAR PROFILE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. CRIAR TRIGGER PARA AUTO-CRIAR PROFILE
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON TABLE public.profiles IS 'Perfis dos usuários com informações adicionais';
COMMENT ON TABLE public.user_subscriptions IS 'Assinaturas e trials dos usuários';
COMMENT ON TABLE public.transactions IS 'Transações financeiras dos usuários';
COMMENT ON TABLE public.webhook_logs IS 'Logs dos webhooks recebidos';

COMMENT ON COLUMN public.profiles.whatsapp_opt_in IS 'Usuário optou por receber mensagens via WhatsApp';
COMMENT ON COLUMN public.profiles.whatsapp_preferences IS 'Preferências de configuração do WhatsApp';
COMMENT ON COLUMN public.user_subscriptions.billing_cycle IS 'Ciclo de cobrança: monthly ou yearly';
COMMENT ON COLUMN public.transactions.source IS 'Origem da transação: manual, whatsapp, csv, ocr';

-- 13. LOG DE SUCESSO
DO $$
BEGIN
    RAISE NOTICE '✅ BANCO DE DADOS CONFIGURADO COM SUCESSO!';
    RAISE NOTICE '📊 Tabelas: profiles, user_subscriptions, transactions, webhook_logs';
    RAISE NOTICE '🔒 RLS habilitado com políticas de segurança';
    RAISE NOTICE '⚡ Índices criados para performance';
    RAISE NOTICE '🔄 Triggers configurados para updated_at';
    RAISE NOTICE '👤 Auto-criação de profiles habilitada';
END $$;
