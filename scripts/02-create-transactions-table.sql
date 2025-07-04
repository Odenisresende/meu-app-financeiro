-- =====================================================
-- 💰 TABELA DE TRANSAÇÕES FINANCEIRAS
-- =====================================================

-- 1. Criar tabela de transações
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);

-- 3. Habilitar RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de segurança
DROP POLICY IF EXISTS "Usuários podem ver próprias transações" ON public.transactions;
CREATE POLICY "Usuários podem ver próprias transações"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir próprias transações" ON public.transactions;
CREATE POLICY "Usuários podem inserir próprias transações"
    ON public.transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar próprias transações" ON public.transactions;
CREATE POLICY "Usuários podem atualizar próprias transações"
    ON public.transactions FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar próprias transações" ON public.transactions;
CREATE POLICY "Usuários podem deletar próprias transações"
    ON public.transactions FOR DELETE
    USING (auth.uid() = user_id);

-- 5. Trigger para updated_at
DROP TRIGGER IF EXISTS handle_updated_at ON public.transactions;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. Comentários para documentação
COMMENT ON TABLE public.transactions IS 'Transações financeiras dos usuários';
COMMENT ON COLUMN public.transactions.amount IS 'Valor da transação (positivo para receitas, negativo para despesas)';
COMMENT ON COLUMN public.transactions.type IS 'Tipo: income (receita) ou expense (despesa)';

-- ✅ TABELA DE TRANSAÇÕES CRIADA COM SUCESSO
