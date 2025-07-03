-- CUIDADO: Este script remove TODOS os dados de assinaturas
-- Use apenas em desenvolvimento ou para reset completo

-- Remover todas as assinaturas
TRUNCATE TABLE user_subscriptions CASCADE;

-- Resetar sequências se houver
-- ALTER SEQUENCE user_subscriptions_id_seq RESTART WITH 1;

-- Recriar trials para todos os usuários existentes
INSERT INTO user_subscriptions (
    user_id,
    status,
    trial_start_date,
    trial_end_date,
    is_active
)
SELECT 
    id as user_id,
    'trial' as status,
    NOW() as trial_start_date,
    NOW() + INTERVAL '7 days' as trial_end_date,
    true as is_active
FROM auth.users
WHERE id NOT IN (
    SELECT user_id FROM user_subscriptions WHERE is_active = true
);

-- Verificar resultado
SELECT 
    u.email,
    s.status,
    s.trial_start_date,
    s.trial_end_date,
    s.is_active
FROM auth.users u
LEFT JOIN user_subscriptions s ON u.id = s.user_id
ORDER BY u.created_at DESC;
