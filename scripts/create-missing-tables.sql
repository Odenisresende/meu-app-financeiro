-- CRIAR TABELA PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    whatsapp_number TEXT,
    whatsapp_opt_in BOOLEAN DEFAULT false,
    whatsapp_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CRIAR TABELA TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    date DATE NOT NULL,
    source TEXT DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HABILITAR RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA PROFILES
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- POLÍTICAS PARA TRANSACTIONS
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
    FOR DELETE USING (auth.uid() = user_id);

-- ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp ON profiles(whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);

-- FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- VERIFICAR SE TUDO FOI CRIADO
SELECT 'Tabelas profiles e transactions criadas com sucesso!' as status;
