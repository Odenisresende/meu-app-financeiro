-- Primeiro, vamos ajustar a tabela transactions para incluir user_id
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Criar índice para user_id para melhor performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);

-- Remover a política antiga que permitia acesso a todos
DROP POLICY IF EXISTS "Enable all operations for all users" ON public.transactions;

-- Criar políticas RLS baseadas no usuário autenticado
-- Usuários só podem ver suas próprias transações
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Usuários só podem inserir transações para si mesmos
CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários só podem atualizar suas próprias transações
CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE USING (auth.uid() = user_id);

-- Usuários só podem deletar suas próprias transações
CREATE POLICY "Users can delete own transactions" ON public.transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Criar tabela para perfis de usuário (opcional, para nomes/avatars)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Política para usuários atualizarem apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Política para inserir perfil na criação do usuário
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função quando um novo usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Atualizar transações existentes para o primeiro usuário (você)
-- Isso será feito via código quando você fizer login pela primeira vez
