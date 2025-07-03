-- Criar tabela de assinaturas de usuários
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id TEXT UNIQUE,
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
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_subscription_id ON user_subscriptions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_is_active ON user_subscriptions(is_active);

-- RLS (Row Level Security)
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas próprias assinaturas
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Política para inserção (apenas o próprio usuário)
CREATE POLICY "Users can insert own subscriptions" ON user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para atualização (apenas o próprio usuário)
CREATE POLICY "Users can update own subscriptions" ON user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);
