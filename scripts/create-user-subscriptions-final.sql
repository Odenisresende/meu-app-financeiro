-- =====================================================
-- 💳 TABELA DE ASSINATURAS DE USUÁRIOS
-- =====================================================

-- 1. Criar tabela de assinaturas
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subscription_id TEXT, -- ID do MercadoPago
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'expired')),
    plan_type TEXT NOT NULL DEFAULT 'premium' CHECK (plan_type IN ('trial', 'premium')),
    amount DECIMAL(10,2),
    currency TEXT DEFAULT 'BRL',
    payment_method TEXT,
    trial_start_date TIMESTAMP WITH TIME ZONE,
    trial_end_date TIMESTAMP WITH TIME ZONE,
    subscription_start_date TIMESTAMP WITH TIME ZONE,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para garantir apenas uma assinatura ativa por usuário
    CONSTRAINT unique_active_subscription 
        EXCLUDE (user_id WITH =) 
        WHERE (status IN ('active', 'pending'))
);

-- 2. Criar índices
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_subscription_id ON public.user_subscriptions(subscription_id);

-- 3. Habilitar RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de segurança
CREATE POLICY "Usuários podem ver apenas suas próprias assinaturas"
    ON public.user_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir apenas suas próprias assinaturas"
    ON public.user_subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias assinaturas"
    ON public.user_subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

-- 5. Criar trigger para updated_at
CREATE TRIGGER handle_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ✅ TABELA DE ASSINATURAS CRIADA COM SUCESSO
