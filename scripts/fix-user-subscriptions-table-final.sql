-- Recriar tabela user_subscriptions com todas as colunas necessárias
DROP TABLE IF EXISTS user_subscriptions CASCADE;

CREATE TABLE user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    subscription_id TEXT,
    preference_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    is_active BOOLEAN DEFAULT false,
    plan_type TEXT DEFAULT 'premium',
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_subscription_id ON user_subscriptions(subscription_id);
CREATE INDEX idx_user_subscriptions_preference_id ON user_subscriptions(preference_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_is_active ON user_subscriptions(is_active);

-- Comentário para documentação
COMMENT ON TABLE user_subscriptions IS 'Tabela para gerenciar assinaturas de usuários do Mercado Pago';
COMMENT ON COLUMN user_subscriptions.is_active IS 'Indica se a assinatura está ativa';
COMMENT ON COLUMN user_subscriptions.preference_id IS 'ID da preferência do Mercado Pago';
