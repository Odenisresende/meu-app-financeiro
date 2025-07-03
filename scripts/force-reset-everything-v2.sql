-- Versão 2 do reset completo - mais segura

-- Primeiro, desativar todas as assinaturas existentes
UPDATE user_subscriptions 
SET 
    is_active = false,
    status = 'cancelled',
    cancelled_at = NOW(),
    cancellation_reason = 'Reset administrativo',
    updated_at = NOW()
WHERE is_active = true;

-- Criar novas assinaturas trial para usuários que não têm trial ativo
INSERT INTO user_subscriptions (
    user_id,
    status,
    trial_start_date,
    trial_end_date,
    is_active,
    created_at,
    updated_at
)
SELECT 
    u.id,
    'trial',
    NOW(),
    NOW() + INTERVAL '7 days',
    true,
    NOW(),
    NOW()
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 
    FROM user_subscriptions s 
    WHERE s.user_id = u.id 
    AND s.is_active = true 
    AND s.status = 'trial'
);

-- Verificar o resultado
SELECT 
    u.email,
    s.status,
    s.trial_start_date,
    s.trial_end_date,
    s.is_active,
    s.created_at
FROM auth.users u
JOIN user_subscriptions s ON u.id = s.user_id
WHERE s.is_active = true
ORDER BY s.created_at DESC;
