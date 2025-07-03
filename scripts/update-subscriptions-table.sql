-- Atualizar tabela de assinaturas com novos campos
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS mercadopago_payment_id TEXT,
ADD COLUMN IF NOT EXISTS mercadopago_preference_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS failure_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;

-- Criar índices adicionais
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_payment_id ON user_subscriptions(mercadopago_payment_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_preference_id ON user_subscriptions(mercadopago_preference_id);

-- Atualizar função de trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
