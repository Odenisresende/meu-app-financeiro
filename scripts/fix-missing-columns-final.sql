-- =====================================================
-- SCRIPT PARA CORRIGIR COLUNAS FALTANTES
-- =====================================================

-- 1. ADICIONAR COLUNAS WHATSAPP NA TABELA PROFILES
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS whatsapp_opt_in boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_preferences jsonb DEFAULT '{"notifications": true, "auto_categorize": true}'::jsonb;

-- 2. ADICIONAR COLUNA BILLING_CYCLE NA TABELA USER_SUBSCRIPTIONS  
ALTER TABLE public.user_subscriptions
ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly'));

-- 3. ATUALIZAR DADOS EXISTENTES
UPDATE public.profiles 
SET whatsapp_opt_in = false,
    whatsapp_preferences = '{"notifications": true, "auto_categorize": true}'::jsonb
WHERE whatsapp_opt_in IS NULL;

UPDATE public.user_subscriptions
SET billing_cycle = 'monthly'
WHERE billing_cycle IS NULL;

-- 4. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp_opt_in 
ON public.profiles(whatsapp_opt_in) 
WHERE whatsapp_opt_in = true;

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_billing_cycle 
ON public.user_subscriptions(billing_cycle);

-- 5. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON COLUMN public.profiles.whatsapp_opt_in IS 'Usuário optou por receber mensagens via WhatsApp';
COMMENT ON COLUMN public.profiles.whatsapp_preferences IS 'Preferências de configuração do WhatsApp';
COMMENT ON COLUMN public.user_subscriptions.billing_cycle IS 'Ciclo de cobrança: monthly ou yearly';

-- 6. LOG DE SUCESSO
DO $$
BEGIN
    RAISE NOTICE '✅ Colunas adicionadas com sucesso!';
    RAISE NOTICE '📱 WhatsApp: whatsapp_opt_in, whatsapp_preferences';
    RAISE NOTICE '💳 Assinaturas: billing_cycle';
END $$;
