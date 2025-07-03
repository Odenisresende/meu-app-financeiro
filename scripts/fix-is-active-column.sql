-- Adicionar coluna is_active que está faltando
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Atualizar registros existentes
UPDATE user_subscriptions 
SET is_active = true 
WHERE status IN ('trial', 'active');

UPDATE user_subscriptions 
SET is_active = false 
WHERE status IN ('cancelled', 'expired');

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_active 
ON user_subscriptions(user_id, is_active) 
WHERE is_active = true;
