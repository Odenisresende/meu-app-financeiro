-- RESET COMPLETO - USE COM CUIDADO!
-- Este script remove TODOS os dados de teste

-- OPÇÃO 1: Limpeza suave (recomendada)
UPDATE user_subscriptions 
SET 
    is_active = false,
    status = 'cancelled',
    cancelled_at = NOW()
WHERE status IN ('pending', 'trial');

-- OPÇÃO 2: Limpeza completa (mais radical)
-- DESCOMENTE APENAS SE NECESSÁRIO:

-- DELETE FROM user_subscriptions 
-- WHERE created_at > NOW() - INTERVAL '7 days';

-- DELETE FROM webhook_logs 
-- WHERE created_at > NOW() - INTERVAL '7 days';

-- Verificar resultado
SELECT 
    'DADOS RESTANTES' as info,
    COUNT(*) as total
FROM user_subscriptions 
WHERE is_active = true;
