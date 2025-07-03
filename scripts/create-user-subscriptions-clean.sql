-- CRIAR TABELA DE ASSINATURAS DOS USUÁRIOS
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
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_is_active ON user_subscriptions(is_active);

-- Comentários
COMMENT ON TABLE user_subscriptions IS 'Assinaturas dos usuários do app';
COMMENT ON COLUMN user_subscriptions.user_id IS 'ID único do usuário';
COMMENT ON COLUMN user_subscriptions.status IS 'Status: pending, active, cancelled, expired';
