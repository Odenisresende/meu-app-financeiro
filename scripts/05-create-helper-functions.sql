-- =====================================================
-- 🔧 FUNÇÕES AUXILIARES
-- =====================================================

-- 1. Função para verificar se usuário tem assinatura ativa
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.user_subscriptions 
        WHERE user_id = user_uuid 
        AND status = 'approved' 
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Função para obter estatísticas de transações
CREATE OR REPLACE FUNCTION public.get_transaction_stats(user_uuid UUID, start_date DATE DEFAULT NULL, end_date DATE DEFAULT NULL)
RETURNS TABLE(
    total_income DECIMAL(10,2),
    total_expense DECIMAL(10,2),
    balance DECIMAL(10,2),
    transaction_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as total_expense,
        COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END), 0) as balance,
        COUNT(*)::INTEGER as transaction_count
    FROM public.transactions t
    WHERE t.user_id = user_uuid
    AND (start_date IS NULL OR t.date >= start_date)
    AND (end_date IS NULL OR t.date <= end_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Função para limpar logs antigos de webhook
CREATE OR REPLACE FUNCTION public.cleanup_old_webhook_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.webhook_logs 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Função para ativar trial automático
CREATE OR REPLACE FUNCTION public.activate_trial_for_user(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
    subscription_id UUID;
BEGIN
    -- Verificar se já tem trial ativo
    IF EXISTS (
        SELECT 1 FROM public.user_subscriptions 
        WHERE user_id = user_uuid 
        AND plan_type = 'trial' 
        AND status = 'approved'
        AND expires_at > NOW()
    ) THEN
        RAISE EXCEPTION 'Usuário já possui trial ativo';
    END IF;
    
    -- Criar novo trial
    INSERT INTO public.user_subscriptions (
        user_id,
        status,
        plan_type,
        expires_at
    ) VALUES (
        user_uuid,
        'approved',
        'trial',
        NOW() + INTERVAL '7 days'
    ) RETURNING id INTO subscription_id;
    
    RETURN subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ✅ FUNÇÕES AUXILIARES CRIADAS COM SUCESSO
