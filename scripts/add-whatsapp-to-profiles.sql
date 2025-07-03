-- Adicionar campo WhatsApp à tabela de perfis
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Criar índice para busca por WhatsApp
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp ON profiles(whatsapp_number);

-- Adicionar comentário para documentação
COMMENT ON COLUMN profiles.whatsapp_number IS 'Número do WhatsApp do usuário para integração';

-- Verificar se a coluna foi criada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'whatsapp_number';
