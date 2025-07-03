-- Script para resetar assinatura de um usuário específico
-- CUIDADO: Este script remove TODOS os dados de assinatura do usuário

-- Substitua 'USER_EMAIL_HERE' pelo email do usuário
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Buscar o ID do usuário pelo email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'USER_EMAIL_HERE'; -- SUBSTITUA PELO EMAIL REAL
    
    IF target_user_id IS NOT NULL THEN
        -- Deletar todas as assinaturas do usuário
        DELETE FROM user_subscriptions WHERE user_id = target_user_id;
        
        -- Criar nova assinatura trial
        INSERT INTO user_subscriptions (
            user_id,
            status,
            trial_start_date,
            trial_end_date,
            is_active
        ) VALUES (
            target_user_id,
            'trial',
            NOW(),
            NOW() + INTERVAL '7 days',
            true
        );
        
        RAISE NOTICE 'Assinatura resetada para usuário: %', target_user_id;
    ELSE
        RAISE NOTICE 'Usuário não encontrado com email: USER_EMAIL_HERE';
    END IF;
END $$;
