-- Script para criar assinatura de teste
-- Substitua 'SEU_USER_ID_AQUI' pelo seu User ID real

-- Primeiro, verificar seu User ID atual
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Criar assinatura de teste (substitua o user_id)
INSERT INTO user_subscriptions (
  user_id, 
  subscription_id, 
  status, 
  is_active, 
  plan_type,
  subscription_start_date,
  subscription_end_date,
  created_at,
  updated_at
) VALUES (
  'SEU_USER_ID_AQUI', -- Substitua pelo seu User ID
  'test-sub-' || extract(epoch from now()),
  'active',
  true,
  'premium',
  now(),
  now() + interval '30 days',
  now(),
  now()
) ON CONFLICT (user_id) DO UPDATE SET
  subscription_id = EXCLUDED.subscription_id,
  status = 'active',
  is_active = true,
  plan_type = 'premium',
  subscription_start_date = now(),
  subscription_end_date = now() + interval '30 days',
  updated_at = now();

-- Verificar se foi criada
SELECT * FROM user_subscriptions WHERE user_id = 'SEU_USER_ID_AQUI';
