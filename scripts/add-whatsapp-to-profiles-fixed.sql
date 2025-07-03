-- SCRIPT CORRIGIDO - Adicionar campo WhatsApp na tabela de perfis
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela profiles existe, se não, criar
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        -- Criar tabela profiles se não existir
        CREATE TABLE profiles (
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

        -- Habilitar RLS
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

        -- Criar políticas
        CREATE POLICY "Users can view own profile" ON profiles
            FOR SELECT USING (auth.uid() = id);

        CREATE POLICY "Users can update own profile" ON profiles
            FOR UPDATE USING (auth.uid() = id);

        CREATE POLICY "Users can insert own profile" ON profiles
            FOR INSERT WITH CHECK (auth.uid() = id);

        RAISE NOTICE 'Tabela profiles criada com sucesso';
    ELSE
        -- Adicionar colunas se a tabela já existir
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN DEFAULT false;
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_preferences JSONB DEFAULT '{}';
        
        RAISE NOTICE 'Colunas WhatsApp adicionadas à tabela profiles';
    END IF;
END $$;

-- 2. Adicionar campo WhatsApp se não existir
-- This step is now handled in the DO block above

-- 3. Criar índice para busca rápida se não existir
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp ON profiles(whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp_opt_in ON profiles(whatsapp_opt_in);

-- 4. Verificar se a tabela transactions existe e adicionar campo source se necessário
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' 
                   AND column_name = 'source') THEN
        ALTER TABLE public.transactions ADD COLUMN source TEXT DEFAULT 'manual';
    END IF;
END $$;

-- 5. Habilitar RLS na tabela profiles se não estiver habilitado
-- This step is now handled in the DO block above

-- 6. Criar políticas RLS para profiles se não existirem
-- This step is now handled in the DO block above

-- 7. Função para criar perfil automaticamente quando usuário se registra
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

-- 8. Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Criar tabela para mensagens WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    message_type TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Habilitar RLS na tabela de mensagens
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- 11. Políticas para mensagens WhatsApp
CREATE POLICY "Users can view own messages" ON whatsapp_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert messages" ON whatsapp_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can update messages" ON whatsapp_messages
    FOR UPDATE USING (true);

-- 12. Índices para performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_user_id ON whatsapp_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON whatsapp_messages(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_at ON whatsapp_messages(created_at);

-- 13. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 14. Trigger para atualizar updated_at nas mensagens
DROP TRIGGER IF EXISTS update_whatsapp_messages_updated_at ON whatsapp_messages;
CREATE TRIGGER update_whatsapp_messages_updated_at
    BEFORE UPDATE ON whatsapp_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 15. Trigger para atualizar updated_at nos perfis
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 16. Verificar se tudo foi criado corretamente
SELECT 
    'profiles' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('whatsapp_number', 'whatsapp_opt_in', 'whatsapp_preferences')

UNION ALL

SELECT 
    'whatsapp_messages' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'whatsapp_messages'
ORDER BY table_name, column_name;

-- 17. Comentários para documentação
COMMENT ON COLUMN profiles.whatsapp_number IS 'Número do WhatsApp do usuário (formato: +5511999999999)';
COMMENT ON COLUMN profiles.whatsapp_opt_in IS 'Se o usuário optou por receber mensagens no WhatsApp';
COMMENT ON COLUMN profiles.whatsapp_preferences IS 'Preferências de notificação do WhatsApp (JSON)';

COMMENT ON TABLE whatsapp_messages IS 'Log de todas as mensagens enviadas via WhatsApp';
COMMENT ON COLUMN whatsapp_messages.message_type IS 'Tipo da mensagem: reminder, report, alert, etc.';
COMMENT ON COLUMN whatsapp_messages.status IS 'Status: pending, sent, delivered, read, failed';

-- 18. Mostrar resultado
SELECT 'WhatsApp integration setup completed successfully!' as status;
