-- SCRIPT PARA LIMPAR TODOS OS DADOS DE TESTE
-- Execute este script no SQL Editor do Supabase

-- 1. Ver dados atuais antes de limpar
SELECT 
    'ANTES DA LIMPEZA' as status,
    COUNT(*) as total_subscriptions
FROM user_subscriptions;

-- 2. Ver detalhes das assinaturas existentes
SELECT 
    id,
    user_id,
    status,
    mercadopago_subscription_id,
    created_at
FROM user_subscriptions
ORDER BY created_at DESC;

-- 3. LIMPAR TODAS AS ASSINATURAS DE TESTE
DELETE FROM user_subscriptions 
WHERE mercadopago_subscription_id IS NULL 
   OR mercadopago_subscription_id LIKE '%test%'
   OR status = 'pending';

-- 4. LIMPAR LOGS DE WEBHOOK DE TESTE
DELETE FROM webhook_logs 
WHERE created_at > NOW() - INTERVAL '24 hours';

-- 5. Verificar limpeza
SELECT 
    'APÓS LIMPEZA' as status,
    COUNT(*) as total_subscriptions
FROM user_subscriptions;

-- 6. Mostrar dados restantes (se houver)
SELECT 
    id,
    user_id,
    status,
    mercadopago_subscription_id,
    created_at
FROM user_subscriptions
ORDER BY created_at DESC;
