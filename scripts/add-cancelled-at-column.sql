-- Adicionar coluna cancelled_at na tabela user_subscriptions
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;

-- Adicionar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_cancelled_at 
ON user_subscriptions(cancelled_at);

-- Adicionar índice composto para consultas por usuário e status
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status 
ON user_subscriptions(user_id, status, is_active);

-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions' 
ORDER BY ordinal_position;
