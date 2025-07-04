-- =====================================================
-- 💳 TABELA DE ASSINATURAS E PAGAMENTOS
-- =====================================================

-- 1. Criar tabela de assinaturas
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    mercadopago_payment_id TEXT,
    mercadopago_subscription_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'cancelled', 'expired')),
    plan_type TEXT NOT NULL DEFAULT 'premium' CHECK (plan_type IN ('trial', 'premium')),
    amount DECIMAL(10,2),
    currency TEXT DEFAULT 'BRL',
    payment_method TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_mp_payment_id ON public.user_subscriptions(mercadopago_payment_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at ON public.user_subscriptions(expires_at);

-- 3. Habilitar RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de segurança
DROP POLICY IF EXISTS "Usuários podem ver próprias assinaturas" ON public.user_subscriptions;
CREATE POLICY "Usuários podem ver próprias assinaturas"
    ON public.user_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir próprias assinaturas" ON public.user_subscriptions;
CREATE POLICY "Usuários podem inserir próprias assinaturas"
    ON public.user_subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar próprias assinaturas" ON public.user_subscriptions;
CREATE POLICY "Usuários podem atualizar próprias assinaturas"
    ON public.user_subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

-- 5. Política especial para webhooks (sem autenticação)
DROP POLICY IF EXISTS "Webhooks podem atualizar assinaturas" ON public.user_subscriptions;
CREATE POLICY "Webhooks podem atualizar assinaturas"
    ON public.user_subscriptions FOR UPDATE
    USING (true);

-- 6. Trigger para updated_at
DROP TRIGGER IF EXISTS handle_updated_at ON public.user_subscriptions;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. Comentários para documentação
COMMENT ON TABLE public.user_subscriptions IS 'Assinaturas e pagamentos dos usuários';
COMMENT ON COLUMN public.user_subscriptions.mercadopago_payment_id IS 'ID do pagamento no Mercado Pago';
COMMENT ON COLUMN public.user_subscriptions.status IS 'Status do pagamento/assinatura';

-- ✅ TABELA DE ASSINATURAS CRIADA COM SUCESSO
