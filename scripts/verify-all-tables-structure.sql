-- =====================================================
-- SCRIPT PARA VERIFICAR ESTRUTURA DAS TABELAS
-- =====================================================

-- 1. VERIFICAR TABELA PROFILES
DO $$
DECLARE
    col_count integer;
BEGIN
    -- Verificar se as colunas WhatsApp existem
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND table_schema = 'public'
    AND column_name IN ('whatsapp_opt_in', 'whatsapp_preferences');
    
    IF col_count = 2 THEN
        RAISE NOTICE '✅ PROFILES: Colunas WhatsApp OK';
    ELSE
        RAISE NOTICE '❌ PROFILES: Faltam colunas WhatsApp (%)', col_count;
    END IF;
END $$;

-- 2. VERIFICAR TABELA USER_SUBSCRIPTIONS
DO $$
DECLARE
    col_exists boolean;
BEGIN
    -- Verificar se billing_cycle existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_subscriptions' 
        AND table_schema = 'public'
        AND column_name = 'billing_cycle'
    ) INTO col_exists;
    
    IF col_exists THEN
        RAISE NOTICE '✅ USER_SUBSCRIPTIONS: Coluna billing_cycle OK';
    ELSE
        RAISE NOTICE '❌ USER_SUBSCRIPTIONS: Falta coluna billing_cycle';
    END IF;
END $$;

-- 3. VERIFICAR TABELA WEBHOOK_LOGS
DO $$
DECLARE
    table_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'webhook_logs' 
        AND table_schema = 'public'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ WEBHOOK_LOGS: Tabela existe';
    ELSE
        RAISE NOTICE '❌ WEBHOOK_LOGS: Tabela não existe';
    END IF;
END $$;

-- 4. VERIFICAR TABELA TRANSACTIONS
DO $$
DECLARE
    col_count integer;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns 
    WHERE table_name = 'transactions' 
    AND table_schema = 'public'
    AND column_name IN ('source', 'user_id', 'type', 'amount');
    
    IF col_count = 4 THEN
        RAISE NOTICE '✅ TRANSACTIONS: Estrutura OK';
    ELSE
        RAISE NOTICE '❌ TRANSACTIONS: Estrutura incompleta (%/4)', col_count;
    END IF;
END $$;

-- 5. RESUMO FINAL
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== RESUMO DA VERIFICAÇÃO ===';
    RAISE NOTICE '📊 Verificação concluída!';
    RAISE NOTICE '📱 Se todas as mensagens mostram ✅, seu banco está pronto!';
    RAISE NOTICE '❌ Se alguma mostra ❌, execute os scripts de correção primeiro.';
    RAISE NOTICE '';
END $$;

-- 6. MOSTRAR CONTAGEM DE REGISTROS
SELECT 
    'profiles' as tabela,
    COUNT(*) as registros
FROM public.profiles
UNION ALL
SELECT 
    'user_subscriptions' as tabela,
    COUNT(*) as registros  
FROM public.user_subscriptions
UNION ALL
SELECT 
    'transactions' as tabela,
    COUNT(*) as registros
FROM public.transactions
UNION ALL
SELECT 
    'webhook_logs' as tabela,
    COUNT(*) as registros
FROM public.webhook_logs;
