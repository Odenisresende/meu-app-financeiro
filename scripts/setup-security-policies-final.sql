-- =====================================================
-- 🔒 CONFIGURAÇÕES FINAIS DE SEGURANÇA
-- =====================================================

-- 1. Configurar autenticação por email
UPDATE auth.config 
SET 
    site_url = 'https://seu-app.vercel.app',
    jwt_exp = 3600;

-- 2. Habilitar confirmação de email (opcional)
-- UPDATE auth.config SET email_confirm = true;

-- 3. Criar função para verificar se usuário é premium
CREATE OR REPLACE FUNCTION public.is_user_premium(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.user_subscriptions 
        WHERE user_id = user_uuid 
        AND status = 'active'
        AND (
            subscription_end_date IS NULL 
            OR subscription_end_date > NOW()
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar função para verificar trial
CREATE OR REPLACE FUNCTION public.is_user_in_trial(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.user_subscriptions 
        WHERE user_id = user_uuid 
        AND plan_type = 'trial'
        AND trial_end_date > NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar função para obter status da assinatura
CREATE OR REPLACE FUNCTION public.get_user_subscription_status(user_uuid UUID)
RETURNS TABLE (
    is_premium BOOLEAN,
    is_in_trial BOOLEAN,
    trial_days_left INTEGER,
    subscription_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        public.is_user_premium(user_uuid) as is_premium,
        public.is_user_in_trial(user_uuid) as is_in_trial,
        CASE 
            WHEN us.trial_end_date IS NOT NULL AND us.trial_end_date > NOW() 
            THEN EXTRACT(DAY FROM us.trial_end_date - NOW())::INTEGER
            ELSE 0
        END as trial_days_left,
        COALESCE(us.status, 'none') as subscription_status
    FROM public.user_subscriptions us
    WHERE us.user_id = user_uuid
    AND us.status IN ('active', 'pending')
    ORDER BY us.created_at DESC
    LIMIT 1;
    
    -- Se não encontrou nenhuma assinatura, retornar valores padrão
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, FALSE, 0, 'none'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ✅ CONFIGURAÇÕES DE SEGURANÇA CONCLUÍDAS
