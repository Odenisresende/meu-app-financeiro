-- Adicionar colunas WhatsApp na tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN DEFAULT false;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS whatsapp_preferences JSONB DEFAULT '{}';

-- Adicionar coluna billing_cycle na tabela user_subscriptions  
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly';

-- Verificar se as colunas foram criadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('whatsapp_opt_in', 'whatsapp_preferences');

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions' 
AND column_name = 'billing_cycle';
