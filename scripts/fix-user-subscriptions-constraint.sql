-- Corrigir tabela user_subscriptions com constraint única
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

-- RLS (Row Level Security)
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Permitir que o sistema (service_role) faça updates via webhook
CREATE POLICY "Service role can update subscriptions" ON user_subscriptions
    FOR UPDATE USING (true);
</merged_code>
