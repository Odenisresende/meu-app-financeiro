-- Criar tabela de transações (versão corrigida)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

-- Criar políticas corretas
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
