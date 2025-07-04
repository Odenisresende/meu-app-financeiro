-- Script para adicionar colunas necessárias na tabela user_subscriptions
-- Verifica se as colunas já existem antes de tentar criar

DO $$ 
BEGIN
    -- Verificar se a coluna is_active já existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_subscriptions' 
        AND column_name = 'is_active'
    ) THEN
        -- Adicionar a coluna is_active se não existir
        ALTER TABLE user_subscriptions 
        ADD COLUMN is_active BOOLEAN DEFAULT false;
        
        RAISE NOTICE 'Coluna is_active adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna is_active já existe na tabela user_subscriptions';
    END IF;
    
    -- Verificar se a coluna preference_id existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_subscriptions' 
        AND column_name = 'preference_id'
    ) THEN
        -- Adicionar a coluna preference_id se não existir
        ALTER TABLE user_subscriptions 
        ADD COLUMN preference_id TEXT;
        
        RAISE NOTICE 'Coluna preference_id adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna preference_id já existe na tabela user_subscriptions';
    END IF;
    
END $$;

-- Verificar a estrutura final da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_subscriptions'
ORDER BY ordinal_position;
