-- Corrigir tabela user_subscriptions SEM RLS para APIs funcionarem
DROP TABLE IF EXISTS user_subscriptions CASCADE;

CREATE TABLE user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    subscription_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    is_active BOOLEAN DEFAULT false,
    plan_type TEXT DEFAULT 'premium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_subscription_id ON user_subscriptions(subscription_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_is_active ON user_subscriptions(is_active);

-- NÃO habilitar RLS para permitir que as APIs funcionem
-- ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
