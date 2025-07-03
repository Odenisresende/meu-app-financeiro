-- Versão 2 da tabela de assinaturas (mais completa)
DROP TABLE IF EXISTS user_subscriptions CASCADE;

CREATE TABLE user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Mercado Pago IDs
  mercadopago_subscription_id TEXT,
  mercadopago_payment_id TEXT,
  mercadopago_preference_id TEXT,
  
  -- Status e tipo
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'cancelled', 'expired', 'pending')),
  plan_type TEXT NOT NULL DEFAULT 'premium',
  
  -- Valores
  amount DECIMAL(10,2) NOT NULL DEFAULT 19.90,
  currency TEXT NOT NULL DEFAULT 'BRL',
  
  -- Datas do trial
  trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trial_end_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  
  -- Datas da assinatura
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  next_billing_date TIMESTAMP WITH TIME ZONE,
  last_payment_date TIMESTAMP WITH TIME ZONE,
  
  -- Informações de pagamento
  payment_method TEXT,
  failure_count INTEGER DEFAULT 0,
  
  -- Cancelamento
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadados
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id) -- Um usuário só pode ter uma assinatura ativa
);

-- Habilitar RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_mercadopago_subscription_id ON user_subscriptions(mercadopago_subscription_id);
CREATE INDEX idx_user_subscriptions_mercadopago_payment_id ON user_subscriptions(mercadopago_payment_id);
CREATE INDEX idx_user_subscriptions_trial_end_date ON user_subscriptions(trial_end_date);
CREATE INDEX idx_user_subscriptions_next_billing_date ON user_subscriptions(next_billing_date);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Função para iniciar trial automaticamente
CREATE OR REPLACE FUNCTION start_user_trial()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir trial automático para novos usuários
  INSERT INTO user_subscriptions (
    user_id,
    status,
    trial_start_date,
    trial_end_date
  ) VALUES (
    NEW.id,
    'trial',
    NOW(),
    NOW() + INTERVAL '7 days'
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para iniciar trial quando usuário se registra
CREATE TRIGGER on_user_created_start_trial
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION start_user_trial();
