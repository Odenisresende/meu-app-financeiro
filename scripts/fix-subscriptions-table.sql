-- Corrigir problemas na tabela de assinaturas

-- Remover constraint UNIQUE se existir (pode causar problemas)
ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_user_id_key;

-- Permitir múltiplas assinaturas por usuário (histórico)
-- Mas apenas uma ativa por vez será controlada pela aplicação

-- Adicionar campos que podem estar faltando
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Criar índice composto para buscar assinatura ativa do usuário
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_active 
ON user_subscriptions(user_id, is_active) 
WHERE is_active = true;

-- Função para garantir apenas uma assinatura ativa por usuário
CREATE OR REPLACE FUNCTION ensure_single_active_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a nova assinatura está sendo marcada como ativa
  IF NEW.is_active = true AND NEW.status IN ('trial', 'active') THEN
    -- Desativar todas as outras assinaturas do usuário
    UPDATE user_subscriptions 
    SET is_active = false, updated_at = NOW()
    WHERE user_id = NEW.user_id 
    AND id != NEW.id 
    AND is_active = true;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para garantir apenas uma assinatura ativa
DROP TRIGGER IF EXISTS ensure_single_active_subscription_trigger ON user_subscriptions;
CREATE TRIGGER ensure_single_active_subscription_trigger
  BEFORE INSERT OR UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_active_subscription();
